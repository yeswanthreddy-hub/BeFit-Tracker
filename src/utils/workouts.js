import { WORKOUTS } from '../data/workouts'
import {
  ANY_OPTION,
  WORKOUT_DIFFICULTIES,
  WORKOUT_DURATIONS,
  WORKOUT_EQUIPMENT,
  WORKOUT_GOALS,
  WORKOUT_CATEGORY_NAMES,
} from '../data/workoutCategories'
import { getExerciseById, normalizeQuery } from './exercises'

/**
 * Workout library helpers.
 *
 * Pure, framework-free functions shared by the workout library page, the
 * workout detail page, the builder and the dashboard's discovery section. All
 * of them accept the workout list as an argument so the same code serves the
 * built-in templates and an athlete's saved custom workouts.
 */

/**
 * Find one workout by its id.
 *
 * @param {string} id
 * @param {Array} [workouts]
 * @returns {object|null} `null` for an unknown id, which is how the detail
 *   page renders its not-found state instead of crashing
 */
export function getWorkoutById(id, workouts = WORKOUTS) {
  if (typeof id !== 'string' || id === '') return null
  return workouts.find((workout) => workout.id === id) ?? null
}

/**
 * Every field a workout search term is matched against.
 *
 * Name first, then the things people actually type: a goal, a muscle, or the
 * kit they own.
 */
const SEARCHABLE_FIELDS = ['name', 'description', 'category', 'goal', 'equipment']

/**
 * Whether one workout matches a search term.
 *
 * All words must match somewhere on the record, so "quick no equipment" narrows
 * the list instead of widening it.
 *
 * @param {object} workout
 * @param {string} query
 */
export function matchesWorkoutQuery(workout, query) {
  const term = normalizeQuery(query)
  if (term === '') return true

  const words = term.split(/\s+/)
  const haystack = [
    ...SEARCHABLE_FIELDS.map((field) => workout[field]),
    ...(workout.targetMuscles ?? []),
  ]
    .join(' ')
    .toLowerCase()

  return words.every((word) => haystack.includes(word))
}

/**
 * Search a collection of workouts. An empty term returns everything.
 *
 * @param {Array} workouts
 * @param {string} query
 */
export function searchWorkouts(workouts, query) {
  const term = normalizeQuery(query)
  if (term === '') return [...workouts]

  return workouts.filter((workout) => matchesWorkoutQuery(workout, term))
}

/** Filter names rendered as selects on the workout library page. */
export const WORKOUT_FILTERS = ['category', 'difficulty', 'goal', 'duration', 'equipment']

/** A filter set with nothing selected. */
export const DEFAULT_WORKOUT_FILTERS = Object.freeze({
  category: ANY_OPTION,
  difficulty: ANY_OPTION,
  goal: ANY_OPTION,
  duration: ANY_OPTION,
  equipment: ANY_OPTION,
})

/** Whether a single filter is restricting the results. */
function isSet(value) {
  return Boolean(value) && value !== ANY_OPTION
}

/** How many filters are narrowing the list. */
export function activeWorkoutFilterCount(filters) {
  return WORKOUT_FILTERS.filter((name) => isSet(filters?.[name])).length
}

/** Whether any filter or search term is active. */
export function isWorkoutQueryActive(filters, query = '') {
  return activeWorkoutFilterCount(filters) > 0 || normalizeQuery(query) !== ''
}

/**
 * Minute ranges behind the duration filter labels.
 *
 * Buckets rather than exact values, because a 25-minute session is "20 min"
 * to someone choosing what to fit in this evening.
 */
export const DURATION_RANGES = Object.freeze({
  '10 min': { max: 10 },
  '15 min': { min: 11, max: 15 },
  '20 min': { min: 16, max: 20 },
  '30 min': { min: 21, max: 30 },
  '45+ min': { min: 31 },
})

/** Whether a workout's duration falls inside a duration bucket. */
export function matchesDuration(durationMinutes, bucket) {
  if (!isSet(bucket)) return true

  const range = DURATION_RANGES[bucket]
  if (!range) return true

  const minutes = Number(durationMinutes) || 0
  if (range.min !== undefined && minutes < range.min) return false
  if (range.max !== undefined && minutes > range.max) return false
  return true
}

/**
 * Apply every filter at once.
 *
 * The selects are independent and combine with AND, so
 * Beginner + General Fitness + No Equipment returns only plans that satisfy all
 * three. An unset ("All") filter never removes anything.
 *
 * @param {Array} workouts
 * @param {Partial<typeof DEFAULT_WORKOUT_FILTERS>} [filters]
 */
export function filterWorkouts(workouts, filters = {}) {
  const { category, difficulty, goal, duration, equipment } = {
    ...DEFAULT_WORKOUT_FILTERS,
    ...filters,
  }

  return workouts.filter(
    (workout) =>
      (!isSet(category) || workout.category === category) &&
      (!isSet(difficulty) || workout.difficulty === difficulty) &&
      (!isSet(goal) || workout.goal === goal) &&
      (!isSet(equipment) || workout.equipment === equipment) &&
      matchesDuration(workout.durationMinutes, duration),
  )
}

/**
 * Human-readable count line for the library header.
 *
 * The number always comes from the current result set, so a filtered view can
 * never be mistaken for the size of the whole library.
 *
 * @param {number} count
 * @param {boolean} [isFiltered]
 * @returns {string} e.g. "15 workouts" or "3 workouts found"
 */
export function workoutCountLabel(count, isFiltered = false) {
  const noun = count === 1 ? 'workout' : 'workouts'
  return isFiltered ? `${count} ${noun} found` : `${count} ${noun}`
}

/** How many workouts sit in each category, keyed by category name. */
export function countWorkoutsByCategory(workouts) {
  const counts = Object.fromEntries(WORKOUT_CATEGORY_NAMES.map((name) => [name, 0]))

  for (const workout of workouts) {
    if (counts[workout.category] !== undefined) counts[workout.category] += 1
  }

  return counts
}

/**
 * The shortest workouts, for "something I can do right now" surfaces.
 *
 * Sorted by duration then name so the dashboard's discovery row is stable.
 *
 * @param {Array} [workouts]
 * @param {number} [limit]
 */
export function getQuickWorkouts(workouts = WORKOUTS, limit = 3) {
  return [...workouts]
    .sort((a, b) => a.durationMinutes - b.durationMinutes || a.name.localeCompare(b.name))
    .slice(0, limit)
}

/**
 * Resolve a workout's plan entries against the exercise catalog.
 *
 * Every UI surface reads exercise names, categories and muscles through here,
 * so a workout only ever stores an id. An entry whose exercise no longer exists
 * is skipped rather than rendered as a blank row.
 *
 * @param {{exercises?: Array}} workout
 * @returns {Array<{exercise: object, sets: number, reps: number, restSeconds: number, durationSeconds: number}>}
 */
export function resolveWorkoutExercises(workout) {
  const entries = Array.isArray(workout?.exercises) ? workout.exercises : []

  return entries
    .map((entry) => {
      const exercise = getExerciseById(entry?.exerciseId)
      if (!exercise) return null

      return {
        exercise,
        sets: Number(entry.sets) || 0,
        reps: Number(entry.reps) || 0,
        restSeconds: Math.max(0, Number(entry.restSeconds) || 0),
        durationSeconds: Math.max(0, Number(entry.durationSeconds) || 0),
      }
    })
    .filter(Boolean)
}

/**
 * One line describing the work in a plan entry.
 *
 * Timed holds ("3 × 30s") are labelled differently from counted reps, because
 * telling someone to do "3 × 1 reps" of a plank is meaningless.
 *
 * @param {{sets: number, reps: number, durationSeconds: number}} entry
 * @param {{compact?: boolean}} [options]
 * @returns {string} e.g. "3 sets × 12 reps" or "3 × 30s"
 */
export function workoutVolumeLabel(entry, { compact = false } = {}) {
  const sets = Number(entry?.sets) || 0
  const durationSeconds = Math.max(0, Number(entry?.durationSeconds) || 0)

  if (durationSeconds > 0) {
    return compact ? `${sets} × ${durationSeconds}s` : `${sets} sets × ${durationSeconds}s hold`
  }

  const reps = Number(entry?.reps) || 0
  return compact ? `${sets} × ${reps}` : `${sets} sets × ${reps} reps`
}

/** Rough seconds spent working one rep or one hold. */
const SECONDS_PER_REP = 3

/**
 * Estimate how long a workout takes, including rest.
 *
 * Used to sanity-check the authored `durationMinutes` and to show a live
 * estimate in the builder while someone is still editing sets and reps.
 *
 * @param {Array<{sets?: number, reps?: number, restSeconds?: number, durationSeconds?: number}>} exercises
 * @returns {number} whole minutes, never less than 1 for a non-empty plan
 */
export function estimateWorkoutMinutes(exercises) {
  const entries = Array.isArray(exercises) ? exercises : []
  const seconds = entries.reduce((total, entry) => {
    const sets = Math.max(0, Number(entry?.sets) || 0)
    const hold = Math.max(0, Number(entry?.durationSeconds) || 0)
    const work = hold > 0 ? hold : Math.max(0, Number(entry?.reps) || 0) * SECONDS_PER_REP

    return total + sets * (work + Math.max(0, Number(entry?.restSeconds) || 0))
  }, 0)

  if (entries.length === 0) return 0
  return Math.max(1, Math.round(seconds / 60))
}

/**
 * How one movement's equipment maps onto a workout's equipment.
 *
 * The workout scale is coarser on purpose (see `WORKOUT_EQUIPMENT`): a plan
 * built from a barbell curl needs "Gym Equipment", not "Barbell".
 */
const WORKOUT_EQUIPMENT_BY_EXERCISE = Object.freeze({
  Bodyweight: 'No Equipment',
  Dumbbell: 'Dumbbells',
  Barbell: 'Gym Equipment',
  Machine: 'Gym Equipment',
  'Resistance Band': 'Resistance Band',
})

/** Most demanding first: a plan is only "no equipment" when nothing needs gear. */
const EQUIPMENT_PRIORITY = ['Gym Equipment', 'Dumbbells', 'Resistance Band', 'No Equipment']

/**
 * The equipment a plan needs, derived from its movements.
 *
 * Derived rather than typed so the builder cannot contradict itself by saving
 * "No Equipment" for a plan full of dumbbell presses.
 *
 * @param {Array<{equipment?: string}>} exercises catalog exercises
 * @returns {string} one of `WORKOUT_EQUIPMENT`
 */
export function deriveWorkoutEquipment(exercises) {
  const needed = (Array.isArray(exercises) ? exercises : [])
    .map((exercise) => WORKOUT_EQUIPMENT_BY_EXERCISE[exercise?.equipment])
    .filter(Boolean)

  if (needed.length === 0) return 'No Equipment'
  return EQUIPMENT_PRIORITY.find((value) => needed.includes(value)) ?? 'No Equipment'
}

/** Keep the chip row readable on a plan that trains a lot of muscles. */
const MAX_DERIVED_MUSCLES = 6

/**
 * Target muscles for a plan, derived from its movements.
 *
 * Ordered by how many exercises train each muscle, so the muscles the plan is
 * actually about come first.
 *
 * @param {Array<{targetMuscles?: string[]}>} exercises catalog exercises
 * @returns {string[]}
 */
export function deriveWorkoutMuscles(exercises) {
  const counts = new Map()

  for (const exercise of Array.isArray(exercises) ? exercises : []) {
    for (const muscle of exercise?.targetMuscles ?? []) {
      counts.set(muscle, (counts.get(muscle) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_DERIVED_MUSCLES)
    .map(([muscle]) => muscle)
}

/**
 * Everything a plan says about itself, without anyone typing it twice.
 *
 * The builder calls this while the athlete edits and again on save, so the
 * duration, equipment and muscle chips on a saved custom workout always match
 * the exercises it actually contains.
 *
 * @param {Array<{exerciseId: string, sets?: number, reps?: number, restSeconds?: number, durationSeconds?: number}>} entries plan entries
 * @returns {{durationMinutes: number, equipment: string, targetMuscles: string[], exercises: Array}}
 */
export function deriveWorkoutPlan(entries) {
  const plan = Array.isArray(entries) ? entries : []
  const exercises = plan
    .map((entry) => getExerciseById(entry?.exerciseId))
    .filter(Boolean)

  return {
    durationMinutes: estimateWorkoutMinutes(plan),
    equipment: deriveWorkoutEquipment(exercises),
    targetMuscles: deriveWorkoutMuscles(exercises),
    exercises,
  }
}

export {
  ANY_OPTION,
  WORKOUT_CATEGORY_NAMES,
  WORKOUT_DIFFICULTIES,
  WORKOUT_DURATIONS,
  WORKOUT_EQUIPMENT,
  WORKOUT_GOALS,
}