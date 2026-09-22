/**
 * BeFit data models.
 *
 * The typedefs document the shape each entity will take once the full
 * product is built. Factories provide safe defaults so new records can
 * never be missing required fields.
 */

export const EXERCISE_CATEGORIES = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Abs/Core',
  'Full Body',
  'Cardio',
]

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced']

export const FITNESS_GOALS = [
  'Build muscle',
  'Lose fat',
  'Get stronger',
  'Improve endurance',
  'Stay healthy',
]

export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack']

/**
 * @typedef {Object} Exercise
 * @property {string} id        unique slug, e.g. "ex-bench-press"
 * @property {string} name
 * @property {string} category  one of EXERCISE_CATEGORIES
 * @property {string} muscleGroup
 * @property {string} equipment
 * @property {string} difficulty one of EXPERIENCE_LEVELS
 * @property {string[]} instructions
 * @property {string[]} formTips
 */

/**
 * @typedef {Object} Workout
 * @property {string} id       unique slug, e.g. "wk-push-day"
 * @property {string} title
 * @property {string[]} focus  target categories
 * @property {number} durationMinutes
 * @property {string} difficulty
 * @property {Array<{exerciseId: string, sets: number, reps: string}>} exercises
 */

/**
 * @typedef {Object} WorkoutSet
 * @property {string} exerciseId
 * @property {number} sets
 * @property {string} reps
 */

/**
 * @typedef {Object} CompletedWorkout
 * @property {string} id
 * @property {string} workoutTitle
 * @property {string} date        ISO timestamp of completion
 * @property {number} durationMinutes
 * @property {number} totalSets
 * @property {WorkoutSet[]} exercises
 */

/**
 * @typedef {Object} FoodEntry
 * @property {string} id
 * @property {string} date
 * @property {string} meal  one of MEALS
 * @property {string} name
 * @property {number} calories
 * @property {number} protein
 * @property {number} carbs
 * @property {number} fat
 */

/**
 * @typedef {Object} ProgressEntry
 * @property {string} id
 * @property {string} date
 * @property {number} bodyWeightKg
 * @property {string} note
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} createdAt
 * @property {string|null} fitnessGoal
 * @property {string|null} experienceLevel
 * @property {number} preferredWorkoutDuration
 */

/**
 * @typedef {Object} Settings
 * @property {string} theme
 * @property {string} preferredUnits
 * @property {{streakReminder: boolean}} notifications
 */

/**
 * @typedef {Object} Streak
 * @property {number} current
 * @property {number} best
 * @property {string|null} lastWorkoutDate
 */

/* ---------- factories ---------- */

export function createUser({ name = '', email = '' } = {}) {
  return {
    id: `user-${Date.now()}`,
    name,
    email,
    createdAt: new Date().toISOString(),
    fitnessGoal: null,
    experienceLevel: null,
    preferredWorkoutDuration: 30,
  }
}

export function createExercise(partial) {
  return {
    id: '',
    name: '',
    category: 'Full Body',
    muscleGroup: '',
    equipment: '',
    difficulty: 'beginner',
    instructions: [],
    formTips: [],
    ...partial,
  }
}

export function emptyStreak() {
  return { current: 0, best: 0, lastWorkoutDate: null }
}

export function defaultSettings() {
  return {
    theme: 'dark',
    preferredUnits: 'metric',
    notifications: { streakReminder: true },
  }
}

export function defaultProfile() {
  return createUser({ name: 'Athlete', email: '' })
}