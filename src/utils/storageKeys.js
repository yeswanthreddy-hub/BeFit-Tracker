/**
 * Central registry of BeFit localStorage keys.
 *
 * Every key is namespaced with the `befit_` prefix so that
 * `clearBeFitData` can wipe BeFit data without touching any
 * unrelated localStorage keys owned by other applications.
 */
export const PREFIX = 'befit_'

export const STORAGE_KEYS = {
  user: 'befit_user',
  profile: 'befit_profile',
  workouts: 'befit_workouts',
  completedWorkouts: 'befit_completed_workouts',
  exercises: 'befit_exercises',
  foodLog: 'befit_food_log',
  progress: 'befit_progress',
  streak: 'befit_streak',
  settings: 'befit_settings',
  aiPreferences: 'befit_ai_preferences',
}