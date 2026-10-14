/**
 * Diet & nutrition calculations.
 *
 * Every function here is pure: it takes a food-log array (or a slice of one)
 * and returns numbers or plain objects. Nothing reads localStorage and nothing
 * touches React, so the diet page, the meal log and the dashboard all share the
 * exact same maths and this file can be unit tested with plain arrays.
 *
 * Storage lives behind `useFoodLog`; this module only interprets what is read.
 *
 * Note on honesty: these are estimates derived from the approximate food
 * values. Nothing here claims medical accuracy, and a missing target is never
 * presented as zero calories remaining — an unset target simply has no
 * "remaining" figure at all.
 */

import { toDateKey } from './streak'

/** Meal buckets, in the order they are shown through the day. */
export const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

/** Prefix for generated food-log ids, so a logged meal is recognisable. */
export const FOOD_LOG_ID_PREFIX = 'food-log-'

/** Soft reminder repeated anywhere nutrition numbers are shown. */
export const NUTRITION_DISCLAIMER =
  'Nutrition values are approximate and may vary by brand, preparation, and serving size.'

/* ---------- small numeric helpers ---------- */

/** Coerce a value to a finite number, falling back when it is not numeric. */
export function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

/** Round to one decimal place, which is plenty for grams of a macro. */
export function roundToOne(value) {
  return Math.round(toNumber(value) * 10) / 10
}

function toText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Normalise a date input to a local `YYYY-MM-DD` key.
 *
 * Accepts a `Date`, a `YYYY-MM-DD` string, or any parseable date string. An
 * unusable value falls back to the fallback date (today by default) so a
 * missing date can never drop a day's totals into the wrong bucket.
 */
export function normalizeDateKey(value, fallback = new Date()) {
  if (value instanceof Date) return toDateKey(value) ?? toDateKey(fallback)

  const text = toText(value)
  if (text !== '') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
    const parsed = new Date(text)
    if (!Number.isNaN(parsed.getTime())) return toDateKey(parsed) ?? toDateKey(fallback)
  }

  return toDateKey(fallback)
}

/**
 * The `YYYY-MM-DD` keys for the most recent days, newest first.
 *
 * Used by the nutrition history so a run of days is always consistent and
 * spans exactly `count` days regardless of month or year boundaries. The count
 * is clamped to at least 1 so a bad argument can never yield an empty timeline.
 */
export function recentDayKeys(count = 7, from = new Date()) {
  const total = Math.max(1, Math.floor(toNumber(count, 7)))
  const base = new Date(`${normalizeDateKey(from)}T00:00:00`)

  const keys = []
  for (let index = 0; index < total; index += 1) {
    const date = new Date(base)
    date.setDate(base.getDate() - index)
    keys.push(toDateKey(date))
  }
  return keys
}

/* ---------- daily targets ---------- */
/**
 * Clean the stored nutrition targets.
 *
 * Both targets are non-negative numbers; anything unset, corrupt or negative
 * becomes 0, which the summary reads as "no target set" instead of "0 kcal
 * allowed". A target therefore never goes missing silently and never blocks a
 * full day of eating.
 */
export function normalizeNutritionProfile(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {}

  return {
    dailyCalorieTarget: Math.max(0, Math.round(toNumber(source.dailyCalorieTarget, 0))),
    dailyProteinTarget: Math.max(0, roundToOne(source.dailyProteinTarget)),
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : null,
  }
}

/* ---------- scaling a food to the servings logged ---------- */

/**
 * Scale one food's nutrition to the number of servings eaten.
 *
 * A simple multiplier: 2 servings of a 100 g / 165 kcal food is ~330 kcal.
 * Non-numeric servings fall back to 1; zero or negative servings scale to zero
 * (the UI never logs those, but a corrupt value must not invent calories).
 *
 * @param {{calories?: number, protein?: number, carbs?: number, fats?: number}} food
 * @param {number} servings
 * @returns {{calories: number, protein: number, carbs: number, fats: number}}
 */
export function scaleNutrition(food = {}, servings = 1) {
  const amount = toNumber(servings, 1)
  const factor = amount > 0 ? amount : 0

  return {
    calories: Math.round(toNumber(food.calories) * factor),
    protein: roundToOne(toNumber(food.protein) * factor),
    carbs: roundToOne(toNumber(food.carbs) * factor),
    fats: roundToOne(toNumber(food.fats) * factor),
  }
}

/* ---------- food-log entries ---------- */

/** A fresh id for a logged food. */
export function createFoodLogId(now = new Date()) {
  const random = Math.random().toString(36).slice(2, 8)
  return `${FOOD_LOG_ID_PREFIX}${now.getTime()}-${random}`
}

/**
 * Build one food-log entry from a chosen food and a serving count.
 *
 * The entry stores the values *already scaled* to the servings, so a day's
 * totals are a plain sum and a stored entry can never disagree with the food it
 * came from. The nutrition source is the food, overridable by the caller (used
 * when logging a custom food).
 *
 * @param {object} input
 * @param {object} input.food            a food record (built-in or custom)
 * @param {string} [input.meal]          one of MEALS
 * @param {number} [input.servings]      default 1
 * @param {Date|string} [input.date]     the day the food belongs to
 * @param {string} [input.id]            preserve an existing id when re-editing
 * @param {Date} [now]
 * @returns {object|null} `null` when there is no food name to log
 */
export function createFoodLogEntry(input = {}, now = new Date()) {
  const food = input.food ?? {}
  const name = toText(input.name) || toText(food.name)
  if (name === '') return null

  const servings = toNumber(input.servings, 1)
  const safeServings = servings > 0 ? servings : 1

  const scaled = scaleNutrition(
    {
      calories: input.calories ?? food.calories,
      protein: input.protein ?? food.protein,
      carbs: input.carbs ?? food.carbs,
      fats: input.fats ?? food.fats,
    },
    safeServings,
  )

  return {
    id: toText(input.id) || createFoodLogId(now),
    date: normalizeDateKey(input.date, now),
    meal: MEALS.includes(input.meal) ? input.meal : MEALS[0],
    foodId: toText(input.foodId) || toText(food.id) || null,
    name,
    servingSize: toText(input.servingSize) || toText(food.servingSize),
    servings: roundToOne(safeServings),
    calories: scaled.calories,
    protein: scaled.protein,
    carbs: scaled.carbs,
    fats: scaled.fats,
    category: toText(input.category) || toText(food.category),
    custom: Boolean(input.custom ?? food.custom),
    createdAt: toText(input.createdAt) || now.toISOString(),
  }
}

/**
 * Read a stored food log.
 *
 * Deliberately forgiving: a corrupt or non-array payload degrades to an empty
 * log, and each entry is coerced to a renderable shape. One bad record can
 * therefore never blank out the whole day.
 */
export function parseFoodLog(value) {
  if (!Array.isArray(value)) return []

  return value
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      id: toText(item.id),
      date: toText(item.date),
      meal: MEALS.includes(item.meal) ? item.meal : MEALS[0],
      foodId: toText(item.foodId) || null,
      name: toText(item.name) || 'Food',
      servingSize: toText(item.servingSize),
      servings: roundToOne(toNumber(item.servings, 1)),
      calories: roundToOne(toNumber(item.calories)),
      protein: roundToOne(toNumber(item.protein)),
      carbs: roundToOne(toNumber(item.carbs)),
      fats: roundToOne(toNumber(item.fats)),
      category: toText(item.category),
      custom: Boolean(item.custom),
      createdAt: toText(item.createdAt),
    }))
    .filter((item) => item.id !== '' && item.name !== '')
}

/* ---------- day totals ---------- */

/** All entries logged on a given day (defaults to today). */
export function entriesForDate(entries, date = new Date()) {
  const key = normalizeDateKey(date)
  if (!Array.isArray(entries)) return []
  return entries.filter((item) => item?.date === key)
}

/** Sum the nutrition across a list of entries. */
export function sumNutrition(entries) {
  const list = Array.isArray(entries) ? entries : []

  const totals = list.reduce(
    (running, item) => ({
      calories: running.calories + toNumber(item?.calories),
      protein: running.protein + toNumber(item?.protein),
      carbs: running.carbs + toNumber(item?.carbs),
      fats: running.fats + toNumber(item?.fats),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  )

  return totals
}

/** Round a totals object for display. */
export function roundTotals(totals = {}) {
  return {
    calories: Math.round(toNumber(totals.calories)),
    protein: roundToOne(totals.protein),
    carbs: roundToOne(totals.carbs),
    fats: roundToOne(totals.fats),
  }
}

/** Consumed calories, protein, carbs and fats for a day (defaults to today). */
export function dailyTotals(entries, date = new Date()) {
  return roundTotals(sumNutrition(entriesForDate(entries, date)))
}

/** Consumed calories for a day. */
export function getDailyCalories(entries, date = new Date()) {
  return dailyTotals(entries, date).calories
}

/** Consumed protein (g) for a day. */
export function getDailyProtein(entries, date = new Date()) {
  return dailyTotals(entries, date).protein
}

/** Consumed carbs (g) for a day. */
export function getDailyCarbs(entries, date = new Date()) {
  return dailyTotals(entries, date).carbs
}

/** Consumed fats (g) for a day. */
export function getDailyFats(entries, date = new Date()) {
  return dailyTotals(entries, date).fats
}

/**
 * Calories still allowed today.
 *
 * May be negative once the target is passed; callers render that as
 * "X kcal over target" rather than hiding it.
 */
export function getRemainingCalories(entries, target, date = new Date()) {
  return Math.round(toNumber(target, 0) - getDailyCalories(entries, date))
}

/** Protein (g) still allowed today; may be negative once the target is passed. */
export function getRemainingProtein(entries, target, date = new Date()) {
  return roundToOne(toNumber(target, 0) - getDailyProtein(entries, date))
}

/* ---------- meal grouping & progress ---------- */

/**
 * Group a day's entries by meal, always returning every meal key (even empty)
 * so the log renders a stable Breakfast/Lunch/Dinner/Snack column set.
 */
export function groupEntriesByMeal(entries, date = new Date()) {
  const groups = Object.fromEntries(MEALS.map((meal) => [meal, []]))
  for (const entry of entriesForDate(entries, date)) {
    if (!groups[entry.meal]) groups[entry.meal] = []
    groups[entry.meal].push(entry)
  }
  return groups
}

/** Percentage of a target used, clamped to 0-100 for a progress bar. */export function progressPercent(consumed, target) {
  const goal = toNumber(target, 0)
  if (goal <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((toNumber(consumed, 0) / goal) * 100)))
}

/**
 * One object with everything the daily summary needs.
 *
 * A missing target is `null` rather than 0, so the UI can say "set a target"
 * instead of falsely reporting a full day of calories remaining.
 */
export function summariseDay(entries, targets = {}, date = new Date()) {
  const forDay = entriesForDate(entries, date)
  const consumed = roundTotals(sumNutrition(forDay))

  const calorieTarget = toNumber(targets.dailyCalorieTarget, 0)
  const proteinTarget = toNumber(targets.dailyProteinTarget, 0)
  const hasCalorieTarget = calorieTarget > 0
  const hasProteinTarget = proteinTarget > 0

  const remainingCalories = hasCalorieTarget
    ? Math.round(calorieTarget - consumed.calories)
    : null
  const remainingProtein = hasProteinTarget ? roundToOne(proteinTarget - consumed.protein) : null

  return {
    consumed,
    entryCount: forDay.length,
    hasCalorieTarget,
    hasProteinTarget,
    calorieTarget,
    proteinTarget,
    remainingCalories,
    remainingProtein,
    overCalories: remainingCalories !== null && remainingCalories < 0,
    overProtein: remainingProtein !== null && remainingProtein < 0,
    caloriePercent: progressPercent(consumed.calories, calorieTarget),
    proteinPercent: progressPercent(consumed.protein, proteinTarget),
  }
}

/* ---------- formatting ---------- */

/** "1,650 kcal" for a calorie figure; "—" for a missing one. */
export function formatCalories(value) {
  if (value === null || value === undefined || value === '') return '—'
  return `${Math.round(toNumber(value)).toLocaleString()} kcal`
}

/** "31 g" for a macro figure; "—" for a missing one. */
export function formatGrams(value) {
  if (value === null || value === undefined || value === '') return '—'
  return `${roundToOne(value).toLocaleString()} g`
}
