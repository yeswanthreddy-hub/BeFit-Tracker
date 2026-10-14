import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ALL_TIME,
  filterCompletedByRange,
  formatDuration,
  getConsistencyStats,
  getCurrentWeekConsistency,
  getMuscleGroupStats,
  getNutritionProgress,
  getNutritionTrend,
  getPersonalBests,
  getProgressInsights,
  getWorkoutActivity,
  getWorkoutCategoryStats,
  getWorkoutProgress,
} from '../src/utils/progress.js'

const NOW = new Date('2026-03-15T12:00:00') // a Sunday

const RECORDS = [
  { id: 'a', workoutId: 'w1', date: '2026-03-10T08:00:00', durationSeconds: 600, category: 'Full Body' },
  { id: 'b', workoutId: 'w1', date: '2026-03-10T18:00:00', durationSeconds: 1200, category: 'Full Body' },
  { id: 'c', workoutId: 'w9', date: '2026-03-11T09:00:00', durationSeconds: 1800, category: '' },
]

const WORKOUTS = [{ id: 'w1', exercises: [{ exerciseId: 'e1' }, { exerciseId: 'e2' }] }]
const EXERCISES = [
  { id: 'e1', targetMuscles: ['Chest'] },
  { id: 'e2', targetMuscles: ['Chest', 'Back'] },
]

describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    assert.equal(formatDuration(3600), '1h')
    assert.equal(formatDuration(9300), '2h 35m')
    assert.equal(formatDuration(2520), '42m')
    assert.equal(formatDuration(0), '0m')
  })

  it('never produces NaN for bad input', () => {
    assert.equal(formatDuration(undefined), '0m')
    assert.equal(formatDuration('nonsense'), '0m')
    assert.equal(formatDuration(-50), '0m')
  })
})

describe('getWorkoutProgress', () => {
  it('counts workouts, unique active days and durations', () => {
    const progress = getWorkoutProgress(RECORDS)
    assert.equal(progress.total, 3)
    assert.equal(progress.activeDays, 2)
    assert.equal(progress.totalSeconds, 3600)
    assert.equal(progress.totalLabel, '1h')
    assert.equal(progress.longestLabel, '30m')
    assert.equal(progress.shortestLabel, '10m')
    assert.equal(progress.averageLabel, '20m')
  })

  it('handles an empty list', () => {
    const progress = getWorkoutProgress([])
    assert.equal(progress.total, 0)
    assert.equal(progress.activeDays, 0)
    assert.equal(progress.totalLabel, '0m')
  })

  it('ignores malformed records without throwing', () => {
    const progress = getWorkoutProgress([null, 'nope', { date: 'bad', durationSeconds: 'x' }])
    assert.equal(progress.total, 1)
    assert.equal(progress.activeDays, 0)
    assert.equal(progress.totalLabel, '0m')
  })
})

describe('getWorkoutActivity', () => {
  it('buckets the last 7 days by day', () => {
    const { buckets, bucketSize } = getWorkoutActivity(RECORDS, 7, NOW)
    assert.equal(bucketSize, 'day')
    assert.equal(buckets.length, 7)
    const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0)
    assert.equal(total, 3)
    // Tue 10th and Wed 11th sit at indexes 1 and 2 (range starts Mon 9th).
    assert.equal(buckets[1].count, 2)
    assert.equal(buckets[2].count, 1)
  })

  it('buckets longer ranges by week', () => {
    const { bucketSize } = getWorkoutActivity(RECORDS, 30, NOW)
    assert.equal(bucketSize, 'week')
  })

  it('returns monthly buckets for all time', () => {
    const { bucketSize } = getWorkoutActivity(RECORDS, ALL_TIME, NOW)
    assert.equal(bucketSize, 'month')
  })
})

describe('getCurrentWeekConsistency', () => {
  it('marks real active days and today', () => {
    const days = getCurrentWeekConsistency(RECORDS, NOW)
    assert.equal(days.length, 7)
    assert.equal(days[1].isActive, true) // Tuesday
    assert.equal(days[2].isActive, true) // Wednesday
    assert.equal(days[0].isActive, false)
    assert.equal(days[6].isToday, true) // Sunday
  })
})

describe('getWorkoutCategoryStats', () => {
  it('groups by category and falls back to Other', () => {
    const stats = getWorkoutCategoryStats(RECORDS)
    const fullBody = stats.find((item) => item.name === 'Full Body')
    const other = stats.find((item) => item.name === 'Other')
    assert.equal(fullBody.count, 2)
    assert.equal(other.count, 1)
    assert.equal(fullBody.percent, 67)
  })

  it('returns an empty list with no records', () => {
    assert.deepEqual(getWorkoutCategoryStats([]), [])
  })
})

describe('getMuscleGroupStats', () => {
  it('resolves workouts to exercise target muscles per session', () => {
    const stats = getMuscleGroupStats(RECORDS, WORKOUTS, EXERCISES)
    const chest = stats.find((item) => item.name === 'Chest')
    const back = stats.find((item) => item.name === 'Back')
    // Two sessions used w1; each counts Chest and Back once.
    assert.equal(chest.count, 2)
    assert.equal(back.count, 2)
  })

  it('skips unknown workout references safely', () => {
    const stats = getMuscleGroupStats(
      [{ workoutId: 'missing', date: '2026-03-10T08:00:00' }],
      WORKOUTS,
      EXERCISES,
    )
    assert.deepEqual(stats, [])
  })
})

describe('getConsistencyStats', () => {
  it('reports active days over the range', () => {
    const stats = getConsistencyStats(RECORDS, 30, NOW)
    assert.equal(stats.activeDays, 2)
    assert.equal(stats.totalDays, 30)
    assert.equal(stats.percent, 7)
  })
})

describe('filterCompletedByRange', () => {
  it('keeps only records inside the range', () => {
    const records = [
      ...RECORDS,
      { id: 'old', workoutId: 'w1', date: '2026-01-01T10:00:00', durationSeconds: 300 },
    ]
    const recent = filterCompletedByRange(records, 30, NOW)
    assert.equal(recent.length, 3)
    assert.equal(filterCompletedByRange(records, ALL_TIME, NOW).length, 4)
  })
})

describe('getNutritionProgress', () => {
  const LOG = [
    { id: 'l1', name: 'Oats', date: '2026-03-10', calories: 2000, protein: 130, carbs: 200, fats: 60 },
    { id: 'l2', name: 'Shake', date: '2026-03-10', calories: 100, protein: 10, carbs: 10, fats: 5 },
    { id: 'l3', name: 'Chicken', date: '2026-03-11', calories: 1500, protein: 80, carbs: 150, fats: 40 },
  ]

  it('averages over logged days only and judges the protein goal', () => {
    const progress = getNutritionProgress(LOG, { dailyProteinTarget: 120 }, ALL_TIME, NOW)
    assert.equal(progress.daysLogged, 2)
    assert.equal(progress.avgCalories, 1800) // (2100 + 1500) / 2
    assert.equal(progress.avgProtein, 110) // (140 + 80) / 2
    assert.equal(progress.proteinSuccessDays, 1)
    assert.equal(progress.proteinSuccessPercent, 50)
  })

  it('does not treat days off as protein failures when no target is set', () => {
    const progress = getNutritionProgress(LOG, {}, ALL_TIME, NOW)
    assert.equal(progress.proteinTarget, 0)
    assert.equal(progress.proteinSuccessDays, 0)
    assert.equal(progress.proteinSuccessPercent, 0)
  })

  it('handles an empty log', () => {
    const progress = getNutritionProgress([], { dailyProteinTarget: 120 }, 30, NOW)
    assert.equal(progress.daysLogged, 0)
    assert.equal(progress.avgCalories, 0)
  })
})

describe('getNutritionTrend', () => {
  it('returns one point per day in the range, including zeroes', () => {
    const trend = getNutritionTrend(
      [{ id: 'l1', name: 'Oats', date: '2026-03-10', calories: 2100, protein: 140, carbs: 200, fats: 60 }],
      7,
      NOW,
    )
    assert.equal(trend.length, 7)
    assert.equal(trend[trend.length - 1].date, '2026-03-15')
    const target = trend.find((point) => point.date === '2026-03-10')
    assert.equal(target.calories, 2100)
    assert.equal(trend.find((point) => point.date === '2026-03-12').calories, 0)
  })
})

describe('getPersonalBests', () => {
  it('marks achievements earned only from real data', () => {
    const bests = getPersonalBests({
      completed: RECORDS,
      nutritionProgress: { proteinTarget: 120, proteinSuccessDays: 1 },
      streak: { current: 2, best: 2 },
    })
    const earnedIds = bests.earned.map((item) => item.id)
    assert.ok(earnedIds.includes('first-workout'))
    assert.ok(!earnedIds.includes('workouts-10'))
    assert.ok(!earnedIds.includes('streak-3'))
    assert.ok(!earnedIds.includes('time-5h'))
    assert.equal(bests.locked.length + bests.earned.length, bests.all.length)
  })

  it('shows a hint instead of a fake earned badge', () => {
    const bests = getPersonalBests({ completed: [], nutritionProgress: { proteinTarget: 0 } })
    assert.equal(bests.earned.length, 0)
    const protein = bests.all.find((item) => item.id === 'protein-consistency')
    assert.equal(protein.earned, false)
    assert.ok(protein.hint)
  })
})

describe('getProgressInsights', () => {
  it('explains how to start when there is no data', () => {
    const insights = getProgressInsights({ hasWorkouts: false, hasNutrition: false })
    assert.ok(insights.some((line) => line.includes('first workout')))
    assert.ok(insights.some((line) => line.includes('logging meals')))
  })

  it('is deterministic for the same input', () => {
    const input = {
      workoutProgress: { totalSeconds: 6 * 3600, totalLabel: '6h' },
      nutritionProgress: { proteinTarget: 120, daysLogged: 10, proteinSuccessDays: 7, proteinSuccessPercent: 70 },
      categoryStats: [{ name: 'Full Body', count: 5 }],
      muscleStats: [{ name: 'Legs', count: 4 }],
      consistency: { activeDays: 12, totalDays: 30, percent: 40 },
      hasWorkouts: true,
      hasNutrition: true,
    }
    assert.deepEqual(getProgressInsights(input), getProgressInsights(input))
  })
})
