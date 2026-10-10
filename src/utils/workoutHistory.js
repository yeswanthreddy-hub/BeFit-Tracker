import { recordDate } from './dashboard'

/**
 * Completed-workout records.
 *
 * A finished session becomes one plain record that the dashboard, the streak
 * calculator and the history page all read. Building it in one place keeps the
 * field names every other screen depends on (`date`, `workoutName`,
 * `durationMinutes`, `totalSets`) in exactly one spot.
 *
 * Reading is deliberately forgiving: `parseCompletedWorkouts` never throws on a
 * corrupt payload, it just returns the entries it can understand, so one bad
 * record cannot blank out the whole history.
 */

/** The id prefix that ties a record back to the session that produced it. */
export const COMPLETED_ID_PREFIX = 'completed-'

/** Id for the record a given session produces, used to avoid duplicates. */
export function completedRecordId(sessionId) {
  return `${COMPLETED_ID_PREFIX}${sessionId}`
}

function toText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function toCount(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) return 0
  return Math.round(number)
}

/** Every stored record this codebase can render, as a new array. */
export function parseCompletedWorkouts(value) {
  if (!Array.isArray(value)) return []
  return value.filter((item) => item && typeof item === 'object' && !Array.isArray(item))
}

/**
 * Build the record for a just-finished session.
 *
 * `date` and `completedAt` are the same instant: the streak and dashboard
 * helpers read `date`, while `completedAt` reads naturally on a detail screen.
 * Returns `null` when there is no session or workout to attribute it to, which
 * is what stops a half-built session from inventing history.
 *
 * @param {object} input
 * @param {string} input.sessionId
 * @param {string} input.workoutId
 * @param {string} [input.workoutName]
 * @param {string} [input.userId]
 * @param {number} [input.durationSeconds]
 * @param {number} [input.exerciseCount]
 * @param {number} [input.completedExercises]
 * @param {number} [input.completedSets]
 * @param {number} [input.totalSets]
 * @param {string[]} [input.exerciseNames]
 * @param {Date} [now]
 * @returns {object|null}
 */
export function createCompletedRecord(input = {}, now = new Date()) {
  const sessionId = toText(input.sessionId)
  const workoutId = toText(input.workoutId)
  if (sessionId === '' || workoutId === '') return null

  const completedAt = now.toISOString()
  const durationSeconds = toCount(input.durationSeconds)

  return {
    id: completedRecordId(sessionId),
    sessionId,
    workoutId,
    workoutName: toText(input.workoutName) || 'Workout',
    userId: toText(input.userId) || null,
    completedAt,
    date: completedAt,
    durationSeconds,
    durationMinutes: durationSeconds > 0 ? Math.max(1, Math.round(durationSeconds / 60)) : 0,
    exerciseCount: toCount(input.exerciseCount),
    completedExercises: toCount(input.completedExercises),
    completedSets: toCount(input.completedSets),
    totalSets: toCount(input.totalSets),
    goal: toText(input.goal),
    difficulty: toText(input.difficulty),
    category: toText(input.category),
    exercises: Array.isArray(input.exerciseNames)
      ? input.exerciseNames.filter((name) => typeof name === 'string' && name !== '')
      : [],
  }
}

/** Whether a session has already been recorded, so "finish" stays idempotent. */
export function hasCompletedSession(records, sessionId) {
  const id = toText(sessionId)
  if (id === '' || !Array.isArray(records)) return false
  const target = completedRecordId(id)
  return records.some((item) => item && (item.sessionId === id || item.id === target))
}

/** One record by id. */
export function getCompletedById(records, id) {
  const target = toText(id)
  if (target === '' || !Array.isArray(records)) return null
  return records.find((item) => item && item.id === target) ?? null
}

/** Newest completion first; records without a usable date sink to the bottom. */
export function sortCompletedNewestFirst(records) {
  if (!Array.isArray(records)) return []
  return [...records].sort((a, b) => {
    const da = recordDate(a)
    const db = recordDate(b)
    const ta = da ? da.getTime() : Number.NEGATIVE_INFINITY
    const tb = db ? db.getTime() : Number.NEGATIVE_INFINITY
    return tb - ta
  })
}
