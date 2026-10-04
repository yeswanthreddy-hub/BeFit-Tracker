import { EXERCISES } from '../data/exercises'

/**
 * Temporary workout selection.
 *
 * The foundation for the future workout builder: a short, ordered list of the
 * exercises an athlete has picked while browsing the library. Selecting an
 * exercise is *not* performing it — nothing here touches completed workouts,
 * streaks, calories or progress, and no rep or set is ever recorded.
 *
 * Records are deliberately tiny and serialisable:
 * `{ exerciseId, addedAt }` under the `befit_workout_builder` key.
 *
 * Every function is pure so the rules can be tested without React or storage.
 */

/** A fresh, empty selection. */
export const EMPTY_SELECTION = Object.freeze([])

/**
 * Coerce anything read from storage into a clean selection.
 *
 * localStorage can hold anything, and a half-written payload must never break
 * the library, so unknown shapes, duplicate ids and non-objects are dropped.
 *
 * @param {unknown} value
 * @returns {Array<{exerciseId: string, addedAt: string|null}>}
 */
export function normalizeSelection(value) {
  if (!Array.isArray(value)) return []

  const seen = new Set()
  const selection = []

  for (const entry of value) {
    const exerciseId = typeof entry === 'string' ? entry : entry?.exerciseId

    if (typeof exerciseId !== 'string' || exerciseId === '' || seen.has(exerciseId)) continue

    seen.add(exerciseId)
    selection.push({
      exerciseId,
      addedAt: typeof entry?.addedAt === 'string' ? entry.addedAt : null,
    })
  }

  return selection
}

/** Whether an exercise is already in the selection. */
export function isExerciseSelected(selection, exerciseId) {
  return normalizeSelection(selection).some((item) => item.exerciseId === exerciseId)
}

/**
 * Add an exercise. Selecting twice changes nothing, so the order stays stable.
 *
 * @param {Array} selection
 * @param {string} exerciseId
 * @param {Date} [now]
 */
export function addExercise(selection, exerciseId, now = new Date()) {
  const current = normalizeSelection(selection)
  if (typeof exerciseId !== 'string' || exerciseId === '' || isExerciseSelected(current, exerciseId)) {
    return current
  }

  return [...current, { exerciseId, addedAt: now.toISOString() }]
}

/** Remove an exercise; a no-op when it was not selected. */
export function removeExercise(selection, exerciseId) {
  return normalizeSelection(selection).filter((item) => item.exerciseId !== exerciseId)
}

/** Add when missing, remove when present. */
export function toggleExercise(selection, exerciseId, now = new Date()) {
  return isExerciseSelected(selection, exerciseId)
    ? removeExercise(selection, exerciseId)
    : addExercise(selection, exerciseId, now)
}

/** Empty the selection. */
export function clearSelection() {
  return [...EMPTY_SELECTION]
}

/** How many exercises are selected. */
export function selectionCount(selection) {
  return normalizeSelection(selection).length
}

/** The selected ids, in the order they were added. */
export function selectionExerciseIds(selection) {
  return normalizeSelection(selection).map((item) => item.exerciseId)
}

/**
 * Resolve the selected exercises against the catalog.
 *
 * Entries whose id no longer exists in the catalog are skipped, so renaming or
 * removing a movement can never render a blank row in the selection list.
 *
 * @param {Array} selection
 * @param {import('../data/exercises.js').Exercise[]} [exercises]
 * @returns {import('../data/exercises.js').Exercise[]}
 */
export function resolveSelection(selection, exercises = EXERCISES) {
  return selectionExerciseIds(selection)
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter(Boolean)
}