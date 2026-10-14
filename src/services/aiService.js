/**
 * BeFit AI service (browser).
 *
 * The browser never talks to Groq directly and never sees the API key. Every
 * AI action goes through BeFit's own endpoint — in production the Vercel
 * function `api/ai/fitness.js`, locally the matching Vite dev middleware — and
 * only the resulting insight comes back.
 *
 * This module owns three things:
 *   1. the single `POST /api/ai/fitness` call
 *   2. normalising a result into the exact shape the UI renders
 *   3. mapping failures to safe, human-readable `AiError`s
 */

/** The one endpoint the browser is allowed to call for AI. */
export const AI_ENDPOINT = '/api/ai/fitness'

/** The controlled AI actions, mirroring the server's allow-list. */
export const AI_ACTIONS = Object.freeze([
  'daily-insight',
  'workout-recommendation',
  'nutrition-insight',
  'progress-review',
])

/** Human, secret-free fallbacks keyed by error code. */
const ERROR_MESSAGES = {
  not_configured: 'AI Fitness is not configured yet. Please configure the Groq API key in the server environment.',
  invalid_action: 'That AI action is not supported.',
  invalid_request: 'The AI request was invalid. Please try again.',
  rate_limit: 'The AI service is busy right now. Please try again in a moment.',
  network: "We couldn't reach the AI service. Please check your connection and try again.",
  timeout: 'The AI request took too long. Please try again.',
  provider_error: "We couldn't generate your insight right now. Please try again in a moment.",
  invalid_response: "We couldn't generate your insight right now. Please try again in a moment.",
  server: 'Something went wrong while generating your insight. Please try again.',
}

/** A safe error carrying a code and a message that is safe to display. */
export class AiError extends Error {
  constructor(code, message) {
    super(message || ERROR_MESSAGES[code] || ERROR_MESSAGES.server)
    this.name = 'AiError'
    this.code = code
  }
}

/**
 * Shape any payload into the exact result object the UI expects.
 *
 * This is the render guard: even if the server returned something unexpected,
 * the page only ever receives strings and arrays, never `undefined`.
 */
export function normaliseAiResult(raw) {
  if (typeof raw === 'string') {
    return {
      title: 'AI Fitness Insight',
      summary: raw.trim(),
      highlights: [],
      focusAreas: [],
      recommendations: [],
      nextStep: '',
    }
  }

  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}

  const text = (value) => (typeof value === 'string' ? value.trim() : '')
  const list = (value) =>
    Array.isArray(value)
      ? value.filter((item) => typeof item === 'string' && item.trim() !== '').map((item) => item.trim())
      : []

  return {
    title: text(source.title) || 'AI Fitness Insight',
    summary: text(source.summary),
    highlights: list(source.highlights),
    focusAreas: list(source.focusAreas),
    recommendations: list(source.recommendations),
    nextStep: text(source.nextStep),
  }
}

/**
 * Request one AI insight.
 *
 * @param {object} input
 * @param {string} input.action   one of `AI_ACTIONS`
 * @param {object} [input.context] sanitized fitness summary
 * @param {AbortSignal} [input.signal]
 * @returns {Promise<object>} the normalised result
 * @throws {AiError} with a safe, displayable message
 */
export async function generateFitnessAdvice({ action, context = {}, signal } = {}) {
  if (!AI_ACTIONS.includes(action)) {
    throw new AiError('invalid_action')
  }

  let response
  try {
    response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, context }),
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw new AiError('timeout')
    throw new AiError('network')
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const code =
      (payload && typeof payload.error === 'string' && payload.error) ||
      (response.status === 429 ? 'rate_limit' : response.status === 503 ? 'not_configured' : 'server')
    const message =
      (payload && typeof payload.message === 'string' && payload.message) || ERROR_MESSAGES[code]
    throw new AiError(code, message)
  }

  return normaliseAiResult(payload?.result)
}
