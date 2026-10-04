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
 * "Core · Obliques" style line for compact rows.
 *
 * The primary muscle is dropped when it only repeats the category, so a plank
 * reads "Core · 3 sets × 10 reps" instead of "Core · Core · ...".
 *
 * @param {import('../data/exercises.js').Exercise} exercise
 * @returns {string}
 */
export function exerciseSubtitle(exercise) {
  const category = exercise?.category ?? ''
  const muscle = primaryMuscle(exercise)

  return muscle === '' || muscle === category ? category : `${category} · ${muscle}`
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

/**
 * Every field a search term is matched against.
 *
 * Deliberately flat: name and muscles first (what people look for), then the
 * category, equipment and type so "bodyweight" and "mobility" behave like real
 * filters without any extra UI.
 */
const SEARCHABLE_FIELDS = ['name', 'category', 'equipment', 'type', 'description']

/** Fold a string for case-insensitive matching. */
export function normalizeQuery(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

/**
 * Whether one exercise matches a search term.
 *
 * All words must match somewhere on the record, which makes "chest dumbbell"
 * narrow the results instead of widening them.
 *
 * @param {import('../data/exercises.js').Exercise} exercise
 * @param {string} query
 */
export function matchesExerciseQuery(exercise, query) {
  const term = normalizeQuery(query)
  if (term === '') return true

  const words = term.split(/\s+/)
  const haystack = [
    ...SEARCHABLE_FIELDS.map((field) => exercise[field]),
    ...(exercise.targetMuscles ?? []),
    ...(exercise.secondaryMuscles ?? []),
  ]
    .join(' ')
    .toLowerCase()

  return words.every((word) => haystack.includes(word))
}

/**
 * Search a collection of exercises. An empty term returns everything.
 *
 * @param {import('../data/exercises.js').Exercise[]} exercises
 * @param {string} query
 */
export function searchExercises(exercises, query) {
  const term = normalizeQuery(query)
  if (term === '') return [...exercises]

  return exercises.filter((exercise) => matchesExerciseQuery(exercise, term))
}

/**
 * Human-readable count line for the library header.
 *
 * Never hardcoded: the number comes from whatever the current filters matched,
 * and the wording changes so a filtered result can never be mistaken for the
 * size of the whole library.
 *
 * @param {number} count
 * @param {boolean} [isFiltered]
 * @returns {string} e.g. "37 exercises" or "6 exercises found"
 */
export function exerciseCountLabel(count, isFiltered = false) {
  const noun = count === 1 ? 'exercise' : 'exercises'
  return isFiltered ? `${count} ${noun} found` : `${count} ${noun}`
}

/** Value a filter uses to mean "no restriction". */
export const ANY_OPTION = 'All'

/** Filter names rendered as selects on the library page. */
export const EXERCISE_FILTERS = ['category', 'difficulty', 'equipment', 'type']

/** A filter set with nothing selected. */
export const DEFAULT_FILTERS = Object.freeze({
  category: ANY_OPTION,
  difficulty: ANY_OPTION,
  equipment: ANY_OPTION,
  type: ANY_OPTION,
})

/** Whether a single filter is restricting the results. */
function isSet(value) {
  return Boolean(value) && value !== ANY_OPTION
}

/**
 * How many filters are narrowing the list.
 *
 * Used for the "Filters (2)" badge and for the Clear button, so the UI never
 * has to re-derive the rule.
 *
 * @param {Partial<typeof DEFAULT_FILTERS>} filters
 */
export function activeFilterCount(filters) {
  return EXERCISE_FILTERS.filter((name) => isSet(filters?.[name])).length
}

/** Whether any filter or search term is active. */
export function isExerciseQueryActive(filters, query = '') {
  return activeFilterCount(filters) > 0 || normalizeQuery(query) !== ''
}

/**
 * Apply every filter at once.
 *
 * Each select is independent and they combine with AND, so
 * Legs + Beginner + Bodyweight returns only movements that satisfy all three.
 * An unset ("All") filter never removes anything.
 *
 * @param {import('../data/exercises.js').Exercise[]} exercises
 * @param {Partial<typeof DEFAULT_FILTERS>} [filters]
 */
export function filterExercises(exercises, filters = {}) {
  const { category, difficulty, equipment, type } = { ...DEFAULT_FILTERS, ...filters }

  return exercises.filter(
    (exercise) =>
      (!isSet(category) || exercise.category === category) &&
      (!isSet(difficulty) || exercise.difficulty === difficulty) &&
      (!isSet(equipment) || exercise.equipment === equipment) &&
      (!isSet(type) || exercise.type === type),
  )
}

/**
 * Score how closely two exercises belong together.
 *
 * Shared target muscles matter most, then the same category, then the same
 * difficulty. Purely arithmetic — no model, no ranking service.
 */
function relatedScore(candidate, exercise, targets) {
  const shared = candidate.targetMuscles.filter((muscle) => targets.has(muscle)).length
  const sameCategory = candidate.category === exercise.category ? 3 : 0
  const sameDifficulty = candidate.difficulty === exercise.difficulty ? 1 : 0

  return shared * 2 + sameCategory + sameDifficulty
}

/**
 * Exercises worth looking at next.
 *
 * Same category, same difficulty and overlapping target muscles, ranked by a
 * simple score. Ties break alphabetically so the list never reshuffles between
 * renders.
 *
 * @param {import('../data/exercises.js').Exercise|null} exercise
 * @param {number} [limit]
 * @param {import('../data/exercises.js').Exercise[]} [exercises]
 * @returns {import('../data/exercises.js').Exercise[]}
 */
export function getRelatedExercises(exercise, limit = 4, exercises = EXERCISES) {
  if (!exercise?.id) return []

  const targets = new Set(exercise.targetMuscles ?? [])

  return exercises
    .filter((candidate) => candidate.id !== exercise.id)
    .map((candidate) => ({ candidate, score: relatedScore(candidate, exercise, targets) }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}

export { EXERCISE_CATEGORY_NAMES, SEARCHABLE_FIELDS }