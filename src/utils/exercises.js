import { EXERCISES } from '../data/exercises'
import {
  EXERCISE_CATEGORY_NAMES,
  getExerciseCategoryOrFallback,
  isExerciseCategory,
} from '../data/exerciseCategories'
import { EXERCISE_DIFFICULTIES, EXERCISE_EQUIPMENT, EXERCISE_TYPES } from '../data/exercises'

/**
 * Exercise lookup helpers.
 *
 * Pure, framework-free functions over the code catalog in
 * `src/data/exercises.js`. The library page, the detail page and the future
 * workout builder all go through here, so identity lookups and data-quality
 * rules live in exactly one place.
 */

/**
 * Find one exercise by its slug.
 *
 * @param {string} id
 * @returns {import('../data/exercises.js').Exercise|null} `null` for an
 * unknown id, which is how the detail page renders its not-found state
 * instead of crashing.
 */
export function getExerciseById(id) {
  if (typeof id !== 'string' || id === '') return null
  return EXERCISES.find((exercise) => exercise.id === id) ?? null
}

/**
 * Every exercise in a category, or the whole library when `category` is
 * omitted.
 *
 * @param {string} [category] one of EXERCISE_CATEGORY_NAMES
 * @returns {import('../data/exercises.js').Exercise[]}
 */
export function getExercisesByCategory(category) {
  if (!category || !isExerciseCategory(category)) return [...EXERCISES]
  return EXERCISES.filter((exercise) => exercise.category === category)
}

/**
 * The category record an exercise belongs to.
 *
 * Falls back to the full-body record so a card can always render an accent
 * colour and description, even for a malformed entry.
 *
 * @param {import('../data/exercises.js').Exercise} exercise
 */
export function getExerciseCategoryRecord(exercise) {
  return getExerciseCategoryOrFallback(exercise?.category)
}

/** Primary muscle of an exercise, used for compact labels. */
export function primaryMuscle(exercise) {
  return exercise?.targetMuscles?.[0] ?? ''
}

/**
 * Every distinct value a field actually uses, in catalog order.
 *
 * Useful for future features (workout builder dropdowns) that need the real
 * values rather than the controlled vocabulary.
 *
 * @param {'category'|'difficulty'|'equipment'|'type'} field
 * @returns {string[]}
 */
export function distinctValues(field) {
  return [...new Set(EXERCISES.map((exercise) => exercise[field]).filter(Boolean))]
}

/**
 * Check one exercise record against the model.
 *
 * @param {import('../data/exercises.js').Exercise} exercise
 * @returns {string[]} human-readable problems; empty means the record is sound
 */
export function validateExercise(exercise) {
  const issues = []

  if (!exercise || typeof exercise !== 'object') {
    return ['exercise is not an object']
  }

  if (typeof exercise.id !== 'string' || exercise.id.trim() === '') {
    issues.push('missing id')
  }

  if (typeof exercise.name !== 'string' || exercise.name.trim() === '') {
    issues.push('missing name')
  }

  if (!isExerciseCategory(exercise.category)) {
    issues.push(`unknown category "${exercise.category}"`)
  }

  if (!EXERCISE_DIFFICULTIES.includes(exercise.difficulty)) {
    issues.push(`unknown difficulty "${exercise.difficulty}"`)
  }

  if (!EXERCISE_EQUIPMENT.includes(exercise.equipment)) {
    issues.push(`unknown equipment "${exercise.equipment}"`)
  }

  if (!EXERCISE_TYPES.includes(exercise.type)) {
    issues.push(`unknown type "${exercise.type}"`)
  }

  if (!Array.isArray(exercise.targetMuscles) || exercise.targetMuscles.length === 0) {
    issues.push('missing target muscles')
  }

  if (!Array.isArray(exercise.secondaryMuscles)) {
    issues.push('secondary muscles must be an array')
  }

  if (typeof exercise.durationMinutes !== 'number' || exercise.durationMinutes <= 0) {
    issues.push('durationMinutes must be a positive number')
  }

  if (typeof exercise.description !== 'string' || exercise.description.trim() === '') {
    issues.push('missing description')
  }

  if (!Array.isArray(exercise.instructions) || exercise.instructions.length === 0) {
    issues.push('missing instructions')
  }

  if (!Array.isArray(exercise.tips) || exercise.tips.length === 0) {
    issues.push('missing form tips')
  }

  return issues
}

/**
 * Audit a whole collection: per-record problems plus duplicate ids and names.
 *
 * The library ships from code, so this is a development guard rather than a
 * user-facing feature — but it catches a typo'd id or a copy-pasted entry the
 * moment it lands, instead of showing a broken card.
 *
 * @param {import('../data/exercises.js').Exercise[]} [exercises]
 * @returns {string[]} problems found; empty means the catalog is clean
 */
export function findCatalogIssues(exercises = EXERCISES) {
  const issues = []

  exercises.forEach((exercise, index) => {
    for (const issue of validateExercise(exercise)) {
      issues.push(`${exercise?.id ?? `index ${index}`}: ${issue}`)
    }
  })

  const seenIds = new Set()
  const seenNames = new Set()

  for (const exercise of exercises) {
    if (seenIds.has(exercise.id)) issues.push(`${exercise.id}: duplicate id`)
    seenIds.add(exercise.id)

    const nameKey = exercise.name.trim().toLowerCase()
    if (seenNames.has(nameKey)) issues.push(`${exercise.id}: duplicate name "${exercise.name}"`)
    seenNames.add(nameKey)
  }

  return issues
}

export { EXERCISE_CATEGORY_NAMES }