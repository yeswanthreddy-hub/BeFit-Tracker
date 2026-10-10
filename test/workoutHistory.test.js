import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  completedRecordId,
  createCompletedRecord,
  getCompletedById,
  hasCompletedSession,
  parseCompletedWorkouts,
  sortCompletedNewestFirst,
} from '../src/utils/workoutHistory.js'

const input = {
  sessionId: 'session-1',
  workoutId: 'w-1',
  workoutName: 'Full Body Beginner',
  userId: 'user-1',
  durationSeconds: 1500,
  exerciseCount: 5,
  completedExercises: 5,
  completedSets: 12,
  totalSets: 12,
  goal: 'General Fitness',
  difficulty: 'Beginner',
  category: 'Full Body',
  exerciseNames: ['Push-Up', 'Plank'],
}

describe('createCompletedRecord', () => {
  it('builds the fields the dashboard and streak read', () => {
    const now = new Date('2026-10-01T18:30:00.000Z')
    const record = createCompletedRecord(input, now)

    assert.equal(record.id, 'completed-session-1')
    assert.equal(record.workoutName, 'Full Body Beginner')
    assert.equal(record.date, now.toISOString())
    assert.equal(record.completedAt, now.toISOString())
    assert.equal(record.durationSeconds, 1500)
    assert.equal(record.durationMinutes, 25)
    assert.equal(record.totalSets, 12)
    assert.deepEqual(record.exercises, ['Push-Up', 'Plank'])
  })

  it('refuses to invent a record without a session or workout', () => {
    assert.equal(createCompletedRecord({ ...input, sessionId: '' }), null)
    assert.equal(createCompletedRecord({ ...input, workoutId: '' }), null)
    assert.equal(createCompletedRecord({}), null)
  })

  it('never reports a sub-minute workout as zero minutes', () => {
    const record = createCompletedRecord({ ...input, durationSeconds: 40 })
    assert.equal(record.durationMinutes, 1)
  })

  it('defaults a missing name and clamps counts', () => {
    const record = createCompletedRecord({ ...input, workoutName: '', totalSets: -5 })
    assert.equal(record.workoutName, 'Workout')
    assert.equal(record.totalSets, 0)
  })
})

describe('hasCompletedSession', () => {
  const records = [createCompletedRecord(input, new Date('2026-10-01T18:30:00.000Z'))]

  it('matches by session id and by generated id', () => {
    assert.equal(hasCompletedSession(records, 'session-1'), true)
    assert.equal(hasCompletedSession(records, 'session-2'), false)
    assert.equal(hasCompletedSession([{ id: 'completed-session-3' }], 'session-3'), true)
  })

  it('is safe without a session id or list', () => {
    assert.equal(hasCompletedSession(records, ''), false)
    assert.equal(hasCompletedSession(null, 'session-1'), false)
  })
})

describe('parseCompletedWorkouts', () => {
  it('keeps records and drops anything else', () => {
    const parsed = parseCompletedWorkouts([{ id: 'a' }, null, 'nope', 42, ['x']])
    assert.deepEqual(parsed, [{ id: 'a' }])
  })

  it('returns an empty list for a non-array', () => {
    assert.deepEqual(parseCompletedWorkouts(undefined), [])
    assert.deepEqual(parseCompletedWorkouts({}), [])
  })
})

describe('getCompletedById', () => {
  it('finds one record and returns null otherwise', () => {
    const records = [{ id: 'completed-a' }, { id: 'completed-b' }]
    assert.deepEqual(getCompletedById(records, 'completed-b'), { id: 'completed-b' })
    assert.equal(getCompletedById(records, 'completed-z'), null)
    assert.equal(getCompletedById(records, ''), null)
  })
})

describe('sortCompletedNewestFirst', () => {
  it('orders by completion date, newest first', () => {
    const old = { id: 'old', date: '2026-09-01T10:00:00.000Z' }
    const recent = { id: 'recent', date: '2026-10-01T10:00:00.000Z' }
    const mid = { id: 'mid', date: '2026-09-20T10:00:00.000Z' }

    assert.deepEqual(
      sortCompletedNewestFirst([old, recent, mid]).map((item) => item.id),
      ['recent', 'mid', 'old'],
    )
  })

  it('sinks records without a usable date and never mutates the source', () => {
    const source = [{ id: 'dated', date: '2026-10-01T10:00:00.000Z' }, { id: 'broken' }]
    const sorted = sortCompletedNewestFirst(source)
    assert.deepEqual(sorted.map((item) => item.id), ['dated', 'broken'])
    assert.equal(source[0].id, 'dated')
  })
})

describe('completedRecordId', () => {
  it('namespaces an id by its session', () => {
    assert.equal(completedRecordId('abc'), 'completed-abc')
  })
})
