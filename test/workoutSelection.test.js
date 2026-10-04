import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  EMPTY_SELECTION,
  addExercise,
  clearSelection,
  isExerciseSelected,
  normalizeSelection,
  removeExercise,
  resolveSelection,
  selectionCount,
  selectionExerciseIds,
  toggleExercise,
} from '../src/utils/workoutSelection.js'
import { STORAGE_KEYS, PREFIX, userDataKey } from '../src/utils/storageKeys.js'
import { USER_OWNED_KEYS } from '../src/hooks/useUserStorage.js'
import { installBrowser } from './helpers/browser.js'
import { EXERCISES } from '../src/data/exercises.js'

const AT = new Date('2026-10-04T09:30:00.000Z')

describe('normalizing a workout selection', () => {
  it('turns a missing payload into an empty list', () => {
    assert.deepEqual(normalizeSelection(null), [])
    assert.deepEqual(normalizeSelection(undefined), [])
    assert.deepEqual(normalizeSelection('push-up'), [])
    assert.deepEqual(normalizeSelection({ exerciseId: 'push-up' }), [])
  })

  it('keeps well-formed records', () => {
    const selection = [{ exerciseId: 'push-up', addedAt: AT.toISOString() }]
    assert.deepEqual(normalizeSelection(selection), selection)
  })

  it('accepts bare id strings', () => {
    assert.deepEqual(normalizeSelection(['push-up']), [{ exerciseId: 'push-up', addedAt: null }])
  })

  it('drops entries without a usable id', () => {
    const selection = normalizeSelection([{ addedAt: AT.toISOString() }, null, 42, ''])
    assert.deepEqual(selection, [])
  })

  it('drops duplicates and keeps the first occurrence', () => {
    const selection = normalizeSelection([
      { exerciseId: 'plank', addedAt: 'first' },
      { exerciseId: 'plank', addedAt: 'second' },
    ])
    assert.equal(selection.length, 1)
    assert.equal(selection[0].addedAt, 'first')
  })

  it('never mutates the stored payload', () => {
    const stored = [{ exerciseId: 'plank', addedAt: null }]
    normalizeSelection(stored)
    assert.equal(stored.length, 1)
  })
})

describe('adding and removing exercises', () => {
  it('adds an exercise with a timestamp', () => {
    const selection = addExercise([], 'push-up', AT)
    assert.deepEqual(selection, [{ exerciseId: 'push-up', addedAt: AT.toISOString() }])
  })

  it('keeps the order things were added in', () => {
    let selection = addExercise([], 'push-up', AT)
    selection = addExercise(selection, 'plank', AT)
    assert.deepEqual(selectionExerciseIds(selection), ['push-up', 'plank'])
  })

  it('never adds the same exercise twice', () => {
    const once = addExercise([], 'push-up', AT)
    const twice = addExercise(once, 'push-up', AT)
    assert.deepEqual(twice, once)
  })

  it('ignores an empty id', () => {
    assert.deepEqual(addExercise([], ''), [])
    assert.deepEqual(addExercise([], null), [])
  })

  it('removes an exercise', () => {
    const selection = [{ exerciseId: 'push-up', addedAt: null }, { exerciseId: 'plank', addedAt: null }]
    assert.deepEqual(selectionExerciseIds(removeExercise(selection, 'push-up')), ['plank'])
  })

  it('removing something absent changes nothing', () => {
    const selection = [{ exerciseId: 'plank', addedAt: null }]
    assert.deepEqual(removeExercise(selection, 'burpee'), selection)
  })

  it('toggles on and off', () => {
    const added = toggleExercise([], 'plank', AT)
    assert.ok(isExerciseSelected(added, 'plank'))
    const removed = toggleExercise(added, 'plank', AT)
    assert.equal(removed.length, 0)
  })

  it('clears everything', () => {
    const selection = addExercise(addExercise([], 'a'), 'b')
    assert.equal(selectionCount(selection), 2)
    assert.deepEqual(clearSelection(), [])
    assert.deepEqual(clearSelection(), [...EMPTY_SELECTION])
  })

  it('reports what is selected and how much', () => {
    const selection = addExercise(addExercise([], 'push-up'), 'plank')
    assert.equal(isExerciseSelected(selection, 'plank'), true)
    assert.equal(isExerciseSelected(selection, 'burpee'), false)
    assert.equal(selectionCount(selection), 2)
  })

  it('survives a corrupt payload instead of throwing', () => {
    const selection = addExercise('{not json', 'push-up', AT)
    assert.equal(selectionCount(selection), 1)
  })
})

describe('resolving a selection against the catalog', () => {
  it('returns the matching exercises in the order added', () => {
    let selection = addExercise([], 'plank', AT)
    selection = addExercise(selection, 'push-up', AT)
    assert.deepEqual(resolveSelection(selection).map((exercise) => exercise.id), ['plank', 'push-up'])
  })

  it('skips ids that no longer exist', () => {
    const selection = [{ exerciseId: 'renamed-away', addedAt: null }, { exerciseId: 'plank', addedAt: null }]
    assert.deepEqual(resolveSelection(selection).map((exercise) => exercise.id), ['plank'])
  })

  it('returns nothing for an empty selection', () => {
    assert.deepEqual(resolveSelection([]), [])
  })

  it('every real exercise id can be selected and resolved', () => {
    for (const exercise of EXERCISES) {
      const selection = addExercise([], exercise.id, AT)
      assert.deepEqual(resolveSelection(selection), [exercise])
    }
  })
})

describe('workout builder storage key', () => {
  it('uses the documented befit_ key', () => {
    assert.equal(STORAGE_KEYS.workoutBuilder, 'befit_workout_builder')
    assert.ok(STORAGE_KEYS.workoutBuilder.startsWith(PREFIX))
  })

  it('is scoped per account so two athletes never share a selection', () => {
    assert.ok(USER_OWNED_KEYS.has(STORAGE_KEYS.workoutBuilder))
    assert.equal(
      userDataKey(STORAGE_KEYS.workoutBuilder, 'user-1'),
      'befit_u_user-1_workout_builder',
    )
  })

  it('falls back to the plain key for a signed-out visitor', () => {
    assert.equal(userDataKey(STORAGE_KEYS.workoutBuilder, null), 'befit_workout_builder')
  })

  it('persists a selection as JSON', () => {
    const storage = installBrowser()
    const selection = addExercise([], 'push-up', AT)
    storage.setItem(STORAGE_KEYS.workoutBuilder, JSON.stringify(selection))
    assert.deepEqual(normalizeSelection(JSON.parse(storage.getItem(STORAGE_KEYS.workoutBuilder))), selection)
  })
})