import { toDateKey } from './streak'

/**
 * Pure helpers that turn stored records into what the dashboard shows.
 *
 * Nothing here reads localStorage. The page collects records through
 * `useUserStorage` (which scopes the key to the signed-in account) and passes
 * them in, so the same helpers can be unit tested with plain arrays.
 */

/** Count of completed workouts total. */
export function totalCompleted(completed = []) {
  return Array.isArray(completed) ? completed.length : 0
}

/** Count of completed workouts in the current calendar week (Mon-Sun). */
export function weeklyCompleted(completed = [], now = new Date()) {
  if (!Array.isArray(completed) || completed.length === 0) return 0

  const weekStart = startOfWeek(now)
  return completed.filter((item) => {
    const dt = recordDate(item)
    if (!dt) return false
    return dt >= weekStart && dt <= now
  }).length
}

/** Count of completed workouts on the given day (defaults to today). */
export function completedOnDay(completed = [], now = new Date()) {
  const target = toDateKey(now)
  if (!target || !Array.isArray(completed)) return 0

  return completed.filter((item) => {
    const dt = recordDate(item)
    return dt ? toDateKey(dt) === target : false
  }).length
}

/**
 * Per-day active/inactive map for the current Mon-Sun week.
 * Returns an array of { label, key, isActive, isToday }.
 */
export function weeklyActivity(completed = [], now = new Date()) {
  const today = toDateKey(now)
  const weekStart = startOfWeek(now)

  const activeKeys = new Set(
    (Array.isArray(completed) ? completed : [])
      .map((item) => recordDate(item))
      .filter(Boolean)
      .map((date) => toDateKey(date))
      .filter(Boolean),
  )

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return labels.map((label, index) => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + index)
    const key = toDateKey(day)
    return {
      label,
      key,
      isActive: activeKeys.has(key),
      isToday: key === today,
    }
  })
}

/** Most recent completed workouts, newest first. */
export function recentActivity(completed = [], limit = 4) {
  if (!Array.isArray(completed)) return []

  return completed
    .map((item, index) => ({ item, index, dt: recordDate(item) }))
    .filter((entry) => entry.dt !== null)
    .sort((a, b) => b.dt - a.dt)
    .slice(0, limit)
    .map((entry) => ({
      id: entry.item.id ?? `completed-${entry.index}`,
      name: recordTitle(entry.item),
      date: entry.item.date,
      durationMinutes: Number(entry.item.durationMinutes) || 0,
      totalSets: Number(entry.item.totalSets) || 0,
    }))
}

/** Human label for a completed-workout record. */
export function recordTitle(item) {
  return item?.workoutTitle ?? item?.workoutName ?? 'Workout'
}

/** Parsed completion date, or `null` when the record has no usable date. */
export function recordDate(item) {
  if (!item) return null
  const raw = typeof item.date === 'string' ? item.date : item.completedAt
  if (typeof raw !== 'string') return null

  const dt = new Date(raw)
  return Number.isNaN(dt.getTime()) ? null : dt
}

/** Monday 00:00:00 local time for the week containing `now`. */
function startOfWeek(now) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0 = Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d
}