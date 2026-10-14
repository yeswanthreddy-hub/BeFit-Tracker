/**
 * BeFit food library.
 *
 * A small, curated catalog of common foods used by the diet tracker. Every
 * record has the same shape, so the food browser, the meal log rows and the
 * custom-food form all read one structure without special cases:
 *
 * ```js
 * { id, name, category, servingSize, calories, protein, carbs, fats }
 * ```
 *
 * IMPORTANT — Nutrition values are approximate reference values for the listed
 * serving size. They may vary by brand, preparation and serving size, so they
 * are a starting point for tracking, not an exact measurement. Nothing here is
 * medical or dietary advice.
 *
 * The catalog ships in code (not localStorage): it is product content, it is
 * small, and it must work for a signed-out visitor before any data exists.
 * Only user-owned data (logged meals and custom foods) is persisted.
 */

import { FOOD_CATEGORY_NAMES, getFoodCategoryOrFallback } from './foodCategories'

/**
 * @typedef {Object} Food
 * @property {string} id           unique slug, e.g. "chicken-breast"
 * @property {string} name         display name
 * @property {string} category     one of FOOD_CATEGORY_NAMES
 * @property {string} servingSize  what the numbers describe, e.g. "100 g"
 * @property {number} calories     approximate kcal per serving
 * @property {number} protein      approximate protein (g) per serving
 * @property {number} carbs        approximate carbs (g) per serving
 * @property {number} fats         approximate fat (g) per serving
 */

/** Shown next to the food data so the numbers are never mistaken for exact. */
export const FOOD_NUTRITION_NOTE =
  'Nutrition values are approximate and may vary by brand, preparation, and serving size.'

/**
 * Fill in a complete food record.
 *
 * Every field is defaulted, so a new entry can never be missing a property the
 * tracker relies on. An unknown category falls back to "Other" rather than
 * leaving a food unrenderable.
 *
 * @param {Partial<Food>} partial
 * @returns {Food}
 */
export function defineFood(partial = {}) {
  const { category, ...rest } = partial

  return {
    id: '',
    name: '',
    servingSize: '1 serving',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    ...rest,
    category: getFoodCategoryOrFallback(category).name,
  }
}

/** @type {Food[]} */
export const FOODS = [
  /* ---------- protein ---------- */
  defineFood({
    id: 'chicken-breast',
    name: 'Chicken Breast (cooked)',
    category: 'Protein',
    servingSize: '100 g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
  }),
  defineFood({
    id: 'lean-beef',
    name: 'Lean Beef (cooked)',
    category: 'Protein',
    servingSize: '100 g',
    calories: 217,
    protein: 26,
    carbs: 0,
    fats: 12,
  }),
  defineFood({
    id: 'salmon',
    name: 'Salmon (cooked)',
    category: 'Protein',
    servingSize: '100 g',
    calories: 208,
    protein: 20,
    carbs: 0,
    fats: 13,
  }),
  defineFood({
    id: 'tuna',
    name: 'Tuna (canned in water)',
    category: 'Protein',
    servingSize: '100 g',
    calories: 116,
    protein: 26,
    carbs: 0,
    fats: 0.8,
  }),
  defineFood({
    id: 'whole-egg',
    name: 'Whole Egg',
    category: 'Protein',
    servingSize: '1 large',
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fats: 4.8,
  }),
  defineFood({
    id: 'egg-white',
    name: 'Egg White',
    category: 'Protein',
    servingSize: '1 large',
    calories: 17,
    protein: 3.6,
    carbs: 0.2,
    fats: 0.1,
  }),
  defineFood({
    id: 'turkey-breast',
    name: 'Turkey Breast (cooked)',
    category: 'Protein',
    servingSize: '100 g',
    calories: 135,
    protein: 30,
    carbs: 0,
    fats: 1,
  }),
  defineFood({
    id: 'tofu',
    name: 'Tofu (firm)',
    category: 'Protein',
    servingSize: '100 g',
    calories: 144,
    protein: 17,
    carbs: 3,
    fats: 9,
  }),
  defineFood({
    id: 'whey-protein',
    name: 'Whey Protein',
    category: 'Protein',
    servingSize: '1 scoop (30 g)',
    calories: 120,
    protein: 24,
    carbs: 3,
    fats: 1.5,
  }),

  /* ---------- carbs ---------- */
  defineFood({
    id: 'white-rice',
    name: 'White Rice (cooked)',
    category: 'Carbs',
    servingSize: '100 g',
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fats: 0.3,
  }),
  defineFood({
    id: 'brown-rice',
    name: 'Brown Rice (cooked)',
    category: 'Carbs',
    servingSize: '100 g',
    calories: 123,
    protein: 2.7,
    carbs: 26,
    fats: 1,
  }),
  defineFood({
    id: 'oats',
    name: 'Oats (dry)',
    category: 'Carbs',
    servingSize: '40 g',
    calories: 150,
    protein: 5,
    carbs: 27,
    fats: 3,
  }),
  defineFood({
    id: 'whole-wheat-bread',
    name: 'Whole Wheat Bread',
    category: 'Carbs',
    servingSize: '1 slice',
    calories: 80,
    protein: 4,
    carbs: 14,
    fats: 1,
  }),
  defineFood({
    id: 'white-bread',
    name: 'White Bread',
    category: 'Carbs',
    servingSize: '1 slice',
    calories: 75,
    protein: 2.5,
    carbs: 14,
    fats: 1,
  }),
  defineFood({
    id: 'pasta',
    name: 'Pasta (cooked)',
    category: 'Carbs',
    servingSize: '100 g',
    calories: 158,
    protein: 5.8,
    carbs: 31,
    fats: 0.9,
  }),
  defineFood({
    id: 'potato',
    name: 'Potato (boiled)',
    category: 'Carbs',
    servingSize: '100 g',
    calories: 87,
    protein: 2,
    carbs: 20,
    fats: 0.1,
  }),
  defineFood({
    id: 'sweet-potato',
    name: 'Sweet Potato (baked)',
    category: 'Carbs',
    servingSize: '100 g',
    calories: 90,
    protein: 2,
    carbs: 21,
    fats: 0.2,
  }),
  defineFood({
    id: 'quinoa',
    name: 'Quinoa (cooked)',
    category: 'Carbs',
    servingSize: '100 g',
    calories: 120,
    protein: 4.4,
    carbs: 21,
    fats: 1.9,
  }),
  defineFood({
    id: 'lentils',
    name: 'Lentils (cooked)',
    category: 'Carbs',
    servingSize: '100 g',
    calories: 116,
    protein: 9,
    carbs: 20,
    fats: 0.4,
  }),

  /* ---------- fruits ---------- */
  defineFood({
    id: 'banana',
    name: 'Banana',
    category: 'Fruits',
    servingSize: '1 medium',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fats: 0.4,
  }),
  defineFood({
    id: 'apple',
    name: 'Apple',
    category: 'Fruits',
    servingSize: '1 medium',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fats: 0.3,
  }),
  defineFood({
    id: 'orange',
    name: 'Orange',
    category: 'Fruits',
    servingSize: '1 medium',
    calories: 62,
    protein: 1.2,
    carbs: 15,
    fats: 0.2,
  }),
  defineFood({
    id: 'strawberries',
    name: 'Strawberries',
    category: 'Fruits',
    servingSize: '100 g',
    calories: 32,
    protein: 0.7,
    carbs: 7.7,
    fats: 0.3,
  }),
  defineFood({
    id: 'blueberries',
    name: 'Blueberries',
    category: 'Fruits',
    servingSize: '100 g',
    calories: 57,
    protein: 0.7,
    carbs: 14,
    fats: 0.3,
  }),
  defineFood({
    id: 'mango',
    name: 'Mango',
    category: 'Fruits',
    servingSize: '100 g',
    calories: 60,
    protein: 0.8,
    carbs: 15,
    fats: 0.4,
  }),

  /* ---------- vegetables ---------- */
  defineFood({
    id: 'broccoli',
    name: 'Broccoli (cooked)',
    category: 'Vegetables',
    servingSize: '100 g',
    calories: 35,
    protein: 2.4,
    carbs: 7,
    fats: 0.4,
  }),
  defineFood({
    id: 'spinach',
    name: 'Spinach (raw)',
    category: 'Vegetables',
    servingSize: '100 g',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fats: 0.4,
  }),
  defineFood({
    id: 'carrot',
    name: 'Carrot',
    category: 'Vegetables',
    servingSize: '100 g',
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fats: 0.2,
  }),
  defineFood({
    id: 'mixed-greens',
    name: 'Mixed Salad Greens',
    category: 'Vegetables',
    servingSize: '100 g',
    calories: 15,
    protein: 1.4,
    carbs: 2.9,
    fats: 0.2,
  }),
  defineFood({
    id: 'tomato',
    name: 'Tomato',
    category: 'Vegetables',
    servingSize: '100 g',
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fats: 0.2,
  }),
  defineFood({
    id: 'bell-pepper',
    name: 'Bell Pepper',
    category: 'Vegetables',
    servingSize: '100 g',
    calories: 26,
    protein: 1,
    carbs: 6,
    fats: 0.3,
  }),
  defineFood({
    id: 'cucumber',
    name: 'Cucumber',
    category: 'Vegetables',
    servingSize: '100 g',
    calories: 15,
    protein: 0.7,
    carbs: 3.6,
    fats: 0.1,
  }),
  defineFood({
    id: 'green-beans',
    name: 'Green Beans (cooked)',
    category: 'Vegetables',
    servingSize: '100 g',
    calories: 35,
    protein: 1.9,
    carbs: 8,
    fats: 0.1,
  }),

  /* ---------- healthy fats ---------- */
  defineFood({
    id: 'almonds',
    name: 'Almonds',
    category: 'Healthy Fats',
    servingSize: '30 g',
    calories: 170,
    protein: 6,
    carbs: 6,
    fats: 15,
  }),
  defineFood({
    id: 'walnuts',
    name: 'Walnuts',
    category: 'Healthy Fats',
    servingSize: '30 g',
    calories: 196,
    protein: 4.6,
    carbs: 4.1,
    fats: 19.6,
  }),
  defineFood({
    id: 'peanut-butter',
    name: 'Peanut Butter',
    category: 'Healthy Fats',
    servingSize: '1 tbsp',
    calories: 94,
    protein: 4,
    carbs: 3,
    fats: 8,
  }),
  defineFood({
    id: 'olive-oil',
    name: 'Olive Oil',
    category: 'Healthy Fats',
    servingSize: '1 tbsp',
    calories: 119,
    protein: 0,
    carbs: 0,
    fats: 13.5,
  }),
  defineFood({
    id: 'avocado',
    name: 'Avocado',
    category: 'Healthy Fats',
    servingSize: '100 g',
    calories: 160,
    protein: 2,
    carbs: 9,
    fats: 15,
  }),
  defineFood({
    id: 'chia-seeds',
    name: 'Chia Seeds',
    category: 'Healthy Fats',
    servingSize: '1 tbsp',
    calories: 58,
    protein: 2,
    carbs: 5,
    fats: 3.7,
  }),

  /* ---------- dairy ---------- */
  defineFood({
    id: 'greek-yogurt',
    name: 'Greek Yogurt (plain)',
    category: 'Dairy',
    servingSize: '100 g',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fats: 0.4,
  }),
  defineFood({
    id: 'whole-milk',
    name: 'Whole Milk',
    category: 'Dairy',
    servingSize: '250 ml',
    calories: 149,
    protein: 8,
    carbs: 12,
    fats: 8,
  }),
  defineFood({
    id: 'skim-milk',
    name: 'Skim Milk',
    category: 'Dairy',
    servingSize: '250 ml',
    calories: 83,
    protein: 8,
    carbs: 12,
    fats: 0.2,
  }),
  defineFood({
    id: 'cottage-cheese',
    name: 'Cottage Cheese (low-fat)',
    category: 'Dairy',
    servingSize: '100 g',
    calories: 72,
    protein: 12,
    carbs: 3,
    fats: 1,
  }),

  /* ---------- snacks ---------- */
  defineFood({
    id: 'dark-chocolate',
    name: 'Dark Chocolate (70%)',
    category: 'Snacks',
    servingSize: '30 g',
    calories: 170,
    protein: 2,
    carbs: 10,
    fats: 12,
  }),
  defineFood({
    id: 'potato-chips',
    name: 'Potato Chips',
    category: 'Snacks',
    servingSize: '30 g',
    calories: 160,
    protein: 2,
    carbs: 15,
    fats: 10,
  }),
  defineFood({
    id: 'granola-bar',
    name: 'Granola Bar',
    category: 'Snacks',
    servingSize: '1 bar',
    calories: 190,
    protein: 5,
    carbs: 29,
    fats: 7,
  }),
  defineFood({
    id: 'popcorn',
    name: 'Popcorn (air-popped)',
    category: 'Snacks',
    servingSize: '30 g',
    calories: 116,
    protein: 3.9,
    carbs: 23,
    fats: 1.4,
  }),

  /* ---------- other ---------- */
  defineFood({
    id: 'honey',
    name: 'Honey',
    category: 'Other',
    servingSize: '1 tbsp',
    calories: 64,
    protein: 0.1,
    carbs: 17,
    fats: 0,
  }),
  defineFood({
    id: 'hummus',
    name: 'Hummus',
    category: 'Other',
    servingSize: '2 tbsp',
    calories: 70,
    protein: 2,
    carbs: 4,
    fats: 5,
  }),
]

/** Look up a built-in food by id. */
export function getFoodById(id) {
  if (typeof id !== 'string' || id === '') return null
  return FOODS.find((food) => food.id === id) ?? null
}

/** How many foods sit in each category, keyed by category name. */
export function countFoodsByCategory(foods = FOODS) {
  const counts = Object.fromEntries(FOOD_CATEGORY_NAMES.map((name) => [name, 0]))

  for (const food of foods) {
    if (counts[food.category] !== undefined) {
      counts[food.category] += 1
    }
  }

  return counts
}
