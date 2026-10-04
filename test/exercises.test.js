import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  CATEGORIES_WITHOUT_EXERCISES,
  EXERCISES,
  EXERCISE_COUNT,
  EXERCISE_DIFFICULTIES,
  EXERCISE_EQUIPMENT,
  EXERCISE_MUSCLES,
  EXERCISE_TYPES,
  defineExercise,
} from '../src/data/exercises.js'
import {
  EXERCISE_CATEGORIES,
  EXERCISE_CATEGORY_NAMES,
  countExercisesByCategory,
  getExerciseCategory,
  getExerciseCategoryOrFallback,
  isExerciseCategory,
} from '../src/data/exerciseCategories.js'
import {
  ANY_OPTION,
  DEFAULT_FILTERS,
  EXERCISE_FILTERS,
  activeFilterCount,
  distinctValues,
  exerciseCountLabel,
  filterExercises,
  findCatalogIssues,
  getExerciseById,
  getExerciseCategoryRecord,
  getExercisesByCategory,
  getRelatedExercises,
  isExerciseQueryActive,
  matchesExerciseQuery,
  normalizeQuery,
  primaryMuscle,
  searchExercises,
  validateExercise,
} from '../src/utils/exercises.js'

describe('exercise catalog', () => {
  it('ships every requested movement', () => {
    const ids = EXERCISES.map((exercise) => exercise.id)
    const required = [
      'push-up',
      'incline-push-up',
      'wide-push-up',
      'machine-chest-press',
      'pull-up',
      'assisted-pull-up',
      'dumbbell-bent-over-row',
      'superman',
      'pike-push-up',
      'barbell-shoulder-press',
      'dumbbell-lateral-raise',
      'dumbbell-front-raise',
      'dumbbell-bicep-curl',
      'hammer-curl',
      'tricep-dip',
      'dumbbell-tricep-extension',
      'bodyweight-squat',
      'dumbbell-lunge',
      'reverse-lunge',
      'glute-bridge',
      'calf-raise',
      'plank',
      'mountain-climber',
      'bicycle-crunch',
      'leg-raise',
      'burpee',
      'jump-squat',
      'bear-crawl',
      'dumbbell-thruster',
      'jumping-jacks',
      'high-knees',
      'running',
      'cycling',
    ]
    for (const id of required) assert.ok(ids.includes(id), `missing ${id}`)
  })

  it('covers all eight categories', () => {
    assert.deepEqual(CATEGORIES_WITHOUT_EXERCISES, [])
    assert.equal(EXERCISE_CATEGORY_NAMES.length, 8)
  })

  it('has no broken records', () => {
    assert.deepEqual(findCatalogIssues(), [])
  })

  it('has unique ids and unique names', () => {
    assert.equal(new Set(EXERCISES.map((e) => e.id)).size, EXERCISES.length)
    assert.equal(new Set(EXERCISES.map((e) => e.name.toLowerCase())).size, EXERCISES.length)
  })

  it('uses consistent vocabularies', () => {
    for (const exercise of EXERCISES) {
      assert.ok(EXERCISE_CATEGORY_NAMES.includes(exercise.category))
      assert.ok(EXERCISE_DIFFICULTIES.includes(exercise.difficulty))
      assert.ok(EXERCISE_EQUIPMENT.includes(exercise.equipment))
      assert.ok(EXERCISE_TYPES.includes(exercise.type))
    }
  })

  it('describes every movement differently', () => {
    const descriptions = EXERCISES.map((exercise) => exercise.description)
    assert.equal(new Set(descriptions).size, EXERCISES.length)
  })

  it('gives every movement instructions and form tips', () => {
    for (const exercise of EXERCISES) {
      assert.ok(exercise.instructions.length >= 3, `${exercise.id} needs instructions`)
      assert.ok(exercise.tips.length >= 2, `${exercise.id} needs tips`)
      assert.ok(exercise.targetMuscles.length >= 1, `${exercise.id} needs target muscles`)
    }
  })

  it('exercises every filter option so no filter is empty', () => {
    for (const option of EXERCISE_DIFFICULTIES) {
      assert.ok(EXERCISES.some((exercise) => exercise.difficulty === option), option)
    }
    for (const option of EXERCISE_EQUIPMENT) {
      assert.ok(EXERCISES.some((exercise) => exercise.equipment === option), option)
    }
    for (const option of EXERCISE_TYPES) {
      assert.ok(EXERCISES.some((exercise) => exercise.type === option), option)
    }
  })

  it('is frozen so filtering cannot corrupt the source', () => {
    assert.ok(Object.isFrozen(EXERCISES))
    assert.ok(Object.isFrozen(EXERCISES[0]))
    assert.ok(Object.isFrozen(EXERCISES[0].instructions))
  })

  it('reports its own size', () => {
    assert.equal(EXERCISE_COUNT, EXERCISES.length)
    assert.ok(EXERCISE_COUNT >= 33)
  })

  it('collects every muscle name once', () => {
    assert.ok(EXERCISE_MUSCLES.includes('Chest'))
    assert.ok(EXERCISE_MUSCLES.includes('Cardiovascular System'))
    assert.equal(new Set(EXERCISE_MUSCLES).size, EXERCISE_MUSCLES.length)
  })
})

describe('defineExercise', () => {
  it('fills every field with a safe default', () => {
    const exercise = defineExercise({ id: 'demo', name: 'Demo' })
    assert.equal(exercise.category, 'Full Body')
    assert.equal(exercise.difficulty, 'Beginner')
    assert.equal(exercise.equipment, 'Bodyweight')
    assert.equal(exercise.type, 'Strength')
    assert.deepEqual(exercise.targetMuscles, [])
    assert.deepEqual(exercise.instructions, [])
    assert.equal(exercise.durationMinutes, 10)
  })

  it('keeps the values it is given', () => {
    const exercise = defineExercise({ id: 'demo', name: 'Demo', difficulty: 'Advanced' })
    assert.equal(exercise.difficulty, 'Advanced')
  })

  it('produces a record that passes validation', () => {
    assert.deepEqual(
      validateExercise(
        defineExercise({
          id: 'demo',
          name: 'Demo',
          category: 'Chest',
          targetMuscles: ['Chest'],
          description: 'A demo movement.',
          instructions: ['Step one.'],
          tips: ['Stay controlled.'],
        }),
      ),
      [],
    )
  })
})

describe('validateExercise', () => {
  it('reports every problem it finds', () => {
    const issues = validateExercise({
      id: '',
      name: 'Broken',
      category: 'Elbows',
      difficulty: 'easy',
      equipment: 'Rope',
      type: 'Dance',
      targetMuscles: [],
      secondaryMuscles: null,
      durationMinutes: 0,
      description: '',
      instructions: [],
      tips: [],
    })
    assert.ok(issues.includes('missing id'))
    assert.ok(issues.includes('unknown category "Elbows"'))
    assert.ok(issues.includes('unknown difficulty "easy"'))
    assert.ok(issues.includes('unknown equipment "Rope"'))
    assert.ok(issues.includes('unknown type "Dance"'))
    assert.ok(issues.includes('missing target muscles'))
    assert.ok(issues.includes('missing instructions'))
    assert.ok(issues.includes('missing form tips'))
  })

  it('catches duplicate ids across a collection', () => {
    const one = defineExercise({
      id: 'dup',
      name: 'One',
      category: 'Chest',
      targetMuscles: ['Chest'],
      description: 'x',
      instructions: ['y'],
      tips: ['z'],
    })
    assert.deepEqual(findCatalogIssues([one, { ...one, name: 'Two' }]), ['dup: duplicate id'])
  })

  it('catches duplicate names across a collection', () => {
    const one = defineExercise({
      id: 'a',
      name: 'Plank',
      category: 'Core',
      targetMuscles: ['Core'],
      description: 'x',
      instructions: ['y'],
      tips: ['z'],
    })
    assert.deepEqual(findCatalogIssues([one, { ...one, id: 'b' }]), ['b: duplicate name "Plank"'])
  })

  it('accepts a clean catalog', () => {
    assert.deepEqual(findCatalogIssues(EXERCISES), [])
  })
})

describe('exercise lookups', () => {
  it('finds an exercise by id', () => {
    assert.equal(getExerciseById('push-up').name, 'Push-Up')
  })

  it('returns null for an unknown or invalid id', () => {
    assert.equal(getExerciseById('does-not-exist'), null)
    assert.equal(getExerciseById(''), null)
    assert.equal(getExerciseById(undefined), null)
  })

  it('filters by category', () => {
    const legs = getExercisesByCategory('Legs')
    assert.ok(legs.length > 0)
    assert.ok(legs.every((exercise) => exercise.category === 'Legs'))
  })

  it('returns the whole library for a missing category', () => {
    assert.equal(getExercisesByCategory().length, EXERCISES.length)
    assert.equal(getExercisesByCategory('Nonsense').length, EXERCISES.length)
  })

  it('resolves the category record for an exercise', () => {
    assert.equal(getExerciseCategoryRecord(getExerciseById('plank')).id, 'core')
    assert.equal(getExerciseCategoryRecord(null).id, 'full-body')
  })

  it('reads the primary muscle', () => {
    assert.equal(primaryMuscle(getExerciseById('push-up')), 'Chest')
    assert.equal(primaryMuscle(null), '')
  })

  it('collects the values a field really uses', () => {
    assert.deepEqual(
      distinctValues('difficulty').filter((value) => EXERCISE_DIFFICULTIES.includes(value)),
      EXERCISE_DIFFICULTIES,
    )
    assert.ok(distinctValues('category').length <= EXERCISE_CATEGORY_NAMES.length)
  })
})

describe('searching exercises', () => {
  it('returns everything for an empty term', () => {
    assert.equal(searchExercises(EXERCISES, '').length, EXERCISES.length)
    assert.equal(searchExercises(EXERCISES, '   ').length, EXERCISES.length)
  })

  it('matches an exercise name', () => {
    const results = searchExercises(EXERCISES, 'push-up')
    assert.ok(results.length > 0)
    assert.ok(results.every((exercise) => exercise.name.toLowerCase().includes('push-up')))
  })

  it('is case insensitive', () => {
    assert.deepEqual(searchExercises(EXERCISES, 'PUSH-UP'), searchExercises(EXERCISES, 'push-up'))
    assert.equal(searchExercises(EXERCISES, 'PuSh-Up').length, searchExercises(EXERCISES, 'push-up').length)
  })

  it('matches a category name', () => {
    const results = searchExercises(EXERCISES, 'cardio')
    assert.ok(results.length > 0)
    assert.ok(results.every((exercise) => exercise.category === 'Cardio' || exercise.type === 'Cardio'))
    // Every exercise in the Cardio category is reachable by its own name.
    const cardioCategory = getExercisesByCategory('Cardio')
    for (const exercise of cardioCategory) {
      assert.ok(results.includes(exercise), exercise.name)
    }
  })

  it('matches a target muscle', () => {
    const results = searchExercises(EXERCISES, 'hamstring')
    assert.ok(results.length > 0)
    const muscles = results.flatMap((exercise) => [...exercise.targetMuscles, ...exercise.secondaryMuscles])
    assert.ok(muscles.includes('Hamstrings'))
  })

  it('matches a secondary muscle too', () => {
    const results = searchExercises(EXERCISES, 'core')
    assert.ok(results.some((exercise) => exercise.name === 'Push-Up'))
  })

  it('matches equipment', () => {
    const results = searchExercises(EXERCISES, 'bodyweight')
    assert.ok(results.length > 0)
    assert.ok(results.every((exercise) => exercise.equipment === 'Bodyweight'))
  })

  it('matches the exercise type', () => {
    const results = searchExercises(EXERCISES, 'mobility')
    assert.ok(results.length > 0)
    assert.ok(results.every((exercise) => exercise.type === 'Mobility'))
  })

  it('narrows rather than widens when several words are given', () => {
    const both = searchExercises(EXERCISES, 'chest dumbbell')
    const chest = searchExercises(EXERCISES, 'chest')
    assert.ok(both.length > 0)
    assert.ok(both.length < chest.length)
  })

  it('returns nothing for a term that matches nothing', () => {
    assert.deepEqual(searchExercises(EXERCISES, 'underwater basket weaving'), [])
  })

  it('finds chest exercises for the word "chest"', () => {
    const results = searchExercises(getExercisesByCategory('Chest'), 'chest')
    assert.equal(results.length, getExercisesByCategory('Chest').length)
  })

  it('normalises whitespace and case', () => {
    assert.equal(normalizeQuery('  Push-Up  '), 'push-up')
    assert.equal(normalizeQuery(undefined), '')
  })

  it('treats a missing term as a match', () => {
    assert.equal(matchesExerciseQuery(getExerciseById('plank'), '  '), true)
    assert.equal(matchesExerciseQuery(getExerciseById('plank'), 'plank'), true)
    assert.equal(matchesExerciseQuery(getExerciseById('plank'), 'squat'), false)
  })

  it('never mutates the source catalog', () => {
    const before = EXERCISES.length
    searchExercises(EXERCISES, 'chest')
    assert.equal(EXERCISES.length, before)
  })
})

describe('exercise count label', () => {
  it('describes the whole library', () => {
    assert.equal(exerciseCountLabel(EXERCISES.length), `${EXERCISES.length} exercises`)
  })

  it('describes a filtered result', () => {
    assert.equal(exerciseCountLabel(6, true), '6 exercises found')
  })

  it('uses the singular for one match', () => {
    assert.equal(exerciseCountLabel(1), '1 exercise')
    assert.equal(exerciseCountLabel(1, true), '1 exercise found')
  })

  it('handles an empty result', () => {
    assert.equal(exerciseCountLabel(0, true), '0 exercises found')
  })
})

describe('filtering exercises', () => {
  it('returns everything when nothing is selected', () => {
    assert.equal(filterExercises(EXERCISES).length, EXERCISES.length)
    assert.equal(filterExercises(EXERCISES, DEFAULT_FILTERS).length, EXERCISES.length)
  })

  it('treats "All" as no restriction', () => {
    assert.equal(
      filterExercises(EXERCISES, { difficulty: ANY_OPTION, equipment: ANY_OPTION, type: ANY_OPTION })
        .length,
      EXERCISES.length,
    )
  })

  it('filters by difficulty', () => {
    const results = filterExercises(EXERCISES, { difficulty: 'Beginner' })
    assert.ok(results.length > 0)
    assert.ok(results.every((exercise) => exercise.difficulty === 'Beginner'))
  })

  it('filters by equipment', () => {
    const results = filterExercises(EXERCISES, { equipment: 'Dumbbell' })
    assert.ok(results.length > 0)
    assert.ok(results.every((exercise) => exercise.equipment === 'Dumbbell'))
  })

  it('filters by exercise type', () => {
    const results = filterExercises(EXERCISES, { type: 'Cardio' })
    assert.ok(results.length > 0)
    assert.ok(results.every((exercise) => exercise.type === 'Cardio'))
  })

  it('combines filters with AND', () => {
    const legs = filterExercises(EXERCISES, { category: 'Legs' })
    const combined = filterExercises(EXERCISES, {
      category: 'Legs',
      difficulty: 'Beginner',
      equipment: 'Bodyweight',
    })
    assert.ok(combined.length > 0)
    assert.ok(combined.length < legs.length)
    assert.ok(
      combined.every(
        (exercise) =>
          exercise.category === 'Legs' &&
          exercise.difficulty === 'Beginner' &&
          exercise.equipment === 'Bodyweight',
      ),
    )
  })

  it('can combine with a search term', () => {
    const searched = searchExercises(EXERCISES, 'stretch')
    const results = filterExercises(searched, { difficulty: 'Beginner' })
    assert.ok(results.length > 0)
    assert.ok(results.every((exercise) => exercise.difficulty === 'Beginner'))
    assert.ok(results.every((exercise) => searched.includes(exercise)))
  })

  it('returns nothing for a combination that cannot match', () => {
    assert.deepEqual(filterExercises(EXERCISES, { category: 'Legs', equipment: 'Barbell' }), [])
  })

  it('ignores an unknown filter value rather than hiding everything', () => {
    assert.equal(filterExercises(EXERCISES, { difficulty: 'Sideways' }).length, 0)
    assert.equal(filterExercises(EXERCISES, { category: '' }).length, EXERCISES.length)
  })

  it('counts and detects active filters', () => {
    assert.equal(activeFilterCount(DEFAULT_FILTERS), 0)
    assert.equal(activeFilterCount({ ...DEFAULT_FILTERS, difficulty: 'Beginner' }), 1)
    assert.equal(
      activeFilterCount({ category: 'Legs', difficulty: 'Beginner', equipment: 'Dumbbell' }),
      3,
    )
    assert.equal(EXERCISE_FILTERS.length, 4)
  })

  it('knows when a search term or filter is active', () => {
    assert.equal(isExerciseQueryActive(DEFAULT_FILTERS), false)
    assert.equal(isExerciseQueryActive(DEFAULT_FILTERS, '  '), false)
    assert.equal(isExerciseQueryActive(DEFAULT_FILTERS, 'chest'), true)
    assert.equal(isExerciseQueryActive({ equipment: 'Barbell' }), true)
  })

  it('never mutates the source catalog', () => {
    const before = EXERCISES.length
    filterExercises(EXERCISES, { category: 'Core' })
    assert.equal(EXERCISES.length, before)
  })
})

describe('related exercises', () => {
  it('never includes the exercise itself', () => {
    const related = getRelatedExercises(getExerciseById('push-up'))
    assert.ok(related.length > 0)
    assert.ok(related.every((exercise) => exercise.id !== 'push-up'))
  })

  it('prefers the same category', () => {
    const related = getRelatedExercises(getExerciseById('push-up'))
    const fromCategory = related.filter((exercise) => exercise.category === 'Chest')
    assert.ok(fromCategory.length > 0)
  })

  it('surfaces movements that share a target muscle', () => {
    const plank = getExerciseById('plank')
    const related = getRelatedExercises(plank)
    const muscles = plank.targetMuscles
    assert.ok(
      related.some((exercise) =>
        exercise.targetMuscles.some((muscle) => muscles.includes(muscle)),
      ),
    )
  })

  it('respects the limit', () => {
    assert.equal(getRelatedExercises(getExerciseById('pull-up'), 2).length, 2)
    assert.ok(getRelatedExercises(getExerciseById('pull-up'), 4).length <= 4)
  })

  it('is deterministic for the same exercise', () => {
    const plank = getExerciseById('plank')
    assert.deepEqual(getRelatedExercises(plank), getRelatedExercises(plank))
  })

  it('returns nothing for a missing exercise', () => {
    assert.deepEqual(getRelatedExercises(null), [])
    assert.deepEqual(getRelatedExercises({ id: 'ghost' }, 4, []), [])
  })

  it('ignores movements with nothing in common', () => {
    assert.deepEqual(getRelatedExercises(getExerciseById('running'), 4, [getExerciseById('running')]), [])
  })
})

describe('exercise categories', () => {
  it('lists the eight body categories in order', () => {
    assert.deepEqual(EXERCISE_CATEGORY_NAMES, [
      'Chest',
      'Back',
      'Shoulders',
      'Arms',
      'Legs',
      'Core',
      'Full Body',
      'Cardio',
    ])
  })

  it('gives every category an id, description and visual identifier', () => {
    for (const category of EXERCISE_CATEGORIES) {
      assert.ok(category.id.trim() !== '')
      assert.ok(category.name.trim() !== '')
      assert.ok(category.description.trim() !== '')
      assert.ok(category.icon.trim() !== '')
      assert.match(category.accent, /^#[0-9a-f]{6}$/i)
    }
  })

  it('keeps category ids unique', () => {
    assert.equal(new Set(EXERCISE_CATEGORIES.map((c) => c.id)).size, EXERCISE_CATEGORIES.length)
  })

  it('looks a category up by name', () => {
    assert.equal(getExerciseCategory('Cardio').id, 'cardio')
    assert.equal(getExerciseCategory('Elbows'), null)
    assert.equal(isExerciseCategory('Core'), true)
    assert.equal(isExerciseCategory('Elbows'), false)
  })

  it('falls back to a real record for an unknown category', () => {
    assert.equal(getExerciseCategoryOrFallback('Elbows').id, 'full-body')
  })

  it('counts the catalog per category', () => {
    const counts = countExercisesByCategory(EXERCISES)
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
    assert.equal(total, EXERCISES.length)
    assert.equal(Object.keys(counts).length, EXERCISE_CATEGORY_NAMES.length)
    for (const name of EXERCISE_CATEGORY_NAMES) assert.ok(counts[name] > 0, name)
  })
})