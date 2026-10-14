/**
 * Custom food rules.
 *
 * A custom food is the same shape as a built-in food (`id, name, category,
 * servingSize, calories, protein, carbs, fats`) plus a `custom` marker and
 * audit timestamps. The difference is where it lives: localStorage rather than
 * in code. Everything here is therefore defensive — `normalizeCustomFoods` is
 * the only way stored data reaches the UI, so a half-written or hand-edited
 * payload degrades into something renderable instead of breaking the form.
 *
 * Nothing in this file touches storage or React.
 */

import { FOOD_CATEGORY_NAMES, getFoodCategoryOrFallback } from '../data/foodCategories'

/** Marker stored on every saved food so custom and built-ins stay distinct. */
export const CUSTOM_FOOD_TYPE = 'custom'

/** Prefix for generated ids, so a custom food is recognisable at a glance. */
export const CUSTOM_FOOD_ID_PREFIX = 'custom-food-'

/** Human-readable validation messages, kept together like the auth ones. */
export const FOOD_MESSAGES = {
  nameRequired: 'Please give this food a name.',
  nameTooLong: 'Food names must be 60 characters or fewer.',
  servingRequired: 'Describe one serving, e.g. "100 g" or "1 cup".',
  servingTooLong: 'Serving descriptions must be 40 characters or fewer.',
  valueInvalid: 'Calories and macros must be numbers of 0 or more.',
}

export const MAX_FOOD_NAME_LENGTH = 60
export const MAX_SERVING_LENGTH = 40

/** Sensible upper bounds so a mistyped value cannot dominate a whole day. */
export const MAX_CALORIES_PER_SERVING = 5000
export const MAX_MACRO_PER_SERVING = 1000

function toText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function clampNumber(value, min, max, fallback = 0, round = Math.round) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return round(Math.min(Math.max(number, min), max))
}

function pickOne(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback
}

/** A fresh id for a saved custom food. */
export function createCustomFoodId(now = new Date()) {
  return `${CUSTOM_FOOD_ID_PREFIX}${now.getTime()}`
}

/** Whether a food record is one the athlete saved (not a built-in). */
export function isCustomFood(food) {
  return (
    food?.custom === true ||
    String(food?.id ?? '').startsWith(CUSTOM_FOOD_ID_PREFIX)
  )
}

/**
 * Clean one stored custom food.
 *
 * Numbers are clamped rather than rejected so a corrupt payload can never
 * render "NaN kcal". Returns `null` when there is no usable name, which is the
 * one field the tracker genuinely needs.
 *
 * @param {unknown} value
 * @returns {object|null}
 */
export function normalizeCustomFood(value) {
  const id = toText(value?.id) || createCustomFoodId()
  const name = toText(value?.name)
  if (name === '') return null

  return {
    id,
    name: name.slice(0, MAX_FOOD_NAME_LENGTH),
    category: pickOne(
      value?.category,
      FOOD_CATEGORY_NAMES,
      getFoodCategoryOrFallback(value?.category).name,
    ),
    servingSize: toText(value?.servingSize).slice(0, MAX_SERVING_LENGTH),
    calories: clampNumber(value?.calories, 0, MAX_CALORIES_PER_SERVING, 0),
    protein: clampNumber(value?.protein, 0, MAX_MACRO_PER_SERVING, 0),
    carbs: clampNumber(value?.carbs, 0, MAX_MACRO_PER_SERVING, 0),
    fats: clampNumber(value?.fats, 0, MAX_MACRO_PER_SERVING, 0),
    custom: true,
    createdAt: typeof value?.createdAt === 'string' ? value.createdAt : null,
    updatedAt: typeof value?.updatedAt === 'string' ? value.updatedAt : null,
  }
}

/**
 * Clean a whole stored list, dropping unusable records and duplicate ids.
 *
 * @param {unknown} value
 * @returns {object[]} always an array
 */
export function normalizeCustomFoods(value) {
  if (!Array.isArray(value)) return []

  const seen = new Set()
  const foods = []

  for (const entry of value) {
    const food = normalizeCustomFood(entry)
    if (!food || seen.has(food.id)) continue

    seen.add(food.id)
    foods.push(food)
  }

  return foods
}

/**
 * Turn a form draft into a storable custom food.
 *
 * @param {object} draft
 * @param {Date} [now]
 * @returns {object|null} `null` when the draft has no usable name
 */
export function createCustomFood(draft = {}, now = new Date()) {
  const timestamp = now.toISOString()

  return normalizeCustomFood({
    ...draft,
    id: createCustomFoodId(now),
    custom: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

/**
 * Apply an edit to a saved custom food, keeping its id and creation date.
 *
 * @param {object} existing
 * @param {object} draft
 * @param {Date} [now]
 * @returns {object|null}
 */
export function updateCustomFood(existing, draft = {}, now = new Date()) {
  if (!existing?.id) return null

  return normalizeCustomFood({
    ...draft,
    id: existing.id,
    custom: true,
    createdAt: existing.createdAt,
    updatedAt: now.toISOString(),
  })
}

/** Find one saved custom food. */
export function getCustomFood(foods, id) {
  if (!Array.isArray(foods) || typeof id !== 'string' || id === '') return null
  return foods.find((food) => food.id === id) ?? null
}

/** Insert a food, or replace it when the id already exists. */
export function upsertCustomFood(foods, food) {
  const list = Array.isArray(foods) ? foods : []
  const clean = normalizeCustomFood(food)
  if (!clean) return list

  return [...list.filter((item) => item.id !== clean.id), clean]
}

/** Remove a saved custom food. */
export function removeCustomFood(foods, id) {
  if (!Array.isArray(foods)) return []
  return foods.filter((food) => food.id !== id)
}

/**
 * Validate the custom-food form.
 *
 * Returns only the failing keys, so the form can render a message next to the
 * field that caused it.
 *
 * @param {object} draft
 * @returns {Object<string, string>}
 */
export function validateCustomFoodDraft(draft = {}) {
  const errors = {}
  const name = toText(draft.name)

  if (name === '') {
    errors.name = FOOD_MESSAGES.nameRequired
  } else if (name.length > MAX_FOOD_NAME_LENGTH) {
    errors.name = FOOD_MESSAGES.nameTooLong
  }

  if (toText(draft.servingSize).length > MAX_SERVING_LENGTH) {
    errors.servingSize = FOOD_MESSAGES.servingTooLong
  }

  const macros = ['calories', 'protein', 'carbs', 'fats']
  const invalidValue = macros.some((key) => {
    if (draft[key] === '' || draft[key] === null || draft[key] === undefined) return false
    const number = Number(draft[key])
    return !Number.isFinite(number) || number < 0
  })
  if (invalidValue) errors.calories = FOOD_MESSAGES.valueInvalid

  return errors
}

/** A blank draft for the custom-food form. */
export function createCustomFoodDraft() {
  return {
    name: '',
    category: FOOD_CATEGORY_NAMES[0],
    servingSize: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  }
}
