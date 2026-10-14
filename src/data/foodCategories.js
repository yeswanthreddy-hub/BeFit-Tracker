/**
 * Canonical BeFit food categories.
 *
 * This is the single source of truth for the diet feature. Category names,
 * order and visual identifiers live here so no screen hardcodes a food group:
 * the diet food browser, the food rows and the custom-food form all read from
 * this list.
 *
 * `accent` stays inside the BeFit palette (lime -> teal), exactly like the
 * exercise categories, so eight food groups still look like one product.
 *
 * @typedef {Object} FoodCategory
 * @property {string} id           slug used by the food visual, e.g. "protein"
 * @property {string} name         display name, and the value used by `food.category`
 * @property {string} description  one line explaining what the category covers
 * @property {string} icon         visual identifier consumed by the diet UI
 * @property {string} accent       accent colour used for the category's highlights
 */

/** @type {FoodCategory[]} */
export const FOOD_CATEGORIES = [
  {
    id: 'protein',
    name: 'Protein',
    description: 'Meat, fish, eggs, plant proteins and other main sources of protein.',
    icon: 'protein',
    accent: '#b9f34a',
  },
  {
    id: 'carbs',
    name: 'Carbs',
    description: 'Rice, bread, pasta, oats, potatoes and other staple carbohydrates.',
    icon: 'carbs',
    accent: '#22d3ee',
  },
  {
    id: 'fruits',
    name: 'Fruits',
    description: 'Fresh and frozen fruit for natural sugars, fibre and vitamins.',
    icon: 'fruits',
    accent: '#d4ff7a',
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    description: 'Leafy greens and other vegetables for volume, fibre and micronutrients.',
    icon: 'vegetables',
    accent: '#5ee0a8',
  },
  {
    id: 'healthy-fats',
    name: 'Healthy Fats',
    description: 'Nuts, seeds, oils and avocado for fat that supports your training.',
    icon: 'healthy-fats',
    accent: '#39d7c9',
  },
  {
    id: 'dairy',
    name: 'Dairy',
    description: 'Milk, yoghurt and cheese for protein, calcium and easy calories.',
    icon: 'dairy',
    accent: '#6ee7b7',
  },
  {
    id: 'snacks',
    name: 'Snacks',
    description: 'Treats and convenience foods — logged the same way, no judgement.',
    icon: 'snacks',
    accent: '#a3e635',
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Drinks, condiments and anything that does not fit a group above.',
    icon: 'other',
    accent: '#2ac8b4',
  },
]

/**
 * Category names in display order.
 *
 * The food browser filters and the custom-food form import this list instead of
 * keeping their own copy, so a category can never drift out of sync.
 *
 * @type {string[]}
 */
export const FOOD_CATEGORY_NAMES = FOOD_CATEGORIES.map((category) => category.name)

/** Look up a category record by its display name. */
export function getFoodCategory(name) {
  return FOOD_CATEGORIES.find((category) => category.name === name) ?? null
}

/** Whether `name` is one of the canonical category names. */
export function isFoodCategory(name) {
  return FOOD_CATEGORY_NAMES.includes(name)
}

/** Category used when a food carries an unknown category name. */
export const FALLBACK_FOOD_CATEGORY_NAME = 'Other'

/**
 * Safe lookup used by rendering code, which must never assume a category
 * exists: an unknown name falls back to the "Other" record.
 *
 * @param {string} name
 * @returns {FoodCategory}
 */
export function getFoodCategoryOrFallback(name) {
  return (
    getFoodCategory(name) ??
    getFoodCategory(FALLBACK_FOOD_CATEGORY_NAME) ??
    FOOD_CATEGORIES[FOOD_CATEGORIES.length - 1]
  )
}
