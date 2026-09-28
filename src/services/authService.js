/**
 * BeFit local authentication service.
 *
 * SECURITY NOTE — READ THIS FIRST
 * -------------------------------
 * BeFit has no backend and no database. Accounts, credentials and sessions
 * live in this browser's `localStorage`. The password below is stored exactly
 * as typed: it is NOT hashed, NOT encrypted and NOT protected in any way.
 * Anyone with access to this browser profile can read it from devtools.
 * This is an intentional local-only demo, not secure authentication, and it
 * offers no protection against a malicious user.
 *
 * Never reuse a real password here. A real deployment would need a server,
 * hashed credentials and a managed session.
 */

import { getItem, setItem, removeItem } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/storageKeys'
import {
  validateLoginForm,
  validateRegisterForm,
  AUTH_MESSAGES,
} from '../utils/validation'

const USERS_KEY = STORAGE_KEYS.users
const SESSION_KEY = STORAGE_KEYS.session
const PROFILE_KEY = STORAGE_KEYS.profile

export const DEFAULT_WORKOUT_DURATION = 30

/** Trim + lowercase an email so lookups are case-insensitive. */
export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function nowIso() {
  return new Date().toISOString()
}

/** Collision-resistant local id. Uses crypto.randomUUID when available. */
function createLocalId(prefix) {
  const hasUuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  const unique = hasUuid
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}-${unique}`
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/* ---------- users ---------- */

/**
 * Read the local user list. Corrupt or non-array payloads degrade to an
 * empty list instead of throwing, so a bad write can never break the app.
 */
export function readUsers() {
  const stored = getItem(USERS_KEY)
  if (!Array.isArray(stored)) return []
  return stored.filter((user) => isPlainObject(user) && typeof user.id === 'string')
}

function writeUsers(users) {
  return setItem(USERS_KEY, users)
}

export function getUserByEmail(email) {
  const target = normalizeEmail(email)
  if (!target) return null
  return readUsers().find((user) => normalizeEmail(user.email) === target) ?? null
}

export function getUserById(id) {
  if (!id) return null
  return readUsers().find((user) => user.id === id) ?? null
}

export function isEmailTaken(email) {
  return getUserByEmail(email) !== null
}

/* ---------- profile ---------- */

/** Build the fitness profile record that belongs to a new account. */
export function createProfileForUser(user) {
  return {
    userId: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    fitnessGoal: '',
    experienceLevel: '',
    preferredWorkoutDuration: DEFAULT_WORKOUT_DURATION,
    updatedAt: nowIso(),
  }
}

export function readProfile() {
  const stored = getItem(PROFILE_KEY)
  return isPlainObject(stored) ? stored : null
}

export function writeProfile(profile) {
  return setItem(PROFILE_KEY, profile)
}

/**
 * Return the stored profile, creating a default one when the account
 * predates onboarding or the key was never written. The account data is
 * never left without a profile.
 */
export function ensureProfileForUser(user) {
  if (!user) return null
  const profile = readProfile()
  if (profile && profile.userId === user.id) return profile
  const fresh = createProfileForUser(user)
  writeProfile(fresh)
  return fresh
}

/* ---------- session ---------- */

export function readSession() {
  const stored = getItem(SESSION_KEY)
  if (!isPlainObject(stored) || typeof stored.userId !== 'string' || !stored.userId) {
    return null
  }
  return { userId: stored.userId, loggedInAt: stored.loggedInAt ?? nowIso() }
}

export function startSession(userId) {
  const session = { userId, loggedInAt: nowIso() }
  setItem(SESSION_KEY, session)
  return session
}

export function clearSession() {
  return removeItem(SESSION_KEY)
}

/* ---------- registration ---------- */

/**
 * Create a local account.
 *
 * On success the user, a fresh profile and an initial session are written.
 * A newly created account is therefore never lost, and the visitor lands
 * straight inside BeFit.
 *
 * @returns {{ok: true, user: Object} | {ok: false, errors: Object}}
 */
export function registerUser(values) {
  const errors = validateRegisterForm(values, { isEmailTaken })
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const name = String(values.name).trim().replace(/\s+/g, ' ')
  const email = normalizeEmail(values.email)

  // Re-check under the normalised email so "A@B.com" cannot bypass the check.
  if (isEmailTaken(email)) {
    return { ok: false, errors: { email: AUTH_MESSAGES.emailTaken } }
  }

  const user = {
    id: createLocalId('user'),
    name,
    email,
    password: String(values.password),
    createdAt: nowIso(),
    fitnessGoal: '',
    experienceLevel: '',
    preferredWorkoutDuration: DEFAULT_WORKOUT_DURATION,
  }

  const users = readUsers()
  const saved = writeUsers([...users, user])
  if (!saved) {
    return {
      ok: false,
      errors: { form: 'We could not save your account in this browser. Check storage permissions and try again.' },
    }
  }

  writeProfile(createProfileForUser(user))
  startSession(user.id)

  return { ok: true, user }
}

/* ---------- profile updates ---------- */

/**
 * Persist the onboarding answers for an account.
 *
 * Only the three fitness fields are writable here; name, email and
 * createdAt always come from the user record.
 */
export function saveProfile(userId, updates = {}) {
  const user = getUserById(userId)
  if (!user) return null

  const current = ensureProfileForUser(user)
  const duration = Number(updates.preferredWorkoutDuration)
  const fallbackDuration = Number(current.preferredWorkoutDuration) || DEFAULT_WORKOUT_DURATION

  const next = {
    ...current,
    fitnessGoal: updates.fitnessGoal ?? current.fitnessGoal ?? '',
    experienceLevel: updates.experienceLevel ?? current.experienceLevel ?? '',
    preferredWorkoutDuration:
      Number.isFinite(duration) && duration > 0 ? duration : fallbackDuration,
    updatedAt: nowIso(),
  }

  writeProfile(next)
  return next
}

/* ---------- sign in / sign out ---------- */
/**
 * Check locally stored credentials and open a session.
 *
 * A wrong email and a wrong password return the same message so the form
 * never reveals which one was incorrect.
 *
 * @returns {{ok: true, user: Object} | {ok: false, errors?: Object, error?: string}}
 */
export function signIn({ email, password } = {}) {
  const errors = validateLoginForm({ email, password })
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const user = getUserByEmail(email)
  const storedPassword = user ? String(user.password ?? '') : ''
  const matches = user !== null && password === storedPassword

  if (!matches) {
    return { ok: false, error: AUTH_MESSAGES.invalidCredentials }
  }

  startSession(user.id)
  ensureProfileForUser(user)

  return { ok: true, user }
}

/**
 * End the active session.
 *
 * Only `befit_session` is removed — the account and its profile stay in
 * storage so logging back in restores everything.
 */
export function signOut() {
  return clearSession()
}
