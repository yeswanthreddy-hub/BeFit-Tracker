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

/**
 * Basic totals for the progress overview.
 *
 * Only fields backed by real records are populated — anything without data
 * stays `null` so the UI can show an empty state instead of a made-up zero.
 */
export function getBasicTotals(completed = [], progress = []) {
  const totalWorkouts = totalCompleted(completed)

  const totalMinutes = Array.isArray(completed)
    ? completed.reduce((sum, item) => sum + (Number(item?.durationMinutes) || 0), 0)
    : 0

  let latestWeightKg = null
  let weightChangeKg = null

  if (Array.isArray(progress) && progress.length > 0) {
    const sorted = [...progress].sort((a, b) =>
      String(a?.date ?? '').localeCompare(String(b?.date ?? '')),
    )
    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    if (Number.isFinite(Number(last?.bodyWeightKg))) {
      latestWeightKg = Number(last.bodyWeightKg)
    }
    if (Number.isFinite(Number(first?.bodyWeightKg)) && latestWeightKg !== null) {
      weightChangeKg = Number((latestWeightKg - Number(first.bodyWeightKg)).toFixed(1))
    }
  }

  return { totalWorkouts, totalMinutes, latestWeightKg, weightChangeKg }
}

/**
 * Deterministic training recommendation from the onboarding answers.
 *
 * Pure rule lookup on `fitnessGoal` + `experienceLevel`. No AI, no network and
 * no randomness, so the same profile always produces the same suggestion.
 */
export function getRecommendation(profile = null) {
  const goal = profile?.fitnessGoal ?? ''
  const level = String(profile?.experienceLevel ?? '')
  const duration = Number(profile?.preferredWorkoutDuration) || 30
  const isBeginner = level.toLowerCase() === 'beginner'

  const RULES = [
    {
      when: () => goal === 'Build Muscle' && isBeginner,
      title: 'Beginner Strength Session',
      description: 'Learn the core lifts with controlled reps and full rest between sets.',
      focus: 'Full Body',
    },
    {
      when: () => goal === 'Build Muscle',
      title: 'Hypertrophy Push Day',
      description: 'Progressive volume across press and shoulder movements.',
      focus: 'Chest, Shoulders, Triceps',
    },
    {
      when: () => goal === 'Lose Weight',
      title: 'Conditioning Circuit',
      description: 'Short rests between movements to keep the pace up across the session.',
      focus: 'Full Body, Cardio',
    },
    {
      when: () => goal === 'Improve Strength',
      title: 'Strength Foundations',
      description: 'Focus on the main patterns: squat, hinge, push and pull.',
      focus: 'Legs, Back, Chest',
    },
    {
      when: () => goal === 'Improve Endurance',
      title: 'Cardio Conditioning',
      description: 'Interval work that builds your aerobic base steadily.',
      focus: 'Cardiovascular',
    },
  ]

  const match = RULES.find((rule) => rule.when())

  // Only the descriptive fields are returned; the matching predicate is an
  // implementation detail and has no business leaking into view data.
  return {
    title: match ? match.title : 'Full Body Starter',
    description: match
      ? match.description
      : 'A balanced session covering the main muscle groups.',
    focus: match ? match.focus : 'Full Body',
    durationMinutes: duration,
    goal,
    level,
  }
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