import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  MAX_AI_INSIGHTS,
  addAiInsight,
  createAiInsight,
  formatInsightTime,
  latestAiInsight,
  latestAiInsightForAction,
  matchInsightExercises,
  normaliseStoredResult,
  parseAiInsights,
} from '../src/utils/aiHistory.js'

const RESULT = {
  title: 'Push the pace',
  summary: 'You trained three times this week.',
  highlights: ['Consistency is up'],
  focusAreas: ['Mobility'],
  recommendations: ['Try a push-up session', 'Add a plank'],
  nextStep: 'Book tomorrow at 30 minutes.',
}

const EXERCISES = [
  { id: 'push-up', name: 'Push-Up' },
  { id: 'plank', name: 'Plank' },
  { id: 'burpee', name: 'Burpee' },
]

describe('normaliseStoredResult', () => {
  it('fills every field even for junk input', () => {
    const result = normaliseStoredResult(null)
    assert.deepEqual(result, {
      title: 'AI Fitness Insight',
      summary: '',
      highlights: [],
      focusAreas: [],
      recommendations: [],
      nextStep: '',
    })
  })

  it('keeps only non-empty strings in the lists', () => {
    const result = normaliseStoredResult({
      title: '  Go  ',
      highlights: ['ok', '', '  ', 4, 'two'],
    })
    assert.equal(result.title, 'Go')
    assert.deepEqual(result.highlights, ['ok', 'two'])
  })
})

describe('parseAiInsights', () => {
  it('returns an empty list for a corrupt payload', () => {
    assert.deepEqual(parseAiInsights('nope'), [])
    assert.deepEqual(parseAiInsights(null), [])
  })

  it('drops entries without an id or action and normalises the result', () => {
    const parsed = parseAiInsights([
      { id: 'a1', userId: 'u1', action: 'daily-insight', createdAt: '2026-06-15T10:00:00.000Z', result: RESULT },
      { id: '', action: 'daily-insight', result: RESULT },
      { id: 'a2', action: '', result: RESULT },
      'not-an-object',
    ])
    assert.equal(parsed.length, 1)
    assert.equal(parsed[0].id, 'a1')
    assert.equal(parsed[0].userId, 'u1')
    assert.equal(parsed[0].result.title, 'Push the pace')
  })

  it('caps the history length', () => {
    const many = Array.from({ length: 25 }, (_, index) => ({
      id: `a${index}`,
      action: 'daily-insight',
      createdAt: '2026-06-15T10:00:00.000Z',
      result: RESULT,
    }))
    assert.equal(parseAiInsights(many).length, MAX_AI_INSIGHTS)
  })
})

describe('createAiInsight', () => {
  it('builds an entry with an id, action, timestamp and safe result', () => {
    const now = new Date('2026-06-15T09:30:00.000Z')
    const entry = createAiInsight({ action: 'progress-review', result: RESULT, userId: 'user-7', now })
    assert.match(entry.id, /^ai-insight-/)
    assert.equal(entry.action, 'progress-review')
    assert.equal(entry.userId, 'user-7')
    assert.equal(entry.createdAt, now.toISOString())
    assert.deepEqual(entry.result.recommendations, ['Try a push-up session', 'Add a plank'])
  })
})

describe('addAiInsight', () => {
  it('prepends the newest entry', () => {
    const one = { id: 'a1', action: 'daily-insight', result: RESULT }
    const two = { id: 'a2', action: 'progress-review', result: RESULT }
    const list = addAiInsight([one], two)
    assert.deepEqual(list.map((item) => item.id), ['a2', 'a1'])
  })

  it('never keeps a duplicate id twice', () => {
    const one = { id: 'a1', action: 'daily-insight', result: RESULT }
    const list = addAiInsight([one], { ...one, action: 'progress-review' })
    assert.equal(list.length, 1)
    assert.equal(list[0].action, 'progress-review')
  })

  it('caps the list at the maximum', () => {
    const many = Array.from({ length: MAX_AI_INSIGHTS }, (_, index) => ({
      id: `a${index}`,
      action: 'daily-insight',
      result: RESULT,
    }))
    const list = addAiInsight(many, { id: 'new', action: 'daily-insight', result: RESULT })
    assert.equal(list.length, MAX_AI_INSIGHTS)
    assert.equal(list[0].id, 'new')
  })
})

describe('latestAiInsight / latestAiInsightForAction', () => {
  const history = [
    { id: 'a2', action: 'progress-review', result: RESULT },
    { id: 'a1', action: 'daily-insight', result: RESULT },
  ]

  it('returns the newest entry or null', () => {
    assert.equal(latestAiInsight(history).id, 'a2')
    assert.equal(latestAiInsight([]), null)
  })

  it('finds the newest entry for a specific action', () => {
    assert.equal(latestAiInsightForAction(history, 'daily-insight').id, 'a1')
    assert.equal(latestAiInsightForAction(history, 'nutrition-insight'), null)
  })
})

describe('formatInsightTime', () => {
  it('returns an empty string for missing or invalid values', () => {
    assert.equal(formatInsightTime(''), '')
    assert.equal(formatInsightTime('not-a-date'), '')
    assert.equal(formatInsightTime(null), '')
  })

  it('formats a valid timestamp', () => {
    assert.notEqual(formatInsightTime('2026-06-15T10:00:00.000Z'), '')
  })
})

describe('matchInsightExercises', () => {
  it('matches library exercise names mentioned in the result', () => {
    const matched = matchInsightExercises(RESULT, EXERCISES)
    assert.deepEqual(matched.map((exercise) => exercise.id), ['push-up', 'plank'])
  })

  it('is case-insensitive', () => {
    const matched = matchInsightExercises(
      { summary: 'finish with a BURPEE finisher' },
      EXERCISES,
    )
    assert.deepEqual(matched.map((exercise) => exercise.id), ['burpee'])
  })

  it('returns nothing for a result that mentions no library move', () => {
    assert.deepEqual(matchInsightExercises({ summary: 'Rest today.' }, EXERCISES), [])
  })

  it('caps the number of matches', () => {
    const matched = matchInsightExercises(RESULT, EXERCISES, 1)
    assert.equal(matched.length, 1)
  })

  it('ignores junk input instead of throwing', () => {
    assert.deepEqual(matchInsightExercises(null, EXERCISES), [])
  })
})
