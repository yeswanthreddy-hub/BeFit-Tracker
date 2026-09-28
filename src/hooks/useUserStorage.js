import { useAuth } from './useAuth'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS, userDataKey } from '../utils/storageKeys'

/**
 * Storage keys that hold data belonging to one athlete rather than the app.
 *
 * Reading or writing any of these under the plain key would let a second
 * local account see the first one's training history, so they are always
 * accessed through `useUserStorage`, which scopes the key to the signed-in
 * account id.
 */
export const USER_OWNED_KEYS = new Set([
  STORAGE_KEYS.workouts,
  STORAGE_KEYS.completedWorkouts,
  STORAGE_KEYS.foodLog,
  STORAGE_KEYS.progress,
  STORAGE_KEYS.streak,
  STORAGE_KEYS.settings,
  STORAGE_KEYS.aiPreferences,
])

/**
 * `useLocalStorage` bound to the signed-in account.
 *
 * Behaves exactly like `useLocalStorage` for app-wide keys, but resolves the
 * key per user so switching accounts swaps the data. When no one is signed in
 * the key is left unscoped, which is what a signed-out visitor expects.
 */
export function useUserStorage(key, initialValue = null) {
  const { user } = useAuth()
  const scoped = USER_OWNED_KEYS.has(key) ? userDataKey(key, user?.id) : key
  return useLocalStorage(scoped, initialValue)
}
