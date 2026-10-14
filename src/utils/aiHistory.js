/**
 * BeFit AI insight history.
 *
 * Every AI result the athlete generates is kept in localStorage
 * (`befit_ai_insights`, scoped per account) so the dashboard can show the most
 * recent insight and the AI page can list previous ones. Nothing here touches
 * React or storage directly: these are pure helpers the hook and the components
 * share, and they can be unit tested with plain arrays.
 *
 * Each record is `{ id, userId, action, createdAt, result }`. The key itself is
 * already scoped to the account, so `userId` is belt-and-suspenders: it keeps
 * the record self-describing if it is ever read outside the scoped key.
 *
 * The list is deliberately small (the newest 10) and forgiving: a corrupt entry
 * is dropped rather than allowed to blank the whole history.
 */

import { EXERCISES } from '../data/exercises'

/** How many insights are kept in the local history. */
export const MAX_AI_INSIGHTS = 10

function toText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Coerce any stored result into the exact shape the UI renders.
 *
 * A mirror of the service's `normaliseAiResult` so a hand-edited or older
 * localStorage entry can never crash a render with a missing array.
 */
export function normaliseStoredResult(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const text = (item) => (typeof item === 'string' ? item.trim() : '')
  const list = (item) =>
    Array.isArray(item)
      ? item.filter((entry) => typeof entry === 'string' && entry.trim() !== '').map((entry) => entry.trim())
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

/** Read stored insights, dropping anything that is not a usable record. */
export function parseAiInsights(value) {
  if (!Array.isArray(value)) return []

  return value
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      id: toText(item.id),
      userId: toText(item.userId),
      action: toText(item.action),
      createdAt: toText(item.createdAt),
      result: normaliseStoredResult(item.result),
    }))
    .filter((item) => item.id !== '' && item.action !== '')
    .slice(0, MAX_AI_INSIGHTS)
}

/** Build one history entry from a freshly generated result. */
export function createAiInsight({ action, result, userId = '', now = new Date() } = {}) {
  const id = `ai-insight-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    userId: toText(userId),
    action: toText(action),
    createdAt: now.toISOString(),
    result: normaliseStoredResult(result),
  }
}

/** Prepend an entry, dropping a duplicate id, and cap the list. */
export function addAiInsight(history, entry, max = MAX_AI_INSIGHTS) {
  const list = Array.isArray(history) ? history : []
  const cap = Math.max(1, Math.floor(Number(max) || MAX_AI_INSIGHTS))
  if (!entry || typeof entry !== 'object') return list.slice(0, cap)
  const withoutDuplicate = list.filter((item) => item?.id !== entry.id)
  return [entry, ...withoutDuplicate].slice(0, cap)
}

/** The newest insight, or `null` when nothing has been generated. */
export function latestAiInsight(history) {
  return Array.isArray(history) && history.length > 0 ? history[0] : null
}

/** The newest insight for a given action, or `null`. */
export function latestAiInsightForAction(history, action) {
  if (!Array.isArray(history)) return null
  return history.find((item) => item?.action === action) ?? null
}

/** A short, locale-formatted timestamp for a history row. */
export function formatInsightTime(value) {
  const text = toText(value)
  if (text === '') return ''
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Find which BeFit library exercises an AI result mentions.
 *
 * The AI is told to prefer the BeFit library, but its answer is free text, so
 * this scans the rendered strings for each exercise's name and returns the
 * matching catalog records. Matching is case-insensitive and capped so a long
 * answer cannot flood the page; an unknown movement simply is not matched and
 * stays as plain advice (no fake exercise records are ever created).
 */
export function matchInsightExercises(result, exercises = EXERCISES, limit = 4) {
  if (!result || typeof result !== 'object') return []

  const strings = [
    result.title,
    result.summary,
    ...(Array.isArray(result.highlights) ? result.highlights : []),
    ...(Array.isArray(result.focusAreas) ? result.focusAreas : []),
    ...(Array.isArray(result.recommendations) ? result.recommendations : []),
    result.nextStep,
  ].filter((item) => typeof item === 'string' && item.trim() !== '')

  if (strings.length === 0) return []

  const haystack = strings.join(' \n ').toLowerCase()
  const catalog = Array.isArray(exercises) ? exercises : []
  const cap = Math.max(1, Math.floor(Number(limit) || 4))

  const matched = []
  for (const exercise of catalog) {
    const name = toText(exercise?.name)
    if (name === '' || !exercise?.id) continue
    if (haystack.includes(name.toLowerCase())) matched.push(exercise)
    if (matched.length >= cap) break
  }

  return matched
}
