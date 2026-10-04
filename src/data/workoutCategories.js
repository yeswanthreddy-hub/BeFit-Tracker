/**
 * Canonical BeFit workout categories and workout vocabularies.
 *
 * The exercise library has its own categories (`src/data/exerciseCategories.js`)
 * because a workout is a different thing from a movement: a workout is a plan
 * with a goal, a duration and an equipment requirement, so it needs names like
 * "Quick Workouts" or "Home" that would be meaningless on a single exercise.
 *
 * Accent colours stay inside the BeFit palette (lime -> teal) for the same
 * reason the exercise categories do: eleven categories still have to look like
 * one product.
 *
 * @typedef {Object} WorkoutCategory
 * @property {string} id          slug used by the workout visual, e.g. "quick"
 * @property {string} name        display name, and the value stored on a workout
 * @property {string} description one line explaining what the category covers
 * @property {string} icon        visual identifier consumed by <WorkoutVisual />
 * @property {string} accent      accent colour used for the category's highlights
 */

/** @type {WorkoutCategory[]} */
export const WORKOUT_CATEGORIES = [
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Efficient sessions that train everything in one circuit.',
    icon: 'full-body',
    accent: '#39d7c9',
  },
  {
    id: 'upper-body',
    name: 'Upper Body',
    description: 'Pushing, pulling and overhead work for the whole top half.',
    icon: 'upper-body',
    accent: '#b9f34a',
  },
  {
    id: 'lower-body',
    name: 'Lower Body',
    description: 'Squats, hinges and lunges for legs, glutes and calves.',
    icon: 'lower-body',
    accent: '#22d3ee',
  },
  {
    id: 'chest',
    name: 'Chest',
    description: 'Pressing volume for chest, triceps and shoulders.',
    icon: 'chest',
    accent: '#d4ff7a',
  },
  {
    id: 'back',
    name: 'Back',
    description: 'Pulling volume for lats, mid back and rear delts.',
    icon: 'back',
    accent: '#2ac8b4',
  },
  {
    id: 'core',
    name: 'Core',
    description: 'Midline strength and stability that supports every lift.',
    icon: 'core',
    accent: '#a3e635',
  },
  {
    id: 'cardio',
    name: 'Cardio',
    description: 'Conditioning that raises your engine and burns time.',
    icon: 'cardio',
    accent: '#6ee7b7',
  },
  {
    id: 'home',
    name: 'Home',
    description: 'Sessions you can run in a small room with no kit.',
    icon: 'home',
    accent: '#f9a8d4',
  },
  {
    id: 'strength',
    name: 'Strength',
    description: 'Loaded work built around sets, reps and progressive load.',
    icon: 'strength',
    accent: '#facc15',
  },
  {
    id: 'quick',
    name: 'Quick Workouts',
    description: 'Short sessions for the days you only have ten minutes.',
    icon: 'quick',
    accent: '#fb923c',
  },
]

/** Category names in display order. */
export const WORKOUT_CATEGORY_NAMES = WORKOUT_CATEGORIES.map((category) => category.name)

/** Look up a category record by its display name. */
export function getWorkoutCategory(name) {
  return WORKOUT_CATEGORIES.find((category) => category.name === name) ?? null
}

/** Whether `name` is one of the canonical workout category names. */
export function isWorkoutCategory(name) {
  return WORKOUT_CATEGORY_NAMES.includes(name)
}

/** Category used when a workout carries an unknown category name. */
export const FALLBACK_WORKOUT_CATEGORY_NAME = 'Full Body'

/**
 * Safe lookup for rendering code, which must never assume a category exists.
 *
 * @param {string} name
 * @returns {WorkoutCategory}
 */
export function getWorkoutCategoryOrFallback(name) {
  return (
    getWorkoutCategory(name) ??
    getWorkoutCategory(FALLBACK_WORKOUT_CATEGORY_NAME) ??
    WORKOUT_CATEGORIES[WORKOUT_CATEGORIES.length - 1]
  )
}

/**
 * Workout difficulty uses the exercise scale.
 *
 * Re-exporting the exercise list (instead of writing a second one) is what
 * guarantees a workout can never be "Advanced" while its hardest movement is
 * "Beginner".
 */
export { EXERCISE_DIFFICULTIES as WORKOUT_DIFFICULTIES } from './exercises'

/** Why someone trains a session. Drives the goal filter. */
export const WORKOUT_GOALS = [
  'Build Muscle',
  'Lose Weight',
  'Improve Strength',
  'Improve Endurance',
  'General Fitness',
]

/**
 * Equipment a workout needs, in plain language.
 *
 * Deliberately coarser than `EXERCISE_EQUIPMENT`: an athlete choosing a plan
 * thinks "do I own dumbbells?", not "is this movement Dumbbell or Barbell?".
 */
export const WORKOUT_EQUIPMENT = ['No Equipment', 'Dumbbells', 'Resistance Band', 'Gym Equipment']

/** Labels for the duration filter; the matching ranges live in `utils/workouts.js`. */
export const WORKOUT_DURATIONS = ['10 min', '15 min', '20 min', '30 min', '45+ min']

/** Value a filter uses to mean "no restriction". */
export const ANY_OPTION = 'All'

/** The starter workout used when an athlete builds their first custom plan. */
export const DEFAULT_WORKOUT_DRAFT = Object.freeze({
  name: '',
  description: '',
  category: FALLBACK_WORKOUT_CATEGORY_NAME,
  goal: 'General Fitness',
  difficulty: 'Beginner',
  durationMinutes: 20,
  equipment: 'No Equipment',
  exercises: [],
})