import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  completedOnDay,
  recentActivity,
  recordDate,
  recordTitle,
  weeklyActivity,
  weeklyCompleted,
} from '../src/utils/dashboard.js'

/** Thursday 1 October 2026, local time. */
const THU = new Date(2026, 9, 1, 23, 0, 0)

const on = (month, day, hour = 12) => {
  const dt = new Date(2026, month - 1, day, hour, 0, 0)
  return {
    id: `cw-${month}-${day}`,
    workoutTitle: 'Session',
    date: dt.toISOString(),
    durationMinutes: 30,
    totalSets: 12,
  }
}

describe('weeklyCompleted', () => {
  it('counts nothing for a new account', () => {
    assert.equal(weeklyCompleted([], THU), 0)
  })

  it('counts the Monday-Sunday week', () => {
    // Week of Thu 1 Oct 2026 runs Mon 28 Sep -> Sun 4 Oct, and 5 Oct is next week.
    const endOfWeek = new Date(2026, 9, 4, 23, 0, 0)
    const completed = [on(9, 28), on(9, 29), on(9, 30), on(10, 1), on(10, 3), on(10, 4), on(10, 5)]
    assert.equal(weeklyCompleted(completed, endOfWeek), 6)
  })

  it('counts only what has happened so far', () => {
    const completed = [on(9, 30), on(10, 1), on(10, 3), on(10, 4)]
    assert.equal(weeklyCompleted(completed, THU), 2)
  })

  it('excludes records from before the current week', () => {
    assert.equal(weeklyCompleted([on(9, 27)], THU), 0)
  })

  it('ignores records without a usable date', () => {
    assert.equal(weeklyCompleted([{ id: 'a' }, { id: 'b', date: 'nope' }], THU), 0)
  })
})

describe('completedOnDay', () => {
  it('reports zero for an empty collection', () => {
    assert.equal(completedOnDay([], THU), 0)
  })

  it('counts only the given day', () => {
    const completed = [on(10, 1), on(10, 1, 18), on(10, 2)]
    assert.equal(completedOnDay(completed, THU), 2)
  })
})

describe('weeklyActivity', () => {
  it('always returns seven labelled days', () => {
    const days = weeklyActivity([], THU)
    assert.equal(days.length, 7)
    assert.deepEqual(days.map((d) => d.label), ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
  })

  it('runs Monday to Sunday', () => {
    const days = weeklyActivity([], THU)
    assert.equal(days[0].key, '2026-09-28')
    assert.equal(days[6].key, '2026-10-04')
  })

  it('marks only days with a real completion as active', () => {
    // Week of Thu 1 Oct 2026 runs Mon 28 Sep -> Sun 4 Oct.
    const days = weeklyActivity([on(9, 30), on(10, 2)], THU)
    assert.deepEqual(days.map((d) => d.isActive), [false, false, true, false, true, false, false])
  })

  it('marks today for display', () => {
    const days = weeklyActivity([], THU)
    assert.deepEqual(days.map((d) => d.isToday), [false, false, false, true, false, false, false])
  })
})

describe('recentActivity', () => {
  it('returns an empty list for a new account', () => {
    assert.deepEqual(recentActivity([], 4), [])
  })

  it('sorts newest first and respects the limit', () => {
    const items = recentActivity([on(9, 29), on(10, 2), on(10, 1)], 2)
    assert.equal(items.length, 2)
    assert.equal(items[0].name, 'Session')
    assert.equal(items[0].date, on(10, 2).date)
    assert.equal(items[1].date, on(10, 1).date)
  })

  it('falls back to the alternative name field', () => {
    const items = recentActivity([{ id: 'a', workoutName: 'Full Body Starter', completedAt: on(10, 1).date }])
    assert.equal(items[0].name, 'Full Body Starter')
  })

  it('skips records it cannot place in time', () => {
    assert.deepEqual(recentActivity([{ id: 'a' }, { id: 'b', date: 'nope' }]), [])
  })
})

describe('record helpers', () => {
  it('reads the title from either field', () => {
    assert.equal(recordTitle({ workoutTitle: 'Push Day' }), 'Push Day')
    assert.equal(recordTitle({ workoutName: 'Full Body' }), 'Full Body')
    assert.equal(recordTitle(null), 'Workout')
  })

  it('parses the date from either field', () => {
    assert.ok(recordDate({ date: '2026-10-01T10:00:00.000Z' }) instanceof Date)
    assert.ok(recordDate({ completedAt: '2026-10-01T10:00:00.000Z' }) instanceof Date)
    assert.equal(recordDate({}), null)
    assert.equal(recordDate(null), null)
  })
})