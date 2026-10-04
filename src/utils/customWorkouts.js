import {
  DEFAULT_WORKOUT_DRAFT,
  WORKOUT_CATEGORY_NAMES,
  WORKOUT_DIFFICULTIES,
  WORKOUT_EQUIPMENT,
  WORKOUT_GOALS,
} from '../data/workoutCategories'

/**
 * Custom workout rules.
 *
 * A custom workout is the same shape as a built-in template, with two extra
 * fields (`type`, `createdAt` / `updatedAt`) and one rule difference: it lives
 * in localStorage rather than in code. Everything here is therefore defensive:
 * `normalizeCustomWorkouts` is the only way stored data reaches the UI, so a
 * half-written or hand-edited payload degrades into something renderable
 * instead of breaking the library.
 *
 * Nothing in this file touches storage or React.
 */

/** Marker stored on every saved workout so custom and built-ins stay distinct. */
export const CUSTOM_WORKOUT_TYPE = 'custom'

/** Prefix for generated ids, so a custom workout is recognisable at a glance. */
export const CUSTOM_WORKOUT_ID_PREFIX = 'custom-'

/** Human-readable validation messages, kept together like the auth ones. */
export const WORKOUT_MESSAGES = {
  nameRequired: 'Please give your workout a name.',
  nameTooLong: 'Workout names must be 60 characters or fewer.',
  descriptionTooLong: 'Descriptions must be 240 characters or fewer.',
  exerciseRequired: 'Add at least one exercise to your workout.',
  durationRequired: 'Estimated duration must be at least 1 minute.',
  setsInvalid: 'Sets must be a whole number of 1 or more.',
  repsInvalid: 'Reps must be a whole number of 1 or more.',
  restInvalid: 'Rest must be 0 seconds or more.',
  holdInvalid: 'Hold time must be 0 seconds or more.',
}

export const MAX_NAME_LENGTH = 60
export const MAX_DESCRIPTION_LENGTH = 240

/** Sensible starting numbers for an exercise added in the builder. */
export const DEFAULT_SETS = 3
export const DEFAULT_REPS = 10
export const DEFAULT_REST_SECONDS = 45

/**
 * A fresh id for a saved workout.
 *
 * Timestamp-based, so two workouts created in the same session still get
 * separate keys in the list and separate edit routes.
 *
 * @param {Date} [now]
 * @returns {string}
 */
export function createCustomWorkoutId(now = new Date()) {
  return `${CUSTOM_WORKOUT_ID_PREFIX}${now.getTime()}`
}

/** Whether a workout record is one the athlete saved (not a built-in template). */
export function isCustomWorkout(workout) {
  return (
    workout?.type === CUSTOM_WORKOUT_TYPE ||
    String(workout?.id ?? '').startsWith(CUSTOM_WORKOUT_ID_PREFIX)
  )
}

/** Round to a whole number, falling back when the value is not numeric. */
function toWholeNumber(value, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.round(number)
}

/** Clamp to a whole number inside a range. */
function clampWholeNumber(value, min, max, fallback) {
  return Math.min(Math.max(toWholeNumber(value, fallback), min), max)
}

/** Read a string field, trimmed. */
function toText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/** Pick a value from a controlled vocabulary, with a safe fallback. */
function pickOne(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback
}

/**
 * Clean one plan entry (`{ exerciseId, sets, reps, restSeconds }`).
 *
 * Numbers are clamped rather than rejected so a corrupt payload can never
 * render a row with "NaN reps" or a zero-set exercise. A timed hold drops its
 * reps entirely, because "1 rep" of a plank is meaningless.
 *
 * @param {unknown} entry
 * @returns {{exerciseId: string, sets: number, reps: number, restSeconds: number, durationSeconds: number}|null}
 */
export function normalizeWorkoutEntry(entry) {
  const exerciseId = toText(entry?.exerciseId)
  if (exerciseId === '') return null

  const durationSeconds = clampWholeNumber(entry?.durationSeconds, 0, 600, 0)

  return {
    exerciseId,
    sets: clampWholeNumber(entry?.sets, 1, 20, DEFAULT_SETS),
    // A timed hold has no reps at all, so they are dropped rather than left
    // behind as a stale "1 rep" that no screen ever shows.
    reps: durationSeconds > 0 ? 0 : clampWholeNumber(entry?.reps, 1, 200, DEFAULT_REPS),
    restSeconds: clampWholeNumber(entry?.restSeconds, 0, 600, DEFAULT_REST_SECONDS),
    durationSeconds,
  }
}

/**
 * Clean a workout's plan.
 *
 * Order is preserved (the athlete chose it) and duplicates are dropped, because
 * the same movement twice in one plan is always a mistake.
 *
 * @param {unknown} value
 * @returns {Array<{exerciseId: string, sets: number, reps: number, restSeconds: number, durationSeconds: number}>}
 */
export function normalizeWorkoutExercises(value) {
  if (!Array.isArray(value)) return []

  const seen = new Set()
  const exercises = []

  for (const entry of value) {
    const normalized = normalizeWorkoutEntry(entry)
    if (!normalized || seen.has(normalized.exerciseId)) continue

    seen.add(normalized.exerciseId)
    exercises.push(normalized)
  }

  return exercises
}

/**
 * Clean one stored workout.
 *
 * @param {unknown} value
 * @returns {object|null} `null` when the record has no usable id or name
 */
export function normalizeCustomWorkout(value) {
  const id = toText(value?.id)
  const name = toText(value?.name)

  if (id === '' || name === '') return null

  return {
    id,
    type: CUSTOM_WORKOUT_TYPE,
    name: name.slice(0, MAX_NAME_LENGTH),
    description: toText(value?.description).slice(0, MAX_DESCRIPTION_LENGTH),
    category: pickOne(value?.category, WORKOUT_CATEGORY_NAMES, DEFAULT_WORKOUT_DRAFT.category),
    goal: pickOne(value?.goal, WORKOUT_GOALS, DEFAULT_WORKOUT_DRAFT.goal),
    difficulty: pickOne(value?.difficulty, WORKOUT_DIFFICULTIES, DEFAULT_WORKOUT_DRAFT.difficulty),
    durationMinutes: clampWholeNumber(
      value?.durationMinutes,
      1,
      600,
      DEFAULT_WORKOUT_DRAFT.durationMinutes,
    ),
    equipment: pickOne(value?.equipment, WORKOUT_EQUIPMENT, DEFAULT_WORKOUT_DRAFT.equipment),
    targetMuscles: Array.isArray(value?.targetMuscles)
      ? value.targetMuscles.filter((muscle) => typeof muscle === 'string')
      : [],
    exercises: normalizeWorkoutExercises(value?.exercises),
    createdAt: typeof value?.createdAt === 'string' ? value.createdAt : null,
    updatedAt: typeof value?.updatedAt === 'string' ? value.updatedAt : null,
  }
}

/**
 * Clean a whole stored list.
 *
 * @param {unknown} value
 * @returns {object[]} always an array, newest entries last
 */
export function normalizeCustomWorkouts(value) {
  if (!Array.isArray(value)) return []

  const seen = new Set()
  const workouts = []

  for (const entry of value) {
    const workout = normalizeCustomWorkout(entry)
    if (!workout || seen.has(workout.id)) continue

    seen.add(workout.id)
    workouts.push(workout)
  }

  return workouts
}

/** The builder's blank draft. */
export function createWorkoutDraft() {
  return { ...DEFAULT_WORKOUT_DRAFT, exercises: [] }
}

/**
 * One plan entry with sensible starting numbers.
 *
 * Used when an exercise is added in the builder, and when the builder starts
 * from the temporary exercise selection.
 *
 * @param {string} exerciseId
 * @param {Partial<{sets: number, reps: number, restSeconds: number, durationSeconds: number}>} [overrides]
 * @returns {{exerciseId: string, sets: number, reps: number, restSeconds: number, durationSeconds: number}|null}
 */
export function createWorkoutEntry(exerciseId, overrides = {}) {
  return normalizeWorkoutEntry({
    exerciseId,
    sets: DEFAULT_SETS,
    reps: DEFAULT_REPS,
    restSeconds: DEFAULT_REST_SECONDS,
    ...overrides,
  })
}

/**
 * Apply an edit to a saved workout.
 *
 * The id and `createdAt` are preserved, so an edit never makes a workout look
 * new, and `updatedAt` moves forward instead.
 *
 * @param {object} existing the workout as it is stored today
 * @param {object} draft the builder's current form values
 * @param {Date} [now]
 * @returns {object|null} `null` when the draft is unusable or there is nothing to edit
 */
export function updateCustomWorkout(existing, draft = {}, now = new Date()) {
  if (!existing?.id) return null

  return normalizeCustomWorkout({
    ...draft,
    id: existing.id,
    type: CUSTOM_WORKOUT_TYPE,
    createdAt: existing.createdAt,
    updatedAt: now.toISOString(),
  })
}

/**
 * Turn a builder draft into a storable workout.
 *
 * `createdAt` is preserved when a draft is re-saved, so editing never makes a
 * workout look new.
 *
 * @param {object} draft
 * @param {Date} [now]
 * @returns {object}
 */
export function createCustomWorkout(draft = {}, now = new Date()) {
  const timestamp = now.toISOString()

  return normalizeCustomWorkout({
    id: createCustomWorkoutId(now),
    type: CUSTOM_WORKOUT_TYPE,
    name: draft.name,
    description: draft.description,
    category: draft.category,
    goal: draft.goal,
    difficulty: draft.difficulty,
    durationMinutes: draft.durationMinutes,
    equipment: draft.equipment,
    targetMuscles: draft.targetMuscles ?? [],
    exercises: draft.exercises,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

/**
 * Find one saved workout.
 *
 * @param {object[]} workouts
 * @param {string} id
 */
export function getCustomWorkout(workouts, id) {
  if (!Array.isArray(workouts) || typeof id !== 'string' || id === '') return null
  return workouts.find((workout) => workout.id === id) ?? null
}

/**
 * Insert a workout, or replace it when the id already exists.
 *
 * Used by both "save" and "save changes" so the list never grows duplicates.
 *
 * @param {object[]} workouts
 * @param {object} workout
 * @returns {object[]}
 */
export function upsertCustomWorkout(workouts, workout) {
  const list = Array.isArray(workouts) ? workouts : []
  const clean = normalizeCustomWorkout(workout)
  if (!clean) return list

  return [...list.filter((item) => item.id !== clean.id), clean]
}

/**
 * Remove a saved workout.
 *
 * @param {object[]} workouts
 * @param {string} id
 * @returns {object[]}
 */
export function removeCustomWorkout(workouts, id) {
  if (!Array.isArray(workouts)) return []
  return workouts.filter((workout) => workout.id !== id)
}

/**
 * Check one plan entry's numbers.
 *
 * Reps only matter for counted work: a timed hold (plank, stretch) uses
 * `durationSeconds` instead, so an unused reps value is not an error.
 *
 * @param {{sets?: number, reps?: number, restSeconds?: number, durationSeconds?: number}} entry
 * @returns {string[]} human-readable problems; empty means the entry is fine
 */
export function validateWorkoutEntry(entry) {
  const problems = []
  const hold = Number(entry?.durationSeconds) || 0

  if (!Number.isInteger(Number(entry?.sets)) || Number(entry.sets) < 1) {
    problems.push(WORKOUT_MESSAGES.setsInvalid)
  }

  if (hold > 0) {
    if (!Number.isInteger(hold) || hold < 0) problems.push(WORKOUT_MESSAGES.holdInvalid)
  } else if (!Number.isInteger(Number(entry?.reps)) || Number(entry.reps) < 1) {
    problems.push(WORKOUT_MESSAGES.repsInvalid)
  }

  if (!Number.isInteger(Number(entry?.restSeconds)) || Number(entry?.restSeconds) < 0) {
    problems.push(WORKOUT_MESSAGES.restInvalid)
  }

  return problems
}

/**
 * Validate the whole builder form.
 *
 * Returns only the failing keys, so the page can render messages next to the
 * field that caused them:
 *
 * ```js
 * { name: 'Please give your workout a name.', fields: { 'plank': ['Reps must be...'] } }
 * ```
 *
 * @param {object} draft
 * @returns {{name?: string, description?: string, durationMinutes?: string, exercises?: string, fields?: Object<string, string[]>}}
 */
export function validateWorkoutDraft(draft = {}) {
  const errors = {}
  const name = toText(draft.name)

  if (name === '') {
    errors.name = WORKOUT_MESSAGES.nameRequired
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = WORKOUT_MESSAGES.nameTooLong
  }

  if (toText(draft.description).length > MAX_DESCRIPTION_LENGTH) {
    errors.description = WORKOUT_MESSAGES.descriptionTooLong
  }

  if (!Number.isInteger(Number(draft.durationMinutes)) || Number(draft.durationMinutes) < 1) {
    errors.durationMinutes = WORKOUT_MESSAGES.durationRequired
  }

  const exercises = Array.isArray(draft.exercises) ? draft.exercises : []
  if (exercises.length === 0) {
    errors.exercises = WORKOUT_MESSAGES.exerciseRequired
  }

  const fields = {}
  exercises.forEach((entry, index) => {
    const problems = validateWorkoutEntry(entry)
    if (problems.length > 0) fields[`entry-${index}`] = problems
  })
  if (Object.keys(fields).length > 0) errors.fields = fields

  return errors
}