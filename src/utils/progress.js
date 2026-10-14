/**
 * Progress & analytics calculations.
 *
 * Every function here is pure: it takes the stored records (completed workouts,
 * food log, exercises, workouts) and returns plain numbers or objects. Nothing
 * reads localStorage and nothing touches React, so the progress page and the
 * dashboard share the exact same maths and it can all be unit tested with plain
 * arrays.
 *
 * The guiding rule is honesty: nothing is invented. A missing value is a zero
 * or an empty list, and a new account legitimately produces empty results that
 * the UI turns into an explicit empty state.
 */

import { toDateKey } from './streak'
import { parseCompletedWorkouts } from './workoutHistory'
import { recordDate, recordTitle } from './dashboard'
import {
  normalizeDateKey,
  normalizeNutritionProfile,
  parseFoodLog,
} from './nutrition'

/** Range value that means "no date filter". */
export const ALL_TIME = 0

/** The range choices offered by the progress page. */
export const RANGE_OPTIONS = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
  { value: ALL_TIME, label: 'All Time' },
]

/* ------------------------------------------------------------------ */
/* small date + number helpers                                         */
/* ------------------------------------------------------------------ */

function startOfDay(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(value, amount) {
  const date = new Date(value)
  date.setDate(date.getDate() + amount)
  return date
}

/** Start of the calendar week (Monday) for a given date. */
function startOfWeek(value) {
  const date = startOfDay(value)
  const day = date.getDay() // 0 = Sunday
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  return date
}

/** Every `YYYY-MM-DD` key from `from` to `to`, inclusive, oldest first. */
function dayKeysBetween(from, to) {
  const keys = []
  const start = startOfDay(from)
  const end = startOfDay(to)
  if (end < start) return keys
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    const key = toDateKey(cursor)
    if (key) keys.push(key)
  }
  return keys
}

/** A safe non-negative number. */
function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : fallback
}

/** Format seconds as "2h 35m" / "42m". Exported for the UI. */
export function formatDuration(totalSeconds = 0) {
  const seconds = Math.max(0, toNumber(totalSeconds))
  const totalMinutes = Math.floor(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
  return `${minutes}m`
}

/** Whether a date string falls inside the range that ends today. */
function isInRange(dateKey, rangeDays, now) {
  if (!dateKey) return false
  if (!rangeDays || rangeDays <= 0) return true
  const today = startOfDay(now)
  const start = addDays(today, -(rangeDays - 1))
  const target = startOfDay(new Date(`${dateKey}T00:00:00`))
  return target >= start && target <= today
}

/** Keep only the completed records whose date is inside the range. */
export function filterCompletedByRange(completed = [], rangeDays = ALL_TIME, now = new Date()) {
  const list = parseCompletedWorkouts(completed)
  if (!rangeDays || rangeDays <= 0) return list

  return list.filter((item) => {
    const date = recordDate(item)
    const key = date ? toDateKey(date) : null
    return isInRange(key, rangeDays, now)
  })
}

/* ------------------------------------------------------------------ */
/* workout progress                                                    */
/* ------------------------------------------------------------------ */

/**
 * Headline workout numbers from a list of completed records.
 *
 * Durations come from `durationSeconds`; a record with no usable duration
 * simply contributes zero rather than producing `NaN`. Active days are the
 * unique calendar days with at least one completion, so several workouts on the
 * same day still count as one active day but as several workouts.
 */
export function getWorkoutProgress(completed = []) {
  const list = parseCompletedWorkouts(completed)

  const daySet = new Set()
  let totalSeconds = 0
  let longestSeconds = 0
  let shortestSeconds = 0
  let haveShortest = false
  let firstDate = null
  let lastDate = null

  for (const item of list) {
    const date = recordDate(item)
    if (date) {
      const key = toDateKey(date)
      if (key) daySet.add(key)
      if (!firstDate || date < firstDate) firstDate = date
      if (!lastDate || date > lastDate) lastDate = date
    }

    const seconds = toNumber(item?.durationSeconds)
    totalSeconds += seconds
    if (seconds > longestSeconds) longestSeconds = seconds
    if (seconds > 0 && (!haveShortest || seconds < shortestSeconds)) {
      shortestSeconds = seconds
      haveShortest = true
    }
  }

  const count = list.length
  const averageSeconds = count > 0 ? Math.round(totalSeconds / count) : 0

  return {
    total: count,
    activeDays: daySet.size,
    totalSeconds,
    totalLabel: formatDuration(totalSeconds),
    averageSeconds,
    averageLabel: formatDuration(averageSeconds),
    longestSeconds,
    longestLabel: formatDuration(longestSeconds),
    shortestSeconds: haveShortest ? shortestSeconds : 0,
    shortestLabel: haveShortest ? formatDuration(shortestSeconds) : '—',
    firstDate,
    lastDate,
  }
}

/**
 * Completed workouts bucketed for the activity chart.
 *
 * 7 days are shown one bar per day. Longer ranges group into weeks (30/90 days)
 * or months (all time) so the chart stays readable. Every bucket is a real count
 * from completion dates — empty buckets are honest zeroes.
 */
export function getWorkoutActivity(completed = [], rangeDays = 30, now = new Date()) {
  const list = parseCompletedWorkouts(completed)
  const counts = new Map()
  for (const item of list) {
    const date = recordDate(item)
    const key = date ? toDateKey(date) : null
    if (key) counts.set(key, (counts.get(key) || 0) + 1)
  }

  const buckets = []

  if (rangeDays > 0 && rangeDays <= 7) {
    const keys = dayKeysBetween(addDays(now, -(rangeDays - 1)), now)
    for (const key of keys) {
      buckets.push({ key, label: shortDay(key), count: counts.get(key) || 0 })
    }
    return { buckets, bucketSize: 'day' }
  }

  if (rangeDays > 0) {
    // Weekly buckets (Mon-Sun) covering the range.
    const firstMonday = startOfWeek(addDays(now, -(rangeDays - 1)))
    for (let start = firstMonday; start <= now; start = addDays(start, 7)) {
      let count = 0
      for (let offset = 0; offset < 7; offset += 1) {
        const key = toDateKey(addDays(start, offset))
        if (key) count += counts.get(key) || 0
      }
      buckets.push({ key: toDateKey(start), label: shortDate(start), count })
    }
    return { buckets, bucketSize: 'week' }
  }

  // All time: monthly buckets from the first completion to now.
  const dates = list.map((item) => recordDate(item)).filter(Boolean)
  if (dates.length === 0) return { buckets, bucketSize: 'month' }

  const earliest = dates.reduce((min, date) => (date < min ? date : min), dates[0])
  let cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 1)

  while (cursor <= end) {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    let count = 0
    for (const [key, value] of counts) {
      if (key.startsWith(prefix)) count += value
    }
    buckets.push({
      key: prefix,
      label: cursor.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      count,
    })
    cursor = new Date(year, month + 1, 1)
  }

  return { buckets, bucketSize: 'month' }
}

/**
 * This week's Monday-to-Sunday activity, for the consistency strip.
 *
 * Returns one entry per day with an explicit `isActive` flag and `isToday`
 * marker so the UI can describe a day with text, not just a colour.
 */
export function getCurrentWeekConsistency(completed = [], now = new Date()) {
  const list = parseCompletedWorkouts(completed)
  const weekStart = startOfWeek(now)
  const todayKey = toDateKey(now)

  const activeKeys = new Set()
  for (const item of list) {
    const date = recordDate(item)
    const key = date ? toDateKey(date) : null
    if (key) activeKeys.add(key)
  }

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return labels.map((label, index) => {
    const day = addDays(weekStart, index)
    const key = toDateKey(day)
    return {
      label,
      key,
      isActive: activeKeys.has(key),
      isToday: key === todayKey,
    }
  })
}

/**
 * Completed workouts grouped by workout category.
 *
 * A record without a category is counted under "Other" rather than dropped, so
 * the bars always add up to the total.
 */
export function getWorkoutCategoryStats(completed = []) {
  const list = parseCompletedWorkouts(completed)
  const counts = new Map()

  for (const item of list) {
    const name = typeof item?.category === 'string' && item.category.trim() !== ''
      ? item.category.trim()
      : 'Other'
    counts.set(name, (counts.get(name) || 0) + 1)
  }

  const total = list.length || 1
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Muscle groups trained, counted by how many completed workouts included them.
 *
 * A completed record stores the workout it came from; resolving that workout to
 * its exercises and each exercise to its `targetMuscles` is what makes this real
 * rather than invented. Unknown or deleted references are skipped safely.
 */
export function getMuscleGroupStats(completed = [], workouts = [], exercises = []) {
  const list = parseCompletedWorkouts(completed)

  const workoutIndex = new Map()
  for (const workout of Array.isArray(workouts) ? workouts : []) {
    if (workout?.id) workoutIndex.set(workout.id, workout)
  }
  const exerciseIndex = new Map()
  for (const exercise of Array.isArray(exercises) ? exercises : []) {
    if (exercise?.id) exerciseIndex.set(exercise.id, exercise)
  }

  const counts = new Map()
  for (const item of list) {
    const workout = workoutIndex.get(item?.workoutId)
    if (!workout || !Array.isArray(workout.exercises)) continue

    const muscles = new Set()
    for (const entry of workout.exercises) {
      const exercise = exerciseIndex.get(entry?.exerciseId)
      const targets = exercise?.targetMuscles
      if (!Array.isArray(targets)) continue
      for (const muscle of targets) {
        if (typeof muscle === 'string' && muscle.trim() !== '') muscles.add(muscle.trim())
      }
    }

    for (const muscle of muscles) {
      counts.set(muscle, (counts.get(muscle) || 0) + 1)
    }
  }

  const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0) || 1
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
}

/** Duration figures (total, average, longest, shortest) for a range. */
export function getWorkoutDurationStats(completed = [], rangeDays = ALL_TIME, now = new Date()) {
  return getWorkoutProgress(filterCompletedByRange(completed, rangeDays, now))
}

/**
 * Active-day consistency across a range.
 *
 * `activeDays` counts unique workout days; `pct` is active days over the number
 * of days in the range, which is what "how often am I working out" really asks.
 */
export function getConsistencyStats(completed = [], rangeDays = 30, now = new Date()) {
  const scoped = filterCompletedByRange(completed, rangeDays, now)
  const progress = getWorkoutProgress(scoped)

  const totalDays = !rangeDays || rangeDays <= 0
    ? progress.activeDays || 1
    : rangeDays

  return {
    activeDays: progress.activeDays,
    totalDays,
    workouts: progress.total,
    percent: Math.round((progress.activeDays / Math.max(1, totalDays)) * 100),
  }
}

/* ------------------------------------------------------------------ */
/* nutrition progress                                                  */
/* ------------------------------------------------------------------ */

/** Calories, protein, carbs and fats grouped by calendar day. */
function nutritionByDay(foodLog = []) {
  const logs = parseFoodLog(foodLog)
  const byDay = new Map()

  for (const entry of logs) {
    const key = normalizeDateKey(entry.date)
    if (!key) continue
    const day = byDay.get(key) || { calories: 0, protein: 0, carbs: 0, fats: 0 }
    day.calories += toNumber(entry.calories)
    day.protein += toNumber(entry.protein)
    day.carbs += toNumber(entry.carbs)
    day.fats += toNumber(entry.fats)
    byDay.set(key, day)
  }

  return byDay
}

/**
 * Nutrition averages and protein-goal success for a range.
 *
 * Averages are taken over days that actually have food logged, and days with no
 * records are never counted as failures of the protein goal — only tracked days
 * are judged.
 */
export function getNutritionProgress(foodLog = [], profile = {}, rangeDays = ALL_TIME, now = new Date()) {
  const totals = normalizeNutritionProfile(profile)
  const byDay = nutritionByDay(foodLog)
  const targetProtein = totals.dailyProteinTarget

  const loggedKeys = []
  for (const key of byDay.keys()) {
    if (isInRange(key, rangeDays, now)) loggedKeys.push(key)
  }

  if (loggedKeys.length === 0) {
    return {
      daysLogged: 0,
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFats: 0,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      proteinTarget: targetProtein,
      proteinSuccessDays: 0,
      proteinSuccessPercent: 0,
    }
  }

  let sumCalories = 0
  let sumProtein = 0
  let sumCarbs = 0
  let sumFats = 0
  let successDays = 0

  for (const key of loggedKeys) {
    const day = byDay.get(key)
    sumCalories += day.calories
    sumProtein += day.protein
    sumCarbs += day.carbs
    sumFats += day.fats
    if (targetProtein > 0 && day.protein >= targetProtein - 0.5) successDays += 1
  }

  const count = loggedKeys.length
  return {
    daysLogged: count,
    avgCalories: Math.round(sumCalories / count),
    avgProtein: Math.round(sumProtein / count),
    avgCarbs: Math.round(sumCarbs / count),
    avgFats: Math.round(sumFats / count),
    totalCalories: Math.round(sumCalories),
    totalProtein: Math.round(sumProtein),
    totalCarbs: Math.round(sumCarbs),
    totalFats: Math.round(sumFats),
    proteinTarget: targetProtein,
    proteinSuccessDays: successDays,
    proteinSuccessPercent: targetProtein > 0 ? Math.round((successDays / count) * 100) : 0,
  }
}

/**
 * One point per day in the range, for the calorie and protein trend charts.
 *
 * Days without food still produce a zero point so the line has a real shape, and
 * future dates are never included because the range always ends today.
 */
export function getNutritionTrend(foodLog = [], rangeDays = 30, now = new Date()) {
  const byDay = nutritionByDay(foodLog)

  let keys
  if (!rangeDays || rangeDays <= 0) {
    const logged = Array.from(byDay.keys()).sort()
    if (logged.length === 0) return []
    keys = dayKeysBetween(new Date(`${logged[0]}T00:00:00`), now)
  } else {
    keys = dayKeysBetween(addDays(now, -(rangeDays - 1)), now)
  }

  return keys.map((key) => {
    const day = byDay.get(key) || { calories: 0, protein: 0, carbs: 0, fats: 0 }
    return {
      date: key,
      label: shortDay(key),
      calories: Math.round(day.calories),
      protein: Math.round(day.protein),
      carbs: Math.round(day.carbs),
      fats: Math.round(day.fats),
    }
  })
}

/** Calories-over-time points (a thin wrapper kept for a readable call site). */
export function getCalorieTrend(foodLog = [], rangeDays = 30, now = new Date()) {
  return getNutritionTrend(foodLog, rangeDays, now)
}

/** Protein-over-time points. */
export function getProteinTrend(foodLog = [], rangeDays = 30, now = new Date()) {
  return getNutritionTrend(foodLog, rangeDays, now)
}

/* ------------------------------------------------------------------ */
/* insights                                                            */
/* ------------------------------------------------------------------ */

/**
 * Plain-language insights derived only from the numbers passed in.
 *
 * Deterministic: the same data always produces the same lines. No AI, no
 * randomness, no claims the data does not support.
 */
export function getProgressInsights({
  workoutProgress,
  nutritionProgress,
  categoryStats = [],
  muscleStats = [],
  consistency,
  hasWorkouts,
  hasNutrition,
} = {}) {
  const insights = []

  if (!hasWorkouts) {
    insights.push('Complete your first workout to start building your progress history.')
  }
  if (!hasNutrition) {
    insights.push('Start logging meals to see your nutrition trends.')
  }

  if (hasWorkouts && consistency) {
    if (consistency.percent >= 50) {
      insights.push(`You trained on ${consistency.activeDays} of the last ${consistency.totalDays} days — strong consistency.`)
    } else if (consistency.activeDays > 0) {
      insights.push(`You trained on ${consistency.activeDays} of the last ${consistency.totalDays} days. A little more regularity adds up.`)
    }
  }

  if (workoutProgress && workoutProgress.totalSeconds >= 5 * 3600) {
    insights.push(`You have built up ${workoutProgress.totalLabel} of training time.`)
  }

  const topMuscle = muscleStats[0]
  if (topMuscle && topMuscle.count >= 3) {
    insights.push(`${topMuscle.name} training is currently one of your strongest training areas.`)
  }

  const topCategory = categoryStats[0]
  if (topCategory && topCategory.count >= 3) {
    insights.push(`Most of your sessions are ${topCategory.name}.`)
  }

  if (nutritionProgress && nutritionProgress.proteinTarget > 0 && nutritionProgress.daysLogged >= 3) {
    if (nutritionProgress.proteinSuccessPercent >= 60) {
      insights.push('You are consistently reaching your protein target.')
    } else {
      insights.push(`You reached your protein target on ${nutritionProgress.proteinSuccessDays} of ${nutritionProgress.daysLogged} tracked days.`)
    }
  }

  return insights
}

/* ------------------------------------------------------------------ */
/* personal bests                                                      */
/* ------------------------------------------------------------------ */

/**
 * Achievements backed by real numbers only.
 *
 * Each achievement reports whether it is earned and, when it is not, a plain
 * "what is left" hint so a locked badge never looks earned.
 */
export function getPersonalBests({ completed = [], nutritionProgress, streak } = {}) {
  const progress = getWorkoutProgress(completed)
  const best = streak?.best ?? 0
  const proteinSuccessDays = nutritionProgress?.proteinSuccessDays ?? 0
  const proteinTarget = nutritionProgress?.proteinTarget ?? 0

  const definitions = [
    {
      id: 'first-workout',
      title: 'First Workout',
      note: 'Complete your very first session.',
      earned: progress.total >= 1,
      hint: `${Math.min(progress.total, 1)} / 1 workout`,
    },
    {
      id: 'streak-3',
      title: '3-Day Streak',
      note: 'Train on three consecutive days.',
      earned: best >= 3,
      hint: `${Math.min(best, 3)} / 3 days`,
    },
    {
      id: 'streak-7',
      title: '7-Day Streak',
      note: 'Train on seven consecutive days.',
      earned: best >= 7,
      hint: `${Math.min(best, 7)} / 7 days`,
    },
    {
      id: 'workouts-10',
      title: '10 Workouts',
      note: 'Complete ten sessions.',
      earned: progress.total >= 10,
      hint: `${Math.min(progress.total, 10)} / 10 workouts`,
    },
    {
      id: 'workouts-25',
      title: '25 Workouts',
      note: 'Complete twenty-five sessions.',
      earned: progress.total >= 25,
      hint: `${Math.min(progress.total, 25)} / 25 workouts`,
    },
    {
      id: 'workouts-50',
      title: '50 Workouts',
      note: 'Complete fifty sessions.',
      earned: progress.total >= 50,
      hint: `${Math.min(progress.total, 50)} / 50 workouts`,
    },
    {
      id: 'time-5h',
      title: '5 Hours Training',
      note: 'Accumulate five hours of training.',
      earned: progress.totalSeconds >= 5 * 3600,
      hint: `${formatDuration(progress.totalSeconds)} / 5h`,
    },
    {
      id: 'protein-consistency',
      title: 'Protein Goal Consistency',
      note: 'Reach your protein target on five tracked days.',
      earned: proteinTarget > 0 && proteinSuccessDays >= 5,
      hint: proteinTarget > 0
        ? `${Math.min(proteinSuccessDays, 5)} / 5 days`
        : 'Set a protein target first',
    },
  ]

  return {
    earned: definitions.filter((item) => item.earned),
    locked: definitions.filter((item) => !item.earned),
    all: definitions,
  }
}

/* ------------------------------------------------------------------ */
/* formatting helpers                                                  */
/* ------------------------------------------------------------------ */

/** "Mon 12" style short label for a date key. */
function shortDay(key) {
  const date = new Date(`${key}T00:00:00`)
  if (Number.isNaN(date.getTime())) return key
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

/** "12 Oct" style short label for a date value. */
function shortDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/** Unified workout summary for the dashboard (workouts, active days, time). */
export function summariseWorkouts(completed = [], streak = null) {
  const progress = getWorkoutProgress(completed)
  return {
    total: progress.total,
    activeDays: progress.activeDays,
    totalLabel: progress.totalLabel,
    currentStreak: streak?.current ?? 0,
    bestStreak: streak?.best ?? 0,
  }
}

/** Friendly title for a completed record (re-exported for convenience). */
export { recordTitle }
