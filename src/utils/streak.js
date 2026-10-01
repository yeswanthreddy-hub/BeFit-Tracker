/**
 * Calculate the current and longest (best) streaks from completed workouts.
 *
 * The logic is simple and date-aware: a workout counts on its completion date
 * (YYYY-MM-DD in local time). "Today" is the browser's current date. To keep
 * the streak alive the athlete needs to complete at least one workout on
 * consecutive calendar days, ending with today or yesterday (so if the last
 * session was yesterday, the current streak carries over to today).
 *
 * Streaks are based on calendar days, not time gaps between workouts in hours.
 * If there are no completed workouts, both streaks return 0 with no last date.
 *
 * @param {Array<{date: string}>} completed Array of completed workout objects
 * @returns {{current: number, best: number, lastWorkoutDate: string|null}}
 */
export function calculateStreak(completed = []) {
  if (!Array.isArray(completed) || completed.length === 0) {
    return { current: 0, best: 0, lastWorkoutDate: null }
  }

  const today = new Date()
  const todayKey = toDateKey(today)

  // Collect unique workout days (YYYY-MM-DD). One workout per calendar day is
  // enough to extend a streak; doing more does not create multiple "days".
  const daySet = new Set()
  const dayList = []

  for (const item of completed) {
    if (!item || typeof item.date !== 'string') continue
    const key = toDateKey(new Date(item.date))
    if (key && !daySet.has(key)) {
      daySet.add(key)
      dayList.push(key)
    }
  }

  if (dayList.length === 0) {
    return { current: 0, best: 0, lastWorkoutDate: null }
  }

  // Sort ascending by calendar date.
  dayList.sort((a, b) => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  })

  const lastKey = dayList[dayList.length - 1]
  const lastDate = keyToIso(lastKey)

  // Calculate best streak by scanning the sorted day sequence.
  let best = 1
  let currentRun = 1
  for (let i = 1; i < dayList.length; i += 1) {
    if (isNextDay(dayList[i - 1], dayList[i])) {
      currentRun += 1
    } else {
      if (currentRun > best) best = currentRun
      currentRun = 1
    }
  }
  if (currentRun > best) best = currentRun

  // Calculate current streak: consecutive days ending at lastKey.
  // If the gap between last workout and today is > 1 day, current streak is 0.
  const daysSinceLast = daysBetween(lastKey, todayKey)
  let current = 0
  if (daysSinceLast <= 1) {
    // Count backwards from lastKey while consecutive.
    let run = 1
    for (let i = dayList.length - 2; i >= 0; i -= 1) {
      if (isNextDay(dayList[i], dayList[i + 1])) {
        run += 1
      } else {
        break
      }
    }
    current = run
  } else {
    current = 0
  }

  return {
    current,
    best,
    lastWorkoutDate: lastDate,
  }
}

/** Convert a Date to YYYY-MM-DD in the local timezone. */
export function toDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Convert a YYYY-MM-DD key back to an ISO string (midnight local approx). */
export function keyToIso(key) {
  if (!key || typeof key !== 'string') return null
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return null
  const dt = new Date(y, m - 1, d)
  return dt.toISOString()
}

/** Return true if b is exactly the calendar day after a. */
export function isNextDay(aKey, bKey) {
  const da = keyToDate(aKey)
  const db = keyToDate(bKey)
  if (!da || !db) return false
  da.setDate(da.getDate() + 1)
  return toDateKey(da) === bKey
}

/** Days between aKey and bKey (bKey - aKey), ignoring time-of-day. */
export function daysBetween(aKey, bKey) {
  const da = keyToDate(aKey)
  const db = keyToDate(bKey)
  if (!da || !db) return Number.POSITIVE_INFINITY
  // Use UTC to avoid DST boundary surprises for day counts
  const ua = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate())
  const ub = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate())
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((ub - ua) / msPerDay)
}

function keyToDate(key) {
  if (!key) return null
  const [y, m, d] = key.split('-').map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
  const dt = new Date(y, m - 1, d)
  if (Number.isNaN(dt.getTime())) return null
  return dt
}
