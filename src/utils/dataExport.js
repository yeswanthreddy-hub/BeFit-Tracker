import { clearBeFitData, getItem, removeItem, setItem } from './storage'
import { STORAGE_KEYS, userDataKey } from './storageKeys'

/**
 * BeFit data management (export / import / clearing).
 *
 * BeFit stores everything in this browser's localStorage, so this module is
 * the athlete's way to back up and restore their own fitness data.
 *
 * SECURITY NOTES
 * --------------
 * - Exports never contain the account password, the Groq API key or any
 *   session/secret. A final `sanitizeForExport` pass strips any such key even
 *   if one somehow reached the payload.
 * - Imports are treated purely as data. Only a fixed whitelist of fitness keys
 *   is written, scoped to the signed-in account. The user list, session,
 *   password and server configuration are never touched, so imported JSON can
 *   never change how sign-in works.
 */

export const EXPORT_APP = 'BeFit'
export const EXPORT_VERSION = 1

/** Keys stripped from an export no matter where they appear. */
const FORBIDDEN_KEYS = new Set([
  'password',
  'confirmpassword',
  'groq_api_key',
  'groqapikey',
  'apikey',
  'api_key',
  'secret',
  'token',
  'sessiontoken',
  'session',
  'authorization',
])

/**
 * The fitness data an export carries, keyed by the name used in the export
 * file. Each entry maps to a user-scoped localStorage key.
 */
const EXPORT_KEYS = {
  profile: { key: STORAGE_KEYS.profile, fallback: {} },
  settings: { key: STORAGE_KEYS.settings, fallback: {} },
  workouts: { key: STORAGE_KEYS.workouts, fallback: [] },
  completedWorkouts: { key: STORAGE_KEYS.completedWorkouts, fallback: [] },
  foodLogs: { key: STORAGE_KEYS.foodLog, fallback: [] },
  customFoods: { key: STORAGE_KEYS.foods, fallback: [] },
  nutritionProfile: { key: STORAGE_KEYS.nutritionProfile, fallback: {} },
  progress: { key: STORAGE_KEYS.progress, fallback: [] },
  streak: { key: STORAGE_KEYS.streak, fallback: {} },
  aiInsights: { key: STORAGE_KEYS.aiInsights, fallback: [] },
  aiPreferences: { key: STORAGE_KEYS.aiPreferences, fallback: {} },
}

/** Fitness keys removed by "Clear Fitness Data" (never the account itself). */
const FITNESS_KEYS = [
  STORAGE_KEYS.workouts,
  STORAGE_KEYS.completedWorkouts,
  STORAGE_KEYS.foodLog,
  STORAGE_KEYS.foods,
  STORAGE_KEYS.nutritionProfile,
  STORAGE_KEYS.progress,
  STORAGE_KEYS.streak,
  STORAGE_KEYS.aiInsights,
  STORAGE_KEYS.aiPreferences,
  STORAGE_KEYS.workoutBuilder,
  STORAGE_KEYS.activeSession,
]

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Deep-clone a value, dropping any sensitive key. The clone guarantees the
 * exported object is a fresh structure with no references back to storage.
 */
export function sanitizeForExport(value) {
  if (Array.isArray(value)) return value.map(sanitizeForExport)
  if (!isPlainObject(value)) return value

  const clean = {}
  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) continue
    clean[key] = sanitizeForExport(entry)
  }
  return clean
}

/** Collect every user-owned fitness record for an account. */
export function collectUserData(userId) {
  const data = {}
  for (const [name, { key, fallback }] of Object.entries(EXPORT_KEYS)) {
    const stored = getItem(userDataKey(key, userId))
    data[name] = stored === null ? fallback : stored
  }
  return data
}

/**
 * Build the downloadable export payload.
 *
 * @param {{id?: string, name?: string, email?: string}} [user]
 * @param {string|null} [userId]
 * @param {Date} [now]
 */
export function createExportPayload(user = null, userId = null, now = new Date()) {
  const data = collectUserData(userId)
  const payload = {
    app: EXPORT_APP,
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    user: {
      name: typeof user?.name === 'string' ? user.name : '',
      email: typeof user?.email === 'string' ? user.email : '',
    },
    ...data,
  }
  return sanitizeForExport(payload)
}

/** `befit-data-YYYY-MM-DD.json` for the given day. */
export function exportFileName(now = new Date()) {
  const iso = now.toISOString().slice(0, 10)
  return `befit-data-${iso}.json`
}

/** Trigger a browser download of a JSON payload. */
export function downloadJson(payload, filename = exportFileName()) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Parse and validate a candidate import payload.
 *
 * Returns `{ok:true, payload}` only when the file really looks like a BeFit
 * export. Any problem returns `{ok:false, message}` and nothing is written.
 */
export function parseImportPayload(raw) {
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      return { ok: false, message: "This file doesn't appear to be a valid BeFit data export." }
    }
  }

  if (!isPlainObject(data)) {
    return { ok: false, message: "This file doesn't appear to be a valid BeFit data export." }
  }

  if (data.app !== EXPORT_APP) {
    return { ok: false, message: "This file doesn't appear to be a valid BeFit data export." }
  }

  const version = Number(data.version)
  if (!Number.isInteger(version) || version < 1 || version > EXPORT_VERSION) {
    return { ok: false, message: 'This export was created by an unsupported BeFit version.' }
  }

  const hasFitnessData = Object.keys(EXPORT_KEYS).some((name) => data[name] !== undefined)
  if (!hasFitnessData) {
    return { ok: false, message: "This file doesn't appear to be a valid BeFit data export." }
  }

  return { ok: true, payload: data }
}

/**
 * Write an imported payload to the signed-in account.
 *
 * Only whitelisted fitness keys are written, and the profile is forced to
 * belong to `userId` so an import can never point at another account.
 *
 * @returns {number} how many keys were written
 */
export function applyImport(userId, user, payload) {
  if (!isPlainObject(payload)) return 0

  let written = 0
  for (const [name, { key }] of Object.entries(EXPORT_KEYS)) {
    if (payload[name] === undefined) continue

    let value = sanitizeForExport(payload[name])
    if (name === 'profile' && isPlainObject(value)) {
      value = {
        ...value,
        id: userId,
        userId,
        name: typeof user?.name === 'string' ? user.name : value.name,
        email: typeof user?.email === 'string' ? user.email : value.email,
      }
    }

    if (setItem(userDataKey(key, userId), value)) written += 1
  }
  return written
}

/** Remove the athlete's fitness history while keeping their account. */
export function clearFitnessData(userId) {
  let removed = 0
  for (const key of FITNESS_KEYS) {
    if (removeItem(userDataKey(key, userId))) removed += 1
  }
  return removed
}

/**
 * Delete every BeFit-owned key in this browser: account, profile, workouts,
 * nutrition, progress and settings. Irreversible.
 */
export function deleteAllLocalData() {
  return clearBeFitData()
}
