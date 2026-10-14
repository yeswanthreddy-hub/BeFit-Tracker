import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

import { handleFitnessRequest } from './api/ai/fitness.js'

const AI_ROUTE = '/api/ai/fitness'

/**
 * Serve the Groq proxy during `vite dev` and `vite preview`.
 *
 * The production app on Vercel runs `api/ai/fitness.js` as a serverless
 * function. Locally there is no Vercel runtime, so this middleware gives the
 * browser the same `POST /api/ai/fitness` endpoint by reusing the exact same
 * request handler. That keeps `npm run dev` working with no extra command and
 * no duplicated AI logic.
 */
function aiApiPlugin(env) {
  const middleware = async (req, res, next) => {
    if (req.method !== 'POST') {
      next()
      return
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')

    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 64 * 1024) req.destroy()
    })
    req.on('end', async () => {
      let body = null
      try {
        body = raw ? JSON.parse(raw) : null
      } catch {
        body = null
      }

      const { status, body: payload } = await handleFitnessRequest({
        method: req.method,
        body,
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL,
      })

      res.statusCode = status
      res.end(JSON.stringify(payload))
    })
  }

  return {
    name: 'befit-ai-api',
    configureServer(server) {
      server.middlewares.use(AI_ROUTE, middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(AI_ROUTE, middleware)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load every variable (not just VITE_-prefixed) so GROQ_API_KEY stays
  // server-side and is never exposed through import.meta.env in the browser.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), aiApiPlugin(env)],
  }
})
