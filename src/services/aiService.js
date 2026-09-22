/**
 * AI Fitness Smart Tracker — architecture placeholder.
 *
 * The final BeFit app will send workout / food / progress summaries to
 * GroqCloud and surface human-readable insights.
 *
 * SECURITY: The Groq API key must NEVER be embedded in browser code or
 * committed to the repository (see .env.example / .gitignore). The real
 * implementation will call a secure gateway that holds the key, chosen as
 * part of the final deployment architecture. Only that later milestone
 * adds the actual network call.
 */

export function isAiAvailable() {
  return false
}

/**
 * Request AI fitness insights.
 * Stub for now — returns a soft "not available" response so consuming
 * screens can render their loading/empty states against a stable API.
 */
export async function getFitnessInsights() {
  return {
    available: false,
    message: 'AI insights arrive in a future milestone.',
  }
}