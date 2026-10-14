import { getItem, setItem } from './storage'
import { STORAGE_KEYS, userDataKey } from './storageKeys'
import { readSession } from '../services/authService'

/**
 * BeFit personalisation settings.
 *
 * Everything here is deliberately plain JavaScript: the settings shape, the
 * safe normaliser and the localStorage read/write helpers are kept out of the
 * React components so the UI stays a thin layer over this module.
 *
 * Settings belong to one account. They live under the account-scoped
 * `befit_u_<userId>_settings` key (the same key the rest of the app already
 * uses), so one local user can never read or overwrite another's preferences.
 */

/** Theme choices offered in Settings. `system` follows the OS preference. */
export const THEME_OPTIONS = [
  { value: 'system', label: 'System', description: 'Match your device appearance.' },
  { value: 'light', label: 'Light', description: 'Bright surfaces, dark text.' },
  { value: 'dark', label: 'Dark', description: 'The classic BeFit look.' },
]

export const THEME_VALUES = THEME_OPTIONS.map((option) => option.value)

/** Preferred workout style. Maps onto the existing workout categories. */
export const WORKOUT_STYLE_OPTIONS = [
  { value: 'Mixed', label: 'Mixed', description: 'A blend of strength, cardio and mobility.' },
  { value: 'Strength', label: 'Strength', description: 'Loaded sets and progressive weight.' },
  { value: 'Full Body', label: 'Full Body', description: 'Train the whole body each session.' },
  { value: 'Cardio', label: 'Cardio', description: 'Conditioning and endurance work.' },
  { value: 'Mobility', label: 'Mobility', description: 'Core control and range-of-motion work.' },
]

export const WORKOUT_STYLE_VALUES = WORKOUT_STYLE_OPTIONS.map((option) => option.value)

/**
 * Focus label each style suggests to the deterministic dashboard
 * recommendation. `Mixed` has no override, so the goal-based default stands.
 * Values reuse the canonical workout / exercise category names.
 */
export const WORKOUT_STYLE_FOCUS = {
  Strength: 'Strength',
  'Full Body': 'Full Body',
  Cardio: 'Cardio',
  Mobility: 'Core',
}

/** Defaults used only when a value is missing — never to overwrite a choice. */
export const DEFAULT_SETTINGS = Object.freeze({
  theme: 'system',
  reducedMotion: false,
  workoutReminders: true,
  nutritionReminders: true,
  aiInsights: true,
  showAiInsightsOnDashboard: true,
  preferredWorkoutStyle: 'Mixed',
})

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toBool(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

/**
 * Coerce anything read from localStorage into a complete, valid settings
 * object. Unknown keys are preserved (so future fields survive a round-trip)
 * while every known field is guaranteed to be present and valid.
 *
 * @param {unknown} value
 * @returns {typeof DEFAULT_SETTINGS & {userId?: string|null, updatedAt?: string|null}}
 */
export function normalizeSettings(value) {
  const source = isPlainObject(value) ? value : {}
  const notifications = isPlainObject(source.notifications) ? source.notifications : {}

  return {
    ...source,
    theme: THEME_VALUES.includes(source.theme) ? source.theme : DEFAULT_SETTINGS.theme,
    reducedMotion: toBool(source.reducedMotion, DEFAULT_SETTINGS.reducedMotion),
    workoutReminders: toBool(
      source.workoutReminders,
      toBool(notifications.streakReminder, DEFAULT_SETTINGS.workoutReminders),
    ),
    nutritionReminders: toBool(source.nutritionReminders, DEFAULT_SETTINGS.nutritionReminders),
    aiInsights: toBool(source.aiInsights, DEFAULT_SETTINGS.aiInsights),
    showAiInsightsOnDashboard: toBool(
      source.showAiInsightsOnDashboard,
      DEFAULT_SETTINGS.showAiInsightsOnDashboard,
    ),
    preferredWorkoutStyle: WORKOUT_STYLE_VALUES.includes(source.preferredWorkoutStyle)
      ? source.preferredWorkoutStyle
      : DEFAULT_SETTINGS.preferredWorkoutStyle,
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : null,
  }
}

/**
 * Apply a partial update on top of the current settings and stamp `updatedAt`.
 *
 * @param {unknown} current
 * @param {object} [updates]
 * @param {string|null} [userId]
 */
export function mergeSettings(current, updates = {}, userId = null) {
  const base = normalizeSettings(current)
  return normalizeSettings({
    ...base,
    ...updates,
    userId: userId ?? base.userId ?? null,
    updatedAt: new Date().toISOString(),
  })
}

/** Resolve the effective user id, falling back to the active session. */
function resolveUserId(userId) {
  if (userId) return userId
  return readSession()?.userId ?? null
}

/** The account-scoped storage key for settings. */
export function settingsStorageKey(userId = null) {
  return userDataKey(STORAGE_KEYS.settings, resolveUserId(userId))
}

/** Read settings for an account (or the session's account). */
export function getSettings(userId = null) {
  return normalizeSettings(getItem(settingsStorageKey(userId)))
}

/** Persist a complete settings object. Returns true on success. */
export function saveSettings(userId, settings) {
  const uid = resolveUserId(userId)
  const next = normalizeSettings({ ...settings, userId: uid, updatedAt: new Date().toISOString() })
  return setItem(userDataKey(STORAGE_KEYS.settings, uid), next)
}

/** Apply a partial update and persist. Returns the saved settings, or null. */
export function updateSettings(userId, updates = {}) {
  const uid = resolveUserId(userId)
  const next = mergeSettings(getSettings(uid), updates, uid)
  return setItem(userDataKey(STORAGE_KEYS.settings, uid), next) ? next : null
}

/** Restore the defaults for an account. Returns the fresh settings, or null. */
export function resetSettings(userId = null) {
  const uid = resolveUserId(userId)
  const fresh = normalizeSettings({ ...DEFAULT_SETTINGS, userId: uid, updatedAt: new Date().toISOString() })
  return setItem(userDataKey(STORAGE_KEYS.settings, uid), fresh) ? fresh : null
}
