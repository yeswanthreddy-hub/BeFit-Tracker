/**
 * Central registry of BeFit localStorage keys.
 *
 * Every key is namespaced with the `befit_` prefix so that
 * `clearBeFitData` can wipe BeFit data without touching any
 * unrelated localStorage keys owned by other applications.
 */
export const PREFIX = 'befit_'

/**
 * Prefix for data that belongs to a single athlete.
 *
 * Workouts, results, food and progress must never be shared between local
 * accounts, so those keys carry the account id:
 * `befit_u_<userId>_<name>`. The id segment keeps every athlete's copy
 * separate while `PREFIX` still makes them visible to `clearBeFitData`.
 */
export const USER_DATA_PREFIX = `${PREFIX}u_`

export const STORAGE_KEYS = {
  user: 'befit_user',
  users: 'befit_users',
  session: 'befit_session',
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

/**
 * Scope a user-owned key to a single account.
 *
 * `userDataKey(STORAGE_KEYS.workouts, 'user-1')` -> `befit_u_user-1_workouts`.
 *
 * Without an account id there is nothing to scope to, so the plain key is
 * returned unchanged. That keeps signed-out visitors working against the
 * original keys instead of writing to a `befit_u_undefined_` bucket.
 */
export function userDataKey(key, userId) {
  if (!userId) return key
  return `${USER_DATA_PREFIX}${userId}_${key.slice(PREFIX.length)}`
}