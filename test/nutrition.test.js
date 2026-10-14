import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  MEALS,
  createFoodLogEntry,
  dailyTotals,
  entriesForDate,
  formatCalories,
  formatGrams,
  getDailyCalories,
  getDailyProtein,
  getRemainingCalories,
  getRemainingProtein,
  groupEntriesByMeal,
  normalizeDateKey,
  normalizeNutritionProfile,
  parseFoodLog,
  progressPercent,
  recentDayKeys,
  roundToOne,
  scaleNutrition,
  summariseDay,
} from '../src/utils/nutrition.js'
import {
  createCustomFood,
  isCustomFood,
  normalizeCustomFoods,
  removeCustomFood,
  updateCustomFood,
  upsertCustomFood,
  validateCustomFoodDraft,
} from '../src/utils/customFoods.js'
import { FOODS, getFoodById } from '../src/data/foods.js'
import {
  FOOD_CATEGORY_NAMES,
  getFoodCategoryOrFallback,
} from '../src/data/foodCategories.js'

const CHICKEN = {
  id: 'chicken-breast',
  name: 'Chicken Breast (cooked)',
  category: 'Protein',
  servingSize: '100 g',
  calories: 165,
  protein: 31,
  carbs: 0,
  fats: 3.6,
}

describe('food data foundation', () => {
  it('ships a non-empty catalog with only canonical categories', () => {
    assert.ok(FOODS.length >= 30, 'expected a useful number of foods')
    for (const food of FOODS) {
      assert.ok(FOOD_CATEGORY_NAMES.includes(food.category), `${food.id} category`)
      assert.ok(food.name.length > 0)
      assert.ok(Number.isFinite(food.calories) && food.calories >= 0)
    }
  })

  it('gives every food a unique id', () => {
    const ids = new Set(FOODS.map((food) => food.id))
    assert.equal(ids.size, FOODS.length)
  })

  it('looks foods up by id and falls back for unknown categories', () => {
    assert.equal(getFoodById('chicken-breast').name, 'Chicken Breast (cooked)')
    assert.equal(getFoodById('nope'), null)
    assert.equal(getFoodCategoryOrFallback('Made Up').name, 'Other')
  })
})

describe('scaleNutrition', () => {
  it('multiplies every value by the serving count', () => {
    assert.deepEqual(scaleNutrition(CHICKEN, 2), {
      calories: 330,
      protein: 62,
      carbs: 0,
      fats: 7.2,
    })
  })

  it('treats a missing or invalid serving count as one', () => {
    assert.equal(scaleNutrition(CHICKEN).calories, 165)
    assert.equal(scaleNutrition(CHICKEN, 'abc').calories, 165)
  })

  it('never scales up from a zero or negative count', () => {
    assert.equal(scaleNutrition(CHICKEN, 0).calories, 0)
    assert.equal(scaleNutrition(CHICKEN, -3).calories, 0)
  })

  it('handles a half serving', () => {
    assert.equal(scaleNutrition(CHICKEN, 0.5).protein, 15.5)
  })
})

describe('normalizeDateKey', () => {
  it('keeps a YYYY-MM-DD key, converts a Date and falls back otherwise', () => {
    assert.equal(normalizeDateKey('2026-10-14'), '2026-10-14')
    assert.equal(normalizeDateKey(new Date(2026, 9, 14)), '2026-10-14')
    const fallback = new Date(2026, 0, 1)
    assert.equal(normalizeDateKey('', fallback), '2026-01-01')
    assert.equal(normalizeDateKey('not a date', fallback), '2026-01-01')
  })
})

describe('createFoodLogEntry', () => {
  it('stores values already scaled to the servings', () => {
    const now = new Date('2026-10-14T08:00:00.000Z')
    const entry = createFoodLogEntry(
      { food: CHICKEN, meal: 'Lunch', servings: 2, date: new Date(2026, 9, 14) },
      now,
    )

    assert.equal(entry.name, 'Chicken Breast (cooked)')
    assert.equal(entry.meal, 'Lunch')
    assert.equal(entry.date, '2026-10-14')
    assert.equal(entry.servings, 2)
    assert.equal(entry.calories, 330)
    assert.equal(entry.protein, 62)
    assert.equal(entry.foodId, 'chicken-breast')
    assert.ok(entry.id.startsWith('food-log-'))
  })

  it('defaults the meal, the servings and the date', () => {
    const now = new Date(2026, 9, 14, 9, 0, 0)
    const entry = createFoodLogEntry({ food: CHICKEN }, now)

    assert.equal(entry.meal, MEALS[0])
    assert.equal(entry.servings, 1)
    assert.equal(entry.date, '2026-10-14')
    assert.equal(entry.calories, 165)
  })

  it('refuses to log a food with no name', () => {
    assert.equal(createFoodLogEntry({ food: { calories: 100 } }), null)
    assert.equal(createFoodLogEntry({}), null)
  })

  it('carries the custom marker for a custom food', () => {
    const entry = createFoodLogEntry({
      food: { id: 'custom-food-1', name: 'My Shake', calories: 200, custom: true },
    })
    assert.equal(entry.custom, true)
  })
})

describe('parseFoodLog', () => {
  it('keeps renderable entries and drops the rest', () => {
    const parsed = parseFoodLog([
      { id: 'a', name: 'Apple', date: '2026-10-14', meal: 'Snack', calories: '95' },
      null,
      'nope',
      { id: '', name: 'No id' },
    ])
    assert.equal(parsed.length, 1)
    assert.equal(parsed[0].calories, 95)
  })

  it('returns an empty list for a non-array', () => {
    assert.deepEqual(parseFoodLog(undefined), [])
    assert.deepEqual(parseFoodLog({}), [])
  })

  it('coerces a bad meal back into a known bucket', () => {
    const [entry] = parseFoodLog([{ id: 'a', name: 'Apple', meal: 'Brunch' }])
    assert.equal(entry.meal, MEALS[0])
  })
})

describe('day totals', () => {
  const day = new Date(2026, 9, 14)
  const other = new Date(2026, 9, 13)

  const entries = [
    createFoodLogEntry({ food: CHICKEN, meal: 'Lunch', servings: 2, date: day }),
    createFoodLogEntry(
      { food: { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4 }, meal: 'Breakfast', date: day },
    ),
    createFoodLogEntry({ food: CHICKEN, meal: 'Dinner', date: other }),
  ]

  it('filters to a single day', () => {
    assert.equal(entriesForDate(entries, day).length, 2)
    assert.equal(entriesForDate(entries, other).length, 1)
  })

  it('sums a day and exposes named getters', () => {
    assert.deepEqual(dailyTotals(entries, day), {
      calories: 435,
      protein: 63.3,
      carbs: 27,
      fats: 7.6,
    })
    assert.equal(getDailyCalories(entries, day), 435)
    assert.equal(getDailyProtein(entries, day), 63.3)
  })

  it('groups entries by meal with every bucket present', () => {
    const groups = groupEntriesByMeal(entries, day)
    assert.deepEqual(Object.keys(groups), MEALS)
    assert.equal(groups.Lunch.length, 1)
    assert.equal(groups.Dinner.length, 0)
  })
})

describe('remaining targets', () => {
  const day = new Date(2026, 9, 14)
  const entries = [createFoodLogEntry({ food: CHICKEN, servings: 2, date: day })]

  it('subtracts what was eaten from the target', () => {
    assert.equal(getRemainingCalories(entries, 2000, day), 1670)
    assert.equal(getRemainingProtein(entries, 150, day), 88)
  })

  it('goes negative once the target is passed rather than hiding it', () => {
    assert.equal(getRemainingCalories(entries, 300, day), -30)
    assert.equal(getRemainingProtein(entries, 50, day), -12)
  })
})

describe('normalizeNutritionProfile', () => {
  it('keeps positive targets and clamps junk to zero', () => {
    assert.deepEqual(normalizeNutritionProfile({ dailyCalorieTarget: 2200, dailyProteinTarget: 140 }), {
      dailyCalorieTarget: 2200,
      dailyProteinTarget: 140,
      updatedAt: null,
    })
    assert.deepEqual(normalizeNutritionProfile(null), {
      dailyCalorieTarget: 0,
      dailyProteinTarget: 0,
      updatedAt: null,
    })
    assert.equal(normalizeNutritionProfile({ dailyCalorieTarget: -500 }).dailyCalorieTarget, 0)
    assert.equal(normalizeNutritionProfile({ dailyCalorieTarget: 'nope' }).dailyCalorieTarget, 0)
  })
})

describe('progressPercent', () => {
  it('clamps between 0 and 100 and guards a zero target', () => {
    assert.equal(progressPercent(50, 100), 50)
    assert.equal(progressPercent(500, 100), 100)
    assert.equal(progressPercent(-5, 100), 0)
    assert.equal(progressPercent(50, 0), 0)
  })
})

describe('summariseDay', () => {
  const day = new Date(2026, 9, 14)
  const entries = [createFoodLogEntry({ food: CHICKEN, servings: 2, date: day })]

  it('reports remaining figures when targets are set', () => {
    const summary = summariseDay(entries, { dailyCalorieTarget: 1000, dailyProteinTarget: 150 }, day)
    assert.equal(summary.consumed.calories, 330)
    assert.equal(summary.remainingCalories, 670)
    assert.equal(summary.hasCalorieTarget, true)
    assert.equal(summary.overCalories, false)
    assert.equal(summary.caloriePercent, 33)
  })

  it('returns null remaining when no target is set', () => {
    const summary = summariseDay(entries, {}, day)
    assert.equal(summary.remainingCalories, null)
    assert.equal(summary.hasCalorieTarget, false)
  })

  it('flags an over-target day', () => {
    const summary = summariseDay(entries, { dailyCalorieTarget: 200 }, day)
    assert.equal(summary.remainingCalories, -130)
    assert.equal(summary.overCalories, true)
  })
})

describe('formatting', () => {
  it('renders calories and grams, and a dash for a missing value', () => {
    assert.equal(formatCalories(1650), '1,650 kcal')
    assert.equal(formatGrams(31), '31 g')
    assert.equal(formatGrams(3.6), '3.6 g')
    assert.equal(formatCalories(null), '—')
    assert.equal(formatGrams(undefined), '—')
  })

  it('rounds to one decimal place', () => {
    assert.equal(roundToOne(3.64), 3.6)
    assert.equal(roundToOne(3.65), 3.7)
  })
})

describe('custom foods', () => {
  it('creates a custom food with clamped values and a custom marker', () => {
    const food = createCustomFood(
      {
        name: '  My Protein Shake ',
        category: 'Protein',
        servingSize: '1 scoop',
        calories: '210',
        protein: '25',
        carbs: '-4',
        fats: '3',
      },
      new Date('2026-10-14T08:00:00.000Z'),
    )

    assert.equal(food.name, 'My Protein Shake')
    assert.equal(food.calories, 210)
    assert.equal(food.protein, 25)
    assert.equal(food.carbs, 0)
    assert.equal(food.custom, true)
    assert.equal(isCustomFood(food), true)
    assert.ok(food.id.startsWith('custom-food-'))
  })

  it('refuses a food with no name', () => {
    assert.equal(createCustomFood({ name: '   ' }), null)
  })

  it('drops unknown categories back to Other and unusable stored records', () => {
    const [food] = normalizeCustomFoods([
      { id: 'custom-food-1', name: 'Weird', category: 'Nonsense' },
      { name: '' },
      'nope',
    ])
    assert.equal(food.category, 'Other')
    assert.equal(normalizeCustomFoods([{ name: '' }]).length, 0)
  })

  it('upserts by id and removes by id', () => {
    const first = createCustomFood({ name: 'A', calories: 10 })
    const updated = updateCustomFood(first, { name: 'A', calories: 99 })
    const list = upsertCustomFood([first], updated)

    assert.equal(list.length, 1)
    assert.equal(list[0].calories, 99)
    assert.equal(list[0].id, first.id)
    assert.deepEqual(removeCustomFood(list, first.id), [])
  })

  it('validates the draft', () => {
    assert.ok(validateCustomFoodDraft({ name: '' }).name)
    assert.ok(validateCustomFoodDraft({ name: 'A', calories: -1 }).calories)
    assert.deepEqual(validateCustomFoodDraft({ name: 'A', calories: '100' }), {})
  })
})


describe('recentDayKeys', () => {
  it('returns the requested number of consecutive days, newest first', () => {
    const keys = recentDayKeys(3)
    assert.equal(keys.length, 3)
    assert.equal(keys[0], normalizeDateKey(new Date()))

    const [first, second] = keys
    const firstDate = new Date(`${first}T00:00:00`)
    const secondDate = new Date(`${second}T00:00:00`)
    assert.equal(Math.round((firstDate - secondDate) / 86400000), 1)
  })

  it('clamps a bad count to at least one day and defaults non-numbers to 7', () => {
    assert.equal(recentDayKeys(0).length, 1)
    assert.equal(recentDayKeys(-5).length, 1)
    assert.equal(recentDayKeys('nonsense').length, 7)
  })

  it('anchors to a supplied date', () => {
    assert.deepEqual(recentDayKeys(1, '2026-03-10'), ['2026-03-10'])
  })
})

