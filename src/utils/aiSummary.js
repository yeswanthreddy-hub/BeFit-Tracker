/**
 * BeFit → AI payload builders.
 *
 * The AI never gets the athlete's raw storage. Instead these pure helpers turn
 * the stored collections into the small, fixed-shape summary the server's
 * `sanitizeContext` expects — and nothing more. That means:
 *
 *   - only fitness data travels (workouts, nutrition, progress, goal)
 *   - no email, password, session token, user id or raw record dumps
 *   - every value is a bounded number, short string or short string list
 *
 * Reusing `utils/progress.js` keeps the AI's numbers identical to the numbers
 * the Progress page shows; there is no second, drifting copy of the maths.
 */

import { calculateStreak } from './streak'
import { parseCompletedWorkouts, sortCompletedNewestFirst } from './workoutHistory'
import { recordTitle } from './dashboard'
import { normalizeNutritionProfile } from './nutrition'
import {
  ALL_TIME,
  filterCompletedByRange,
  getMuscleGroupStats,
  getNutritionProgress,
  getWorkoutCategoryStats,
  getWorkoutProgress,
} from './progress'
import { EXERCISES } from '../data/exercises'
import { WORKOUTS } from '../data/workouts'

function toText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

/**
 * A short start-of-week comparison of recent training volume.
 * Plain language, and always under the server's 120-character clamp.
 */
export function describeWorkoutTrend(completed = [], now = new Date()) {
  const records = parseCompletedWorkouts(completed)
  const last7 = filterCompletedByRange(records, 7, now).length
  const last14 = filterCompletedByRange(records, 14, now).length
  const previous7 = Math.max(0, last14 - last7)

  if (last7 === 0 && previous7 === 0) return 'No workouts logged in the last two weeks'
  if (last7 > previous7) return `Up — ${last7} workouts this week vs ${previous7} the week before`
  if (last7 < previous7) return `Down — ${last7} workouts this week vs ${previous7} the week before`
  return `Steady — ${last7} workouts per week`
}

/** A short description of how consistently meals have been logged. */
export function describeNutritionTrend(foodLog = [], nutritionProfile = {}, now = new Date()) {
  const recent = getNutritionProgress(foodLog, nutritionProfile, 7, now)
  if (recent.daysLogged === 0) return 'No meals logged in the last 7 days'
  return `Logged meals on ${recent.daysLogged} of the last 7 days, about ${recent.avgCalories} kcal and ${recent.avgProtein} g protein a day`
}

/**
 * Build the sanitized context sent with every AI request.
 *
 * The shape is intentionally the server's allow-list, so nothing here can be
 * dropped silently server-side. Missing data is an honest zero or empty list.
 *
 * @param {object} input
 * @param {string} [input.name] display first name only
 * @param {object} [input.profile] the onboarding profile
 * @param {Array} [input.completed] completed-workout records
 * @param {Array} [input.foodLog] food-log entries
 * @param {object} [input.nutritionProfile] daily targets
 * @param {Array} [input.workouts] workout definitions for muscle resolution
 * @param {Array} [input.exercises] exercise catalog for muscle resolution
 * @param {Date} [input.now]
 */
export function buildAiContext({
  name = '',
  profile = null,
  completed = [],
  foodLog = [],
  nutritionProfile = null,
  workouts = WORKOUTS,
  exercises = EXERCISES,
  now = new Date(),
} = {}) {
  const records = parseCompletedWorkouts(completed)
  const streak = calculateStreak(records)
  const progress = getWorkoutProgress(records)
  const targets = normalizeNutritionProfile(nutritionProfile)
  const nutrition = getNutritionProgress(foodLog, nutritionProfile, ALL_TIME, now)
  const categories = getWorkoutCategoryStats(records)
  const muscles = getMuscleGroupStats(records, workouts, exercises)

  const recentWorkouts = sortCompletedNewestFirst(records)
    .slice(0, 5)
    .map((item) => ({
      name: recordTitle(item),
      category: toText(item?.category),
      durationMinutes: Math.round(toNumber(item?.durationSeconds) / 60),
    }))

  const strongestAreas = [
    ...categories.slice(0, 2).map((item) => item.name),
    ...muscles.slice(0, 3).map((item) => item.name),
  ]

  return {
    profile: {
      name: toText(name),
      fitnessGoal: toText(profile?.fitnessGoal),
      experienceLevel: toText(profile?.experienceLevel),
      preferredWorkoutDuration: toNumber(profile?.preferredWorkoutDuration),
    },
    workoutSummary: {
      totalWorkouts: progress.total,
      activeDays: progress.activeDays,
      currentStreak: streak.current,
      bestStreak: streak.best,
      averageDurationMinutes: Math.round(progress.averageSeconds / 60),
      recentWorkouts,
      recentlyTrainedMuscles: muscles.slice(0, 5).map((item) => item.name),
    },
    nutritionSummary: {
      daysLogged: nutrition.daysLogged,
      averageCalories: nutrition.avgCalories,
      averageProtein: nutrition.avgProtein,
      averageCarbs: nutrition.avgCarbs,
      averageFats: nutrition.avgFats,
      calorieTarget: targets.dailyCalorieTarget,
      proteinTarget: targets.dailyProteinTarget,
    },
    progressSummary: {
      workoutTrend: describeWorkoutTrend(records, now),
      nutritionTrend: describeNutritionTrend(foodLog, nutritionProfile, now),
      strongestAreas,
    },
  }
}

/**
 * Headline numbers for the page's status card.
 *
 * A compact, render-only view of the same data — no raw records leave here
 * either, just counts and labels the card can lay out.
 */
export function buildStatusSnapshot({
  completed = [],
  foodLog = [],
  nutritionProfile = null,
  now = new Date(),
} = {}) {
  const records = parseCompletedWorkouts(completed)
  const streak = calculateStreak(records)
  const progress = getWorkoutProgress(records)
  const nutrition = getNutritionProgress(foodLog, nutritionProfile, ALL_TIME, now)

  return {
    hasWorkouts: progress.total > 0,
    hasNutrition: nutrition.daysLogged > 0,
    totalWorkouts: progress.total,
    activeDays: progress.activeDays,
    weekWorkouts: filterCompletedByRange(records, 7, now).length,
    currentStreak: streak.current,
    bestStreak: streak.best,
    totalLabel: progress.totalLabel,
    daysLogged: nutrition.daysLogged,
    avgCalories: nutrition.avgCalories,
    avgProtein: nutrition.avgProtein,
    proteinTarget: nutrition.proteinTarget,
    lastWorkoutName: records.length ? recordTitle(sortCompletedNewestFirst(records)[0]) : null,
  }
}
