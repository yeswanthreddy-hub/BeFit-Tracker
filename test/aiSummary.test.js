import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildAiContext,
  buildStatusSnapshot,
  describeNutritionTrend,
  describeWorkoutTrend,
} from '../src/utils/aiSummary.js'

const NOW = new Date('2026-06-15T12:00:00')

function record(overrides = {}) {
  return {
    id: overrides.id ?? 'completed-1',
    sessionId: overrides.sessionId ?? 's1',
    workoutId: overrides.workoutId ?? 'w1',
    workoutName: overrides.workoutName ?? 'Push Day',
    category: overrides.category ?? 'Chest',
    date: overrides.date ?? '2026-06-14T10:00:00',
    durationSeconds: overrides.durationSeconds ?? 1800,
  }
}

const PROFILE = { fitnessGoal: 'Build Muscle', experienceLevel: 'Beginner', preferredWorkoutDuration: 30 }

function foodEntry(overrides = {}) {
  return {
    id: overrides.id ?? 'food-log-1',
    name: overrides.name ?? 'Oats',
    date: overrides.date ?? '2026-06-14',
    calories: overrides.calories ?? 400,
    protein: overrides.protein ?? 20,
    carbs: overrides.carbs ?? 60,
    fats: overrides.fats ?? 8,
  }
}

describe('describeWorkoutTrend', () => {
  it('reports no activity for an empty history', () => {
    assert.match(describeWorkoutTrend([], NOW), /No workouts/)
  })

  it('reports an upward trend when this week beats the last', () => {
    const records = [record({ date: '2026-06-14T10:00:00' }), record({ id: '2', date: '2026-06-10T10:00:00' }), record({ id: '3', date: '2026-06-03T10:00:00' })]
    assert.match(describeWorkoutTrend(records, NOW), /^Up/)
  })

  it('stays short enough for the server clamp', () => {
    const records = [record()]
    assert.ok(describeWorkoutTrend(records, NOW).length < 120)
  })
})

describe('describeNutritionTrend', () => {
  it('says nothing was logged when the log is empty', () => {
    assert.match(describeNutritionTrend([], {}, NOW), /No meals/)
  })

  it('summarises logged days', () => {
    const log = [foodEntry({ date: '2026-06-14', calories: 2000, protein: 120, carbs: 200, fats: 60 })]
    const line = describeNutritionTrend(log, {}, NOW)
    assert.match(line, /1 of the last 7 days/)
    assert.ok(line.length < 120)
  })
})

describe('buildAiContext', () => {
  const workouts = [{ id: 'w1', exercises: [{ exerciseId: 'push-up' }] }]
  const exercises = [{ id: 'push-up', targetMuscles: ['Chest'], secondaryMuscles: ['Triceps'] }]
  const completed = [
    record({ date: '2026-06-14T10:00:00' }),
    record({ id: 'completed-2', sessionId: 's2', date: '2026-06-10T10:00:00' }),
  ]
  const foodLog = [
    foodEntry({ date: '2026-06-14', calories: 2000, protein: 120, carbs: 200, fats: 60 }),
    foodEntry({ id: 'food-log-2', date: '2026-06-10', calories: 2200, protein: 140, carbs: 210, fats: 70 }),
  ]
  const nutritionProfile = { dailyCalorieTarget: 2400, dailyProteinTarget: 150 }

  const context = buildAiContext({
    name: 'Ada',
    profile: PROFILE,
    completed,
    foodLog,
    nutritionProfile,
    workouts,
    exercises,
    now: NOW,
  })

  it('produces exactly the four sections the server expects', () => {
    assert.deepEqual(Object.keys(context).sort(), [
      'nutritionSummary',
      'profile',
      'progressSummary',
      'workoutSummary',
    ])
  })

  it('carries the profile without any credential fields', () => {
    assert.deepEqual(context.profile, {
      name: 'Ada',
      fitnessGoal: 'Build Muscle',
      experienceLevel: 'Beginner',
      preferredWorkoutDuration: 30,
    })
  })

  it('summarises workouts with resolved recent sessions and muscles', () => {
    assert.equal(context.workoutSummary.totalWorkouts, 2)
    assert.equal(context.workoutSummary.bestStreak, 1)
    assert.equal(context.workoutSummary.recentWorkouts.length, 2)
    assert.deepEqual(context.workoutSummary.recentWorkouts[0], {
      name: 'Push Day',
      category: 'Chest',
      durationMinutes: 30,
    })
    assert.deepEqual(context.workoutSummary.recentlyTrainedMuscles, ['Chest'])
  })

  it('summarises nutrition averages and targets', () => {
    assert.equal(context.nutritionSummary.daysLogged, 2)
    assert.equal(context.nutritionSummary.averageCalories, 2100)
    assert.equal(context.nutritionSummary.averageProtein, 130)
    assert.equal(context.nutritionSummary.calorieTarget, 2400)
    assert.equal(context.nutritionSummary.proteinTarget, 150)
  })

  it('never leaks credentials or contact details', () => {
    const serialised = JSON.stringify(context)
    assert.doesNotMatch(serialised, /@/)
    assert.doesNotMatch(serialised, /password/i)
    assert.doesNotMatch(serialised, /token/i)
  })

  it('caps recent workouts at five', () => {
    const many = Array.from({ length: 9 }, (_, index) =>
      record({ id: `c-${index}`, sessionId: `s-${index}`, date: `2026-06-${10 + index}T09:00:00` }),
    )
    const big = buildAiContext({ profile: PROFILE, completed: many, workouts, exercises, now: NOW })
    assert.equal(big.workoutSummary.recentWorkouts.length, 5)
  })

  it('degrades to honest zeros with no data', () => {
    const empty = buildAiContext({ profile: PROFILE, now: NOW })
    assert.equal(empty.workoutSummary.totalWorkouts, 0)
    assert.deepEqual(empty.workoutSummary.recentWorkouts, [])
    assert.equal(empty.nutritionSummary.daysLogged, 0)
    assert.deepEqual(empty.progressSummary.strongestAreas, [])
  })
})

describe('buildStatusSnapshot', () => {
  it('counts weeks, streaks and logged days from real data', () => {
    const completed = [
      record({ date: '2026-06-14T10:00:00' }),
      record({ id: 'completed-2', sessionId: 's2', date: '2026-06-13T10:00:00' }),
      record({ id: 'completed-3', sessionId: 's3', date: '2026-05-01T10:00:00' }),
    ]
    const foodLog = [foodEntry({ date: '2026-06-14', calories: 2000, protein: 120, carbs: 200, fats: 60 })]
    const snapshot = buildStatusSnapshot({ completed, foodLog, now: NOW })

    assert.equal(snapshot.hasWorkouts, true)
    assert.equal(snapshot.hasNutrition, true)
    assert.equal(snapshot.totalWorkouts, 3)
    assert.equal(snapshot.weekWorkouts, 2)
    assert.equal(snapshot.bestStreak, 2)
    assert.equal(snapshot.lastWorkoutName, 'Push Day')
  })

  it('reports an empty account without inventing numbers', () => {
    const snapshot = buildStatusSnapshot({ now: NOW })
    assert.equal(snapshot.hasWorkouts, false)
    assert.equal(snapshot.totalWorkouts, 0)
    assert.equal(snapshot.weekWorkouts, 0)
    assert.equal(snapshot.daysLogged, 0)
    assert.equal(snapshot.lastWorkoutName, null)
  })
})
