import { getItem } from './storage'
import { userDataKey } from './storageKeys'
import { getUserById, readProfile, readSession } from '../services/authService'

/**
 * Helpers for reading the signed-in athlete.
 *
 * React components normally get the user and profile from `useAuth()`. These
 * helpers exist for non-React callers (utilities, tests) and for reading the
 * account-scoped collections that live under `befit_u_<userId>_…`, which must
 * always be resolved through the session's user id.
 */

/** The active session, or `null` when nobody is signed in. */
export function getCurrentSession() {
  return readSession()
}

/** The active account record, resolved through `befit_session`. */
export function getCurrentUser() {
  const session = readSession()
  if (!session) return null
  return getUserById(session.userId)
}

/** The fitness profile belonging to the active account. */
export function getCurrentProfile() {
  const session = readSession()
  if (!session) return null
  return readProfile(session.userId)
}

/** First name of an athlete, with a safe fallback. */
export function getDisplayName(user) {
  const name = typeof user?.name === 'string' ? user.name.trim() : ''
  const first = name.split(/\s+/).filter(Boolean)[0]
  return first || 'Athlete'
}

/** Two-letter initials for avatar chips. */
export function getUserInitials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'BF'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/**
 * Time-of-day greeting plus one contextual line.
 *
 * Uses the browser's local clock so the message matches what the athlete is
 * actually doing. Copy stays motivational rather than making any health claim.
 *
 * @param {Date} [now]
 * @returns {{greeting: string, context: string, period: 'morning'|'afternoon'|'evening'}}
 */
export function getGreeting(now = new Date()) {
  const hour = now.getHours()

  if (hour < 12) {
    return {
      greeting: 'Good morning',
      context: 'Ready to start your day strong?',
      period: 'morning',
    }
  }

  if (hour < 18) {
    return {
      greeting: 'Good afternoon',
      context: 'Keep your momentum going.',
      period: 'afternoon',
    }
  }

  return {
    greeting: 'Good evening',
    context: 'Finish the day with a strong session.',
    period: 'evening',
  }
}

/**
 * Read an account-scoped array such as completed workouts.
 *
 * The key is scoped with `userDataKey` so one local account can never see
 * another account's history. Non-array or corrupt payloads degrade to an
 * empty list instead of throwing.
 *
 * @param {string} key one of `STORAGE_KEYS`
 * @param {string|null} userId
 * @param {Array} [fallback]
 */
export function readUserCollection(key, userId, fallback = []) {
  const stored = getItem(userDataKey(key, userId))
  return Array.isArray(stored) ? stored : fallback
}