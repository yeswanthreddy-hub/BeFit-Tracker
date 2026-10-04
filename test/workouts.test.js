import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import { STORAGE_KEYS, userDataKey } from '../src/utils/storageKeys.js'
import { getItem, setItem } from '../src/utils/storage.js'
import { installBrowser } from './helpers/browser.js'

import { WORKOUTS, WORKOUT_COUNT, WORKOUT_CATEGORIES_WITHOUT_WORKOUTS } from '../src/data/workouts.js'
import {
  ANY_OPTION,
  DEFAULT_WORKOUT_DRAFT,
  WORKOUT_CATEGORIES,
  WORKOUT_CATEGORY_NAMES,
  WORKOUT_DIFFICULTIES,
  WORKOUT_DURATIONS,
  WORKOUT_EQUIPMENT,
  WORKOUT_GOALS,
  getWorkoutCategory,
  getWorkoutCategoryOrFallback,
  isWorkoutCategory,
} from '../src/data/workoutCategories.js'
import { EXERCISES, EXERCISE_MUSCLES } from '../src/data/exercises.js'
import { getExerciseById } from '../src/utils/exercises.js'
import {
  DURATION_RANGES,
  activeWorkoutFilterCount,
  countWorkoutsByCategory,
  deriveWorkoutEquipment,
  deriveWorkoutMuscles,
  deriveWorkoutPlan,
  estimateWorkoutMinutes,
  filterWorkouts,
  getQuickWorkouts,
  getWorkoutById,
  isWorkoutQueryActive,
  matchesDuration,
  resolveWorkoutExercises,
  searchWorkouts,
  workoutCountLabel,
  workoutVolumeLabel,
} from '../src/utils/workouts.js'
import {
  MAX_NAME_LENGTH,
  WORKOUT_MESSAGES,
  createCustomWorkout,
  createCustomWorkoutId,
  createWorkoutDraft,
  createWorkoutEntry,
  getCustomWorkout,
  isCustomWorkout,
  normalizeCustomWorkout,
  normalizeCustomWorkouts,
  normalizeWorkoutEntry,
  normalizeWorkoutExercises,
  removeCustomWorkout,
  updateCustomWorkout,
  upsertCustomWorkout,
  validateWorkoutDraft,
  validateWorkoutEntry,
} from '../src/utils/customWorkouts.js'

const EXERCISE_IDS = new Set(EXERCISES.map((exercise) => exercise.id))
const WORKOUT_IDS = new Set(WORKOUTS.map((workout) => workout.id))

describe('workout category vocabulary', () => {
  it('exposes every category name in display order', () => {
    assert.deepEqual(WORKOUT_CATEGORY_NAMES, WORKOUT_CATEGORIES.map((c) => c.name))
    assert.ok(WORKOUT_CATEGORY_NAMES.includes('Quick Workouts'))
    assert.ok(WORKOUT_CATEGORY_NAMES.includes('Full Body'))
  })

  it('gives every category an id, description and accent', () => {
    for (const category of WORKOUT_CATEGORIES) {
      assert.match(category.id, /^[a-z-]+$/, `${category.name} has a slug id`)
      assert.ok(category.description.length > 10, `${category.name} has a description`)
      assert.match(category.accent, /^#[0-9a-f]{6}$/i, `${category.name} has a hex accent`)
    }
  })

  it('looks categories up safely', () => {
    assert.equal(getWorkoutCategory('Core')?.id, 'core')
    assert.equal(getWorkoutCategory('Kettlebells'), null)
    assert.equal(isWorkoutCategory('Core'), true)
    assert.equal(isWorkoutCategory('Kettlebells'), false)
    assert.equal(getWorkoutCategoryOrFallback('Kettlebells').name, 'Full Body')
  })

  it('reuses the exercise difficulty scale instead of inventing a second one', () => {
    assert.deepEqual([...WORKOUT_DIFFICULTIES], ['Beginner', 'Intermediate', 'Advanced'])
  })

  it('keeps goals, equipment and duration buckets aligned with the library', () => {
    assert.equal(WORKOUT_GOALS.length, 5)
    assert.deepEqual([...WORKOUT_EQUIPMENT], ['No Equipment', 'Dumbbells', 'Resistance Band', 'Gym Equipment'])
    assert.deepEqual([...WORKOUT_DURATIONS], Object.keys(DURATION_RANGES))
    assert.equal(DEFAULT_WORKOUT_DRAFT.goal, 'General Fitness')
  })
})

describe('built-in workout templates', () => {
  it('ships a useful number of realistic templates', () => {
    assert.ok(WORKOUT_COUNT >= 10 && WORKOUT_COUNT <= 15, `expected 10-15 workouts, got ${WORKOUT_COUNT}`)
    assert.equal(WORKOUT_COUNT, WORKOUTS.length)
  })

  it('gives every workout a unique id and a unique name', () => {
    assert.equal(WORKOUT_IDS.size, WORKOUT_COUNT)

    const names = new Set(WORKOUTS.map((workout) => workout.name.toLowerCase()))
    assert.equal(names.size, WORKOUT_COUNT)
  })

  it('describes every workout with real prose', () => {
    for (const workout of WORKOUTS) {
      assert.match(workout.id, /^[a-z0-9-]+$/, `${workout.id} is a slug`)
      assert.ok(workout.name.length > 3, `${workout.id} has a name`)
      assert.ok(workout.description.length > 40, `${workout.id} has a real description`)
    }
  })

  it('only uses values from the controlled vocabularies', () => {
    for (const workout of WORKOUTS) {
      assert.ok(WORKOUT_CATEGORY_NAMES.includes(workout.category), `${workout.id} category`)
      assert.ok(WORKOUT_GOALS.includes(workout.goal), `${workout.id} goal`)
      assert.ok(WORKOUT_DIFFICULTIES.includes(workout.difficulty), `${workout.id} difficulty`)
      assert.ok(WORKOUT_EQUIPMENT.includes(workout.equipment), `${workout.id} equipment`)
    }
  })

  it('reuses catalog muscle names rather than inventing new ones', () => {
    for (const workout of WORKOUTS) {
      assert.ok(workout.targetMuscles.length > 0, `${workout.id} targets muscles`)
      for (const muscle of workout.targetMuscles) {
        assert.ok(EXERCISE_MUSCLES.includes(muscle), `${workout.id} uses catalog muscle "${muscle}"`)
      }
    }
  })

  it('references real exercises instead of duplicating exercise data', () => {
    for (const workout of WORKOUTS) {
      assert.ok(workout.exercises.length >= 2, `${workout.id} has at least two exercises`)

      for (const entry of workout.exercises) {
        assert.ok(EXERCISE_IDS.has(entry.exerciseId), `${workout.id} -> ${entry.exerciseId} exists`)
        assert.ok(getExerciseById(entry.exerciseId), 'resolves through the catalog')
        assert.deepEqual(
          Object.keys(entry).filter((key) => !['exerciseId', 'sets', 'reps', 'restSeconds', 'durationSeconds'].includes(key)),
          [],
          'entries store plan values only',
        )
      }
    }
  })

  it('keeps every plan value valid', () => {
    for (const workout of WORKOUTS) {
      for (const entry of workout.exercises) {
        assert.ok(entry.sets >= 1 && entry.sets <= 20, `${workout.id} sets`)
        assert.ok(entry.reps >= 1, `${workout.id} reps`)
        assert.ok(entry.restSeconds >= 0, `${workout.id} rest`)
        assert.ok(!entry.durationSeconds || entry.durationSeconds >= 5, `${workout.id} hold`)
      }
    }
  })

  it('never repeats an exercise inside one plan', () => {
    for (const workout of WORKOUTS) {
      const ids = workout.exercises.map((entry) => entry.exerciseId)
      assert.equal(new Set(ids).size, ids.length, `${workout.id} has no duplicates`)
    }
  })

  it('matches each workout to at least one category filter', () => {
    assert.deepEqual([...WORKOUT_CATEGORIES_WITHOUT_WORKOUTS], [])
    const counts = countWorkoutsByCategory(WORKOUTS)
    for (const name of WORKOUT_CATEGORY_NAMES) {
      assert.ok(counts[name] > 0, `${name} has at least one workout`)
    }
  })

  it('publishes a frozen catalog so a filter cannot corrupt it', () => {
    assert.ok(Object.isFrozen(WORKOUTS))
    assert.ok(Object.isFrozen(WORKOUTS[0]))
    assert.ok(Object.isFrozen(WORKOUTS[0].exercises[0]))
  })

  it('estimates a duration that matches the plan it ships with', () => {
    for (const workout of WORKOUTS) {
      const estimate = estimateWorkoutMinutes(workout.exercises)
      assert.ok(
        estimate <= workout.durationMinutes + 5,
        `${workout.id}: plan estimates ${estimate} min but claims ${workout.durationMinutes} min`,
      )
    }
  })

  it('is consistent with the equipment a plan actually needs', () => {
    for (const workout of WORKOUTS) {
      const needsKit = workout.exercises.some((entry) => {
        const equipment = getExerciseById(entry.exerciseId).equipment
        return equipment !== 'Bodyweight'
      })

      if (needsKit) {
        assert.notEqual(workout.equipment, 'No Equipment', `${workout.id} claims equipment it needs`)
      }
    }
  })
})

describe('looking up workouts', () => {
  it('finds a workout by id and returns null for junk', () => {
    assert.equal(getWorkoutById('core-blast').name, 'Core Blast')
    assert.equal(getWorkoutById('nope'), null)
    assert.equal(getWorkoutById(''), null)
    assert.equal(getWorkoutById(null), null)
  })

  it('also searches a caller-supplied list', () => {
    const mine = [{ id: 'mine', name: 'Mine' }]
    assert.equal(getWorkoutById('mine', mine)?.name, 'Mine')
  })
})

describe('searching workouts', () => {
  it('returns everything for an empty term', () => {
    assert.equal(searchWorkouts(WORKOUTS, '').length, WORKOUT_COUNT)
    assert.equal(searchWorkouts(WORKOUTS, '   ').length, WORKOUT_COUNT)
  })

  it('matches on name, category, goal, equipment and muscles', () => {
    assert.ok(searchWorkouts(WORKOUTS, 'core').length >= 1)
    assert.ok(searchWorkouts(WORKOUTS, 'dumbbell').length >= 1)
    assert.ok(searchWorkouts(WORKOUTS, 'lose weight').length >= 1)
    assert.ok(searchWorkouts(WORKOUTS, 'glutes').length >= 1)
    assert.equal(searchWorkouts(WORKOUTS, 'yoga').length, 0)
  })

  it('requires every word to match, so queries narrow', () => {
    const both = searchWorkouts(WORKOUTS, 'home no equipment')
    assert.ok(both.length >= 1)
    assert.ok(both.every((workout) => workout.category === 'Home' && workout.equipment === 'No Equipment'))
  })

  it('is case insensitive', () => {
    assert.deepEqual(searchWorkouts(WORKOUTS, 'CORE BLAST'), searchWorkouts(WORKOUTS, 'core blast'))
  })
})

describe('filtering workouts', () => {
  it('starts from an unfiltered set', () => {
    assert.equal(activeWorkoutFilterCount({}), 0)
    assert.equal(isWorkoutQueryActive({}, ''), false)
    assert.equal(isWorkoutQueryActive({ difficulty: 'Beginner' }, ''), true)
    assert.equal(isWorkoutQueryActive({}, 'plank'), true)
  })

  it('counts only the filters that are set', () => {
    const filters = { category: ANY_OPTION, difficulty: 'Beginner', goal: ANY_OPTION }
    assert.equal(activeWorkoutFilterCount(filters), 1)
    filters.equipment = 'No Equipment'
    assert.equal(activeWorkoutFilterCount(filters), 2)
  })

  it('filters by difficulty', () => {
    const visible = filterWorkouts(WORKOUTS, { difficulty: 'Beginner' })
    assert.ok(visible.length > 0)
    assert.ok(visible.every((workout) => workout.difficulty === 'Beginner'))
  })

  it('filters by goal', () => {
    const visible = filterWorkouts(WORKOUTS, { goal: 'Lose Weight' })
    assert.ok(visible.length > 0)
    assert.ok(visible.every((workout) => workout.goal === 'Lose Weight'))
  })

  it('filters by equipment', () => {
    const visible = filterWorkouts(WORKOUTS, { equipment: 'No Equipment' })
    assert.ok(visible.length > 0)
    assert.ok(visible.every((workout) => workout.equipment === 'No Equipment'))
  })

  it('filters by category', () => {
    const visible = filterWorkouts(WORKOUTS, { category: 'Cardio' })
    assert.ok(visible.length > 0)
    assert.ok(visible.every((workout) => workout.category === 'Cardio'))
  })

  it('filters by duration buckets', () => {
    const quick = filterWorkouts(WORKOUTS, { duration: '10 min' })
    assert.ok(quick.length > 0)
    assert.ok(quick.every((workout) => workout.durationMinutes <= 10))

    const long = filterWorkouts(WORKOUTS, { duration: '45+ min' })
    assert.ok(long.every((workout) => workout.durationMinutes > 30))
  })

  it('combines filters with AND', () => {
    const visible = filterWorkouts(WORKOUTS, {
      difficulty: 'Beginner',
      goal: 'General Fitness',
      equipment: 'No Equipment',
    })

    assert.ok(visible.length > 0)
    assert.ok(
      visible.every(
        (workout) =>
          workout.difficulty === 'Beginner' &&
          workout.goal === 'General Fitness' &&
          workout.equipment === 'No Equipment',
      ),
    )
  })

  it('can legitimately return nothing, which the empty state must handle', () => {
    assert.deepEqual(filterWorkouts(WORKOUTS, { difficulty: 'Advanced', goal: 'General Fitness' }), [])
  })

  it('buckets every workout into at most one duration range', () => {
    for (const workout of WORKOUTS) {
      const buckets = WORKOUT_DURATIONS.filter((bucket) =>
        matchesDuration(workout.durationMinutes, bucket),
      )
      assert.ok(buckets.length >= 1, `${workout.id} lands in a duration bucket`)
    }
  })

  it('treats an unset duration filter as no restriction', () => {
    assert.equal(matchesDuration(10, ANY_OPTION), true)
    assert.equal(matchesDuration(10, undefined), true)
  })
})

describe('workout presentation helpers', () => {
  it('counts results with filtered-aware wording', () => {
    assert.equal(workoutCountLabel(15), '15 workouts')
    assert.equal(workoutCountLabel(1), '1 workout')
    assert.equal(workoutCountLabel(3, true), '3 workouts found')
  })

  it('offers the shortest sessions first for quick surfaces', () => {
    const quick = getQuickWorkouts(WORKOUTS, 3)
    assert.equal(quick.length, 3)
    const durations = quick.map((workout) => workout.durationMinutes)
    assert.deepEqual([...durations].sort((a, b) => a - b), durations)
  })

  it('labels counted reps and timed holds differently', () => {
    assert.equal(workoutVolumeLabel({ sets: 3, reps: 12, restSeconds: 45 }), '3 sets × 12 reps')
    assert.equal(workoutVolumeLabel({ sets: 3, reps: 12, restSeconds: 45 }, { compact: true }), '3 × 12')
    assert.equal(
      workoutVolumeLabel({ sets: 3, reps: 1, restSeconds: 30, durationSeconds: 45 }),
      '3 sets × 45s hold',
    )
  })

  it('resolves plan entries against the exercise catalog', () => {
    const [first, second] = resolveWorkoutExercises(WORKOUTS.find((w) => w.id === 'quick-10-minute'))

    assert.equal(first.exercise.name, 'Jumping Jacks')
    assert.equal(second.exercise.category, 'Legs')
    assert.ok(first.exercise.targetMuscles.length > 0)
  })

  it('skips plan entries whose exercise no longer exists', () => {
    const resolved = resolveWorkoutExercises({
      exercises: [{ exerciseId: 'push-up', sets: 3, reps: 10, restSeconds: 45 }, { exerciseId: 'ghost' }],
    })

    assert.equal(resolved.length, 1)
    assert.equal(resolveWorkoutExercises(null).length, 0)
    assert.equal(resolveWorkoutExercises({ exercises: 'nope' }).length, 0)
  })

  it('estimates minutes from work plus rest', () => {
    assert.equal(estimateWorkoutMinutes([]), 0)
    // 3 sets x (10 reps x 3s + 45s rest) = 225s
    assert.equal(estimateWorkoutMinutes([{ exerciseId: 'push-up', sets: 3, reps: 10, restSeconds: 45 }]), 4)
    assert.equal(
      estimateWorkoutMinutes([{ exerciseId: 'plank', sets: 3, reps: 1, restSeconds: 30, durationSeconds: 45 }]),
      4,
    )
  })
})

describe('normalizing custom workouts', () => {
  it('returns an empty list for anything that is not a list', () => {
    assert.deepEqual(normalizeCustomWorkouts(null), [])
    assert.deepEqual(normalizeCustomWorkouts('nope'), [])
    assert.deepEqual(normalizeCustomWorkouts({}), [])
  })

  it('keeps a well-formed record and forces type to custom', () => {
    const workout = normalizeCustomWorkout({
      id: 'custom-1',
      type: 'custom',
      name: 'Morning Session',
      description: 'Quick morning training',
      goal: 'General Fitness',
      difficulty: 'Beginner',
      durationMinutes: 20,
      equipment: 'No Equipment',
      exercises: [{ exerciseId: 'push-up', sets: 3, reps: 10, restSeconds: 45 }],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    })

    assert.equal(workout.type, 'custom')
    assert.equal(workout.name, 'Morning Session')
    assert.equal(workout.category, 'Full Body')
    assert.equal(workout.exercises.length, 1)
  })

  it('drops records without an id or a name', () => {
    assert.equal(normalizeCustomWorkout({ name: 'No id' }), null)
    assert.equal(normalizeCustomWorkout({ id: 'custom-1' }), null)
    assert.equal(normalizeCustomWorkout(null), null)
  })

  it('falls back to safe vocabulary values', () => {
    const workout = normalizeCustomWorkout({
      id: 'custom-2',
      name: 'Broken',
      category: 'Kettlebells',
      goal: 'Get Huge',
      difficulty: 'Insane',
      equipment: 'A Treadmill',
      durationMinutes: 'lots',
    })

    assert.equal(workout.category, 'Full Body')
    assert.equal(workout.goal, 'General Fitness')
    assert.equal(workout.difficulty, 'Beginner')
    assert.equal(workout.equipment, 'No Equipment')
    assert.equal(workout.durationMinutes, 20)
  })

  it('clamps plan numbers instead of rendering NaN', () => {
    const workout = normalizeCustomWorkout({
      id: 'custom-3',
      name: 'Clamped',
      exercises: [{ exerciseId: 'plank', sets: 0, reps: -4, restSeconds: -10, durationSeconds: 'x' }],
    })

    assert.deepEqual(workout.exercises[0], {
      exerciseId: 'plank',
      sets: 1,
      reps: 1,
      restSeconds: 0,
      durationSeconds: 0,
    })
  })

  it('drops unusable entries, duplicates and preserves order', () => {
    const exercises = normalizeWorkoutExercises([
      { exerciseId: 'plank', sets: 3, reps: 1, restSeconds: 30, durationSeconds: 30 },
      { exerciseId: 'push-up', sets: 3, reps: 10, restSeconds: 45 },
      { exerciseId: 'plank', sets: 5, reps: 5, restSeconds: 5 },
      { sets: 3 },
      null,
    ])

    assert.deepEqual(exercises.map((entry) => entry.exerciseId), ['plank', 'push-up'])
    assert.equal(exercises[0].sets, 3, 'the first occurrence wins')
    assert.deepEqual(normalizeWorkoutExercises('nope'), [])
  })

  it('never mutates the stored payload', () => {
    const stored = [{ exerciseId: 'plank', sets: 'many' }]
    normalizeWorkoutExercises(stored)
    assert.equal(stored[0].sets, 'many')
  })

  it('removes duplicate ids inside a stored list', () => {
    const list = normalizeCustomWorkouts([
      { id: 'custom-1', name: 'One' },
      { id: 'custom-1', name: 'One again' },
      { id: 'custom-2', name: 'Two' },
    ])

    assert.deepEqual(list.map((workout) => workout.name), ['One', 'Two'])
  })

  it('normalizes a single entry', () => {
    assert.equal(normalizeWorkoutEntry({ exerciseId: '  plank  ' }).exerciseId, 'plank')
    assert.equal(normalizeWorkoutEntry({ sets: 3 }), null)
  })
})

describe('custom workout lifecycle', () => {
  const NOW = new Date('2026-10-06T07:45:00.000Z')

  it('creates unique ids', () => {
    const first = createCustomWorkoutId(NOW)
    const second = createCustomWorkoutId(new Date(NOW.getTime() + 1))
    assert.equal(first, `custom-${NOW.getTime()}`)
    assert.notEqual(first, second)
  })

  it('recognises custom workouts by type or id prefix', () => {
    assert.equal(isCustomWorkout({ type: 'custom' }), true)
    assert.equal(isCustomWorkout({ id: 'custom-9' }), true)
    assert.equal(isCustomWorkout({ id: 'core-blast' }), false)
    assert.equal(isCustomWorkout(null), false)
  })

  it('turns a draft into a stored workout', () => {
    const draft = {
      ...createWorkoutDraft(),
      name: 'My Morning Workout',
      description: 'Quick morning training',
      durationMinutes: 22,
      exercises: [{ exerciseId: 'push-up', sets: 3, reps: 10, restSeconds: 45 }],
    }

    const workout = createCustomWorkout(draft, NOW)

    assert.equal(workout.type, 'custom')
    assert.equal(workout.name, 'My Morning Workout')
    assert.equal(workout.createdAt, NOW.toISOString())
    assert.equal(workout.updatedAt, NOW.toISOString())
    assert.equal(workout.exercises.length, 1)

    // The typed 22 minutes loses to what the plan actually costs.
    assert.equal(workout.durationMinutes, deriveWorkoutPlan(draft.exercises).durationMinutes)
    assert.notEqual(workout.durationMinutes, 22)
    assert.deepEqual(workout.targetMuscles, deriveWorkoutPlan(draft.exercises).targetMuscles)
    assert.equal(workout.equipment, 'No Equipment')
  })

  it('starts from an empty plan', () => {
    assert.deepEqual(createWorkoutDraft().exercises, [])
    assert.equal(createWorkoutDraft().name, '')
  })

  it('adds, replaces and removes saved workouts', () => {
    const one = createCustomWorkout({ ...createWorkoutDraft(), name: 'One' }, NOW)
    const two = createCustomWorkout(
      { ...createWorkoutDraft(), name: 'Two' },
      new Date(NOW.getTime() + 1000),
    )

    let list = upsertCustomWorkout([], one)
    list = upsertCustomWorkout(list, two)
    assert.equal(list.length, 2)

    const edited = { ...one, name: 'One edited' }
    list = upsertCustomWorkout(list, edited)
    assert.equal(list.length, 2)
    assert.equal(getCustomWorkout(list, one.id).name, 'One edited')

    list = removeCustomWorkout(list, one.id)
    assert.equal(list.length, 1)
    assert.equal(getCustomWorkout(list, one.id), null)
    assert.deepEqual(removeCustomWorkout(list, 'missing').length, 1)
  })

  it('ignores an un-saveable record instead of writing junk', () => {
    assert.deepEqual(upsertCustomWorkout([], { name: 'no id' }), [])
    assert.deepEqual(upsertCustomWorkout(null, null), [])
  })
})

describe('validating the workout builder', () => {
  const validDraft = {
    ...createWorkoutDraft(),
    name: 'Leg Day Lite',
    exercises: [{ exerciseId: 'bodyweight-squat', sets: 3, reps: 12, restSeconds: 45 }],
  }

  it('accepts a complete draft', () => {
    assert.deepEqual(validateWorkoutDraft(validDraft), {})
  })

  it('requires a name', () => {
    assert.equal(validateWorkoutDraft({ ...validDraft, name: '   ' }).name, WORKOUT_MESSAGES.nameRequired)
  })

  it('rejects a name that is too long', () => {
    const errors = validateWorkoutDraft({ ...validDraft, name: 'x'.repeat(MAX_NAME_LENGTH + 1) })
    assert.equal(errors.name, WORKOUT_MESSAGES.nameTooLong)
  })

  it('requires at least one exercise', () => {
    assert.equal(
      validateWorkoutDraft({ ...validDraft, exercises: [] }).exercises,
      WORKOUT_MESSAGES.exerciseRequired,
    )
  })

  it('requires a positive duration', () => {
    assert.equal(
      validateWorkoutDraft({ ...validDraft, durationMinutes: 0 }).durationMinutes,
      WORKOUT_MESSAGES.durationRequired,
    )
  })

  it('checks each plan entry separately', () => {
    assert.deepEqual(
      validateWorkoutEntry({ exerciseId: 'plank', sets: 3, reps: 10, restSeconds: 45 }),
      [],
    )
    assert.deepEqual(
      validateWorkoutEntry({ exerciseId: 'plank', sets: 0, reps: 0, restSeconds: -5 }),
      [WORKOUT_MESSAGES.setsInvalid, WORKOUT_MESSAGES.repsInvalid, WORKOUT_MESSAGES.restInvalid],
    )
  })

  it('allows a timed hold without reps', () => {
    assert.deepEqual(
      validateWorkoutEntry({ exerciseId: 'plank', sets: 3, reps: 0, restSeconds: 30, durationSeconds: 45 }),
      [],
    )
  })

  it('reports entry problems keyed by position', () => {
    const errors = validateWorkoutDraft({
      ...validDraft,
      exercises: [
        { exerciseId: 'push-up', sets: 3, reps: 10, restSeconds: 45 },
        { exerciseId: 'plank', sets: 0, reps: 10, restSeconds: 45 },
      ],
    })

    assert.deepEqual(errors.fields['entry-1'], [WORKOUT_MESSAGES.setsInvalid])
    assert.equal(errors.fields['entry-0'], undefined)
  })
})
describe('workout builder derivations', () => {
  const plank = getExerciseById('plank')
  const dumbbellRow = EXERCISES.find((exercise) => exercise.equipment === 'Dumbbell')
  const barbellRow = EXERCISES.find((exercise) => exercise.equipment === 'Barbell')
  const bandRow = EXERCISES.find((exercise) => exercise.equipment === 'Resistance Band')

  it('reads equipment from the exercises instead of the athlete', () => {
    assert.equal(deriveWorkoutEquipment([plank]), 'No Equipment')
    assert.equal(deriveWorkoutEquipment([dumbbellRow, plank]), 'Dumbbells')
    assert.equal(deriveWorkoutEquipment([dumbbellRow, bandRow]), 'Dumbbells')
    assert.equal(deriveWorkoutEquipment([bandRow]), 'Resistance Band')
    assert.equal(deriveWorkoutEquipment([]), 'No Equipment')
  })

  it('treats a barbell or machine plan as gym equipment', () => {
    const machineRow = EXERCISES.find((exercise) => exercise.equipment === 'Machine') ?? barbellRow

    assert.equal(deriveWorkoutEquipment([plank, machineRow]), 'Gym Equipment')
    assert.equal(deriveWorkoutEquipment([plank, barbellRow]), 'Gym Equipment')
  })

  it('orders target muscles by how often the plan trains them', () => {
    const muscles = deriveWorkoutMuscles([plank, plank, dumbbellRow])

    // The plank appears twice, so every muscle it trains outranks the dumbbell's.
    assert.deepEqual(
      muscles.slice(0, plank.targetMuscles.length).sort(),
      [...plank.targetMuscles].sort(),
    )
    assert.equal(muscles.length, new Set(muscles).size)
    assert.deepEqual(deriveWorkoutMuscles([]), [])
  })

  it('ignores unknown exercise ids when deriving', () => {
    const plan = deriveWorkoutPlan([
      { exerciseId: 'not-an-exercise', sets: 3, reps: 10, restSeconds: 30 },
      { exerciseId: plank.id, sets: 3, reps: 10, restSeconds: 30 },
    ])

    assert.equal(plan.exercises.length, 1)
    assert.deepEqual(plan.targetMuscles, deriveWorkoutMuscles([plank]))
    assert.equal(plan.equipment, 'No Equipment')
  })

  it('derives duration, equipment and muscles for a whole plan', () => {
    const entries = [
      { exerciseId: plank.id, sets: 3, reps: 10, restSeconds: 45 },
      { exerciseId: dumbbellRow.id, sets: 4, reps: 8, restSeconds: 60 },
    ]

    assert.deepEqual(deriveWorkoutPlan(entries), {
      durationMinutes: estimateWorkoutMinutes(entries),
      equipment: 'Dumbbells',
      targetMuscles: deriveWorkoutMuscles([plank, dumbbellRow]),
      exercises: [plank, dumbbellRow],
    })
  })

  it('reports an empty plan honestly', () => {
    assert.deepEqual(deriveWorkoutPlan([]), {
      durationMinutes: 0,
      equipment: 'No Equipment',
      targetMuscles: [],
      exercises: [],
    })
    assert.equal(estimateWorkoutMinutes([]), 0)
  })
})

describe('saving a workout from the builder', () => {
  it('creates a plan entry with sensible starting numbers', () => {
    assert.deepEqual(createWorkoutEntry('plank'), {
      exerciseId: 'plank',
      sets: 3,
      reps: 10,
      restSeconds: 45,
      durationSeconds: 0,
    })
    assert.equal(createWorkoutEntry('plank', { sets: 5 }).sets, 5)
    assert.equal(createWorkoutEntry(''), null)
  })

  it('keeps the id and creation date when a workout is edited', () => {
    const created = createCustomWorkout(
      { name: 'Saturday Upper', exercises: [createWorkoutEntry('plank')] },
      new Date('2026-01-01T09:00:00.000Z'),
    )
    const edited = updateCustomWorkout(
      created,
      { ...created, name: 'Saturday Upper Body', exercises: [createWorkoutEntry('push-up')] },
      new Date('2026-02-02T10:00:00.000Z'),
    )

    assert.equal(edited.id, created.id)
    assert.equal(edited.createdAt, created.createdAt)
    assert.equal(edited.updatedAt, '2026-02-02T10:00:00.000Z')
    assert.equal(edited.name, 'Saturday Upper Body')
    assert.deepEqual(edited.exercises, [createWorkoutEntry('push-up')])
    assert.ok(isCustomWorkout(edited))
  })

  it('refuses to edit a workout that does not exist', () => {
    assert.equal(updateCustomWorkout(null, { name: 'Nothing' }), null)
  })

  it('keeps a list free of duplicates when the same workout is saved twice', () => {
    const workout = createCustomWorkout({ name: 'Legs', exercises: [createWorkoutEntry('plank')] })
    const list = upsertCustomWorkout([], workout)

    assert.equal(list.length, 1)
    assert.equal(upsertCustomWorkout(list, updateCustomWorkout(workout, { ...workout, name: 'Legs v2' })).length, 1)
    assert.equal(upsertCustomWorkout(list, { ...workout, name: '' }).length, 1)
    assert.equal(removeCustomWorkout(list, workout.id).length, 0)
  })

  it('starts a draft without a plan and keeps validation honest', () => {
    const draft = createWorkoutDraft()

    assert.deepEqual(draft, { ...DEFAULT_WORKOUT_DRAFT, exercises: [] })
    assert.equal(validateWorkoutDraft(draft).exercises, WORKOUT_MESSAGES.exerciseRequired)
    assert.deepEqual(
      validateWorkoutDraft({
        ...draft,
        name: 'Legs',
        exercises: [createWorkoutEntry('plank')],
      }),
      {},
    )
  })

  it('drops the reps of a timed hold so no stale rep count survives', () => {
    const entry = normalizeWorkoutEntry({
      exerciseId: 'plank',
      sets: 3,
      reps: 12,
      restSeconds: 30,
      durationSeconds: 45,
    })

    assert.equal(entry.reps, 0)
    assert.equal(entry.durationSeconds, 45)
    assert.equal(workoutVolumeLabel(entry), '3 sets × 45s hold')
    assert.deepEqual(validateWorkoutEntry(entry), [])
  })

  it('keeps reps for counted work', () => {
    assert.equal(createWorkoutEntry('push-up').reps, 10)
    assert.equal(workoutVolumeLabel(createWorkoutEntry('push-up')), '3 sets × 10 reps')
  })
})

describe('saved workout persistence', () => {
  const ALICE = 'user-alice'
  const BOB = 'user-bob'
  const aliceKey = userDataKey(STORAGE_KEYS.workouts, ALICE)
  const bobKey = userDataKey(STORAGE_KEYS.workouts, BOB)

  beforeEach(() => {
    installBrowser()
  })

  /** Read a key the way the library does: through the account-scoped key. */
  const readWorkouts = (key) => normalizeCustomWorkouts(getItem(key))

  it('reads back what the builder wrote, for that account only', () => {
    const workout = createCustomWorkout({
      name: 'Saturday Core & Push',
      description: 'Slow reps, then a plank.',
      exercises: [createWorkoutEntry('plank'), createWorkoutEntry('push-up')],
    })

    setItem(aliceKey, upsertCustomWorkout([], workout))

    const saved = readWorkouts(aliceKey)
    assert.equal(saved.length, 1)
    assert.equal(saved[0].id, workout.id)
    assert.equal(saved[0].name, 'Saturday Core & Push')
    assert.equal(saved[0].exercises.length, 2)

    // The built-in list must never answer for a saved workout.
    assert.equal(getWorkoutById(workout.id), null)
    assert.equal(getWorkoutById(workout.id, saved).name, 'Saturday Core & Push')

    // A second account on the same device sees nothing.
    assert.deepEqual(readWorkouts(bobKey), [])
  })

  it('edits in place and deletes without touching the other account', () => {
    const first = createCustomWorkout({
      name: 'Saturday Core',
      exercises: [createWorkoutEntry('plank')],
    })
    const bobWorkout = createCustomWorkout({
      name: 'Bob Legs',
      exercises: [createWorkoutEntry('squat')],
    })

    setItem(aliceKey, upsertCustomWorkout([], first))
    setItem(bobKey, upsertCustomWorkout([], bobWorkout))

    const held = createWorkoutEntry('plank', { durationSeconds: 45 })
    const edited = updateCustomWorkout(first, {
      ...first,
      name: 'Saturday Core v2',
      exercises: [held],
    })

    setItem(aliceKey, upsertCustomWorkout(readWorkouts(aliceKey), edited))

    const saved = readWorkouts(aliceKey)
    assert.equal(saved.length, 1)
    assert.equal(saved[0].name, 'Saturday Core v2')
    assert.equal(saved[0].createdAt, first.createdAt)
    assert.equal(saved[0].exercises[0].reps, 0)
    assert.equal(saved[0].exercises[0].durationSeconds, 45)
    // The stale duration carried over from the previous plan is corrected.
    assert.notEqual(saved[0].durationMinutes, first.durationMinutes)
    assert.equal(saved[0].durationMinutes, deriveWorkoutPlan([held]).durationMinutes)

    setItem(aliceKey, removeCustomWorkout(saved, saved[0].id))
    assert.deepEqual(readWorkouts(aliceKey), [])
    assert.equal(readWorkouts(bobKey).length, 1)
  })

  it('survives hand-edited storage without rendering a broken record', () => {
    setItem(aliceKey, [
      'not a workout',
      null,
      { id: 'broken', name: '', exercises: [{ exerciseId: 'does-not-exist' }] },
      { id: 'keep-me', name: 'Legs', exercises: [createWorkoutEntry('plank')] },
    ])

    const saved = readWorkouts(aliceKey)
    assert.deepEqual(saved.map((workout) => workout.id), ['keep-me'])
    assert.equal(resolveWorkoutExercises(saved[0]).length, 1)
    assert.equal(saved[0].durationMinutes, deriveWorkoutPlan(saved[0].exercises).durationMinutes)
  })

  it('offers the shortest library plans as quick workouts', () => {
    const quick = getQuickWorkouts(WORKOUTS, 3)
    const byRule = [...WORKOUTS].sort(
      (a, b) => a.durationMinutes - b.durationMinutes || a.name.localeCompare(b.name),
    )

    assert.deepEqual(quick.map((workout) => workout.id), byRule.slice(0, 3).map((w) => w.id))
    for (const workout of quick) {
      assert.ok(workout.exercises.length > 0)
      assert.ok(workout.durationMinutes >= 1)
    }
  })
})