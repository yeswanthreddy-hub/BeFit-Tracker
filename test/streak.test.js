import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { calculateStreak, isNextDay, toDateKey } from '../src/utils/streak.js'

/** Build a completed-workout record for a local calendar day. */
const on = (year, month, day) => ({
  id: `cw-${year}-${month}-${day}`,
  workoutTitle: 'Session',
  date: new Date(year, month - 1, day, 12, 0, 0).toISOString(),
})

const TODAY = new Date()
const YEAR = TODAY.getFullYear()
const MONTH = TODAY.getMonth() + 1

/** A local date `offset` days from today (negative = past). */
const relative = (offset) => {
  const d = new Date(YEAR, MONTH - 1, TODAY.getDate() + offset, 12, 0, 0)
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

const daysAgo = (n) => on(relative(-n).year, relative(-n).month, relative(-n).day)

describe('toDateKey', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    assert.equal(toDateKey(new Date(2026, 9, 1)), '2026-10-01')
  })

  it('pads single digit months and days', () => {
    assert.equal(toDateKey(new Date(2026, 0, 5)), '2026-01-05')
  })

  it('returns null for invalid dates', () => {
    assert.equal(toDateKey(new Date('nonsense')), null)
    assert.equal(toDateKey('2026-10-01'), null)
  })
})

describe('isNextDay', () => {
  it('detects consecutive calendar days', () => {
    assert.equal(isNextDay('2026-10-01', '2026-10-02'), true)
    assert.equal(isNextDay('2026-10-31', '2026-11-01'), true)
    assert.equal(isNextDay('2026-12-31', '2027-01-01'), true)
  })

  it('rejects gaps and repeats', () => {
    assert.equal(isNextDay('2026-10-01', '2026-10-03'), false)
    assert.equal(isNextDay('2026-10-01', '2026-10-01'), false)
  })
})

describe('calculateStreak with no data', () => {
  it('returns a genuine zero streak for a new account', () => {
    assert.deepEqual(calculateStreak([]), { current: 0, best: 0, lastWorkoutDate: null })
  })

  it('returns a zero streak for missing input', () => {
    assert.deepEqual(calculateStreak(null), { current: 0, best: 0, lastWorkoutDate: null })
    assert.deepEqual(calculateStreak(undefined), { current: 0, best: 0, lastWorkoutDate: null })
  })

  it('returns a zero streak when records carry no usable date', () => {
    assert.deepEqual(calculateStreak([{ id: 'x' }, { id: 'y', date: 'nope' }]), {
      current: 0,
      best: 0,
      lastWorkoutDate: null,
    })
  })
})

describe('calculateStreak current', () => {
  it('counts consecutive days ending today', () => {
    const result = calculateStreak([daysAgo(0), daysAgo(1), daysAgo(2)])
    assert.equal(result.current, 3)
  })

  it('stays alive when the last session was yesterday', () => {
    const result = calculateStreak([daysAgo(1), daysAgo(2)])
    assert.equal(result.current, 2)
  })

  it('resets to zero once two days have been missed', () => {
    const result = calculateStreak([daysAgo(3), daysAgo(4)])
    assert.equal(result.current, 0)
  })

  it('counts a single workout today as a one day streak', () => {
    assert.equal(calculateStreak([daysAgo(0)]).current, 1)
  })

  it('counts two workouts on one day as one day', () => {
    const today = daysAgo(0)
    const result = calculateStreak([today, { ...today, id: 'second' }])
    assert.equal(result.current, 1)
    assert.equal(result.best, 1)
  })
})

describe('calculateStreak best', () => {
  it('remembers a longer run that has since lapsed', () => {
    const result = calculateStreak([
      daysAgo(20),
      daysAgo(19),
      daysAgo(18),
      daysAgo(17),
      daysAgo(10),
    ])
    assert.equal(result.best, 4)
    assert.equal(result.current, 0)
  })

  it('finds the longest run across separate blocks', () => {
    const result = calculateStreak([
      daysAgo(30),
      daysAgo(29),
      daysAgo(20),
      daysAgo(19),
      daysAgo(18),
      daysAgo(17),
      daysAgo(16),
      daysAgo(1),
    ])
    assert.equal(result.best, 5)
    assert.equal(result.current, 1)
  })

  it('is never smaller than the current streak', () => {
    const result = calculateStreak([daysAgo(0), daysAgo(1), daysAgo(2)])
    assert.ok(result.best >= result.current)
  })

  it('handles unsorted records', () => {
    const result = calculateStreak([daysAgo(2), daysAgo(0), daysAgo(1)])
    assert.equal(result.current, 3)
  })
})

describe('calculateStreak lastWorkoutDate', () => {
  it('reports the most recent completion', () => {
    const result = calculateStreak([daysAgo(5), daysAgo(1), daysAgo(3)])
    assert.equal(toDateKey(new Date(result.lastWorkoutDate)), toDateKey(new Date(daysAgo(1).date)))
  })

  it('is null when there is no workout', () => {
    assert.equal(calculateStreak([]).lastWorkoutDate, null)
  })
})