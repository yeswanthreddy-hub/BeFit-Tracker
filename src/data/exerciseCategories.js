/**
 * Canonical BeFit exercise categories.
 *
 * This is the single source of truth for the exercise library. Category
 * names, order and visual identifiers live here so no screen ever hardcodes
 * a muscle-group label: the library filter bar, the exercise cards, the
 * detail page and the landing-page tiles all read from this list.
 *
 * `accent` stays inside the BeFit palette (lime -> teal) so eight categories
 * still look like one product instead of a rainbow.
 *
 * @typedef {Object} ExerciseCategory
 * @property {string} id           slug used by the exercise visual, e.g. "full-body"
 * @property {string} name         display name, and the value used by `exercise.category`
 * @property {string} description  one line explaining what the category covers
 * @property {string} icon         visual identifier consumed by <ExerciseVisual />
 * @property {string} accent       accent colour used for the category's highlights
 */

/** @type {ExerciseCategory[]} */
export const EXERCISE_CATEGORIES = [
  {
    id: 'chest',
    name: 'Chest',
    description: 'Pressing movements that build pushing strength and upper-body control.',
    icon: 'chest',
    accent: '#b9f34a',
  },
  {
    id: 'back',
    name: 'Back',
    description: 'Pulling and posterior-chain work that improves posture and every upper lift.',
    icon: 'back',
    accent: '#2ac8b4',
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    description: 'Overhead and lateral work that adds pressing power and shoulder shape.',
    icon: 'shoulders',
    accent: '#d4ff7a',
  },
  {
    id: 'arms',
    name: 'Arms',
    description: 'Biceps and triceps work that finishes off the upper body.',
    icon: 'arms',
    accent: '#5ee0a8',
  },
  {
    id: 'legs',
    name: 'Legs',
    description: 'Squats, hinges and lunges for the largest muscle groups you own.',
    icon: 'legs',
    accent: '#22d3ee',
  },
  {
    id: 'core',
    name: 'Core',
    description: 'Midline strength and mobility that keeps every movement stable.',
    icon: 'core',
    accent: '#a3e635',
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Efficient sessions that train your whole body in one go.',
    icon: 'full-body',
    accent: '#39d7c9',
  },
  {
    id: 'cardio',
    name: 'Cardio',
    description: 'Conditioning that raises your engine and builds lasting endurance.',
    icon: 'cardio',
    accent: '#6ee7b7',
  },
]

/**
 * Category names in display order.
 *
 * Filters, pickers and legacy data models import this list instead of keeping
 * their own copy, so a category can never drift out of sync.
 *
 * @type {string[]}
 */
export const EXERCISE_CATEGORY_NAMES = EXERCISE_CATEGORIES.map((category) => category.name)

/** Look up a category record by its display name. */
export function getExerciseCategory(name) {
  return EXERCISE_CATEGORIES.find((category) => category.name === name) ?? null
}

/** Whether `name` is one of the canonical category names. */
export function isExerciseCategory(name) {
  return EXERCISE_CATEGORY_NAMES.includes(name)
}

/** Category used when an exercise carries an unknown category name. */
export const FALLBACK_CATEGORY_NAME = 'Full Body'

/**
 * Safe lookup used by rendering code, which must never assume a category
 * exists: an unknown name falls back to the full-body record.
 *
 * @param {string} name
 * @returns {ExerciseCategory}
 */
export function getExerciseCategoryOrFallback(name) {
  return (
    getExerciseCategory(name) ??
    getExerciseCategory(FALLBACK_CATEGORY_NAME) ??
    EXERCISE_CATEGORIES[EXERCISE_CATEGORIES.length - 1]
  )
}

/** How many exercises sit in each category, keyed by category name. */
export function countExercisesByCategory(exercises) {
  const counts = Object.fromEntries(EXERCISE_CATEGORY_NAMES.map((name) => [name, 0]))

  for (const exercise of exercises) {
    if (counts[exercise.category] !== undefined) {
      counts[exercise.category] += 1
    }
  }

  return counts
}