import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import { PREFIX, STORAGE_KEYS, USER_DATA_PREFIX, userDataKey } from '../src/utils/storageKeys.js'
import { getItem, setItem, hasItem } from '../src/utils/storage.js'
import { seedBeFitData } from '../src/data/seed.js'
import { installBrowser } from './helpers/browser.js'

const ALICE = 'user-alice'
const BOB = 'user-bob'

describe('userDataKey', () => {
  it('scopes a key to an account id', () => {
    assert.equal(userDataKey(STORAGE_KEYS.workouts, ALICE), 'befit_u_user-alice_workouts')
  })

  it('gives two accounts different keys', () => {
    assert.notEqual(userDataKey(STORAGE_KEYS.workouts, ALICE), userDataKey(STORAGE_KEYS.workouts, BOB))
  })

  it('leaves the key alone without an account id', () => {
    assert.equal(userDataKey(STORAGE_KEYS.workouts, null), STORAGE_KEYS.workouts)
    assert.equal(userDataKey(STORAGE_KEYS.workouts, ''), STORAGE_KEYS.workouts)
    assert.equal(userDataKey(STORAGE_KEYS.workouts, undefined), STORAGE_KEYS.workouts)
  })

  it('keeps the BeFit prefix so the data can still be cleared', () => {
    assert.ok(userDataKey(STORAGE_KEYS.progress, ALICE).startsWith(PREFIX))
    assert.ok(userDataKey(STORAGE_KEYS.progress, ALICE).startsWith(USER_DATA_PREFIX))
  })

  it('does not double up the prefix', () => {
    const scoped = userDataKey(STORAGE_KEYS.workouts, ALICE)
    assert.equal(scoped.indexOf(PREFIX, 1), -1)
  })

  it('covers every user-owned key', () => {
    for (const key of [
      STORAGE_KEYS.workouts,
      STORAGE_KEYS.completedWorkouts,
      STORAGE_KEYS.foodLog,
      STORAGE_KEYS.progress,
      STORAGE_KEYS.streak,
    ]) {
      assert.ok(userDataKey(key, ALICE).includes(ALICE), `${key} should be scoped`)
    }
  })
})

describe('account data isolation', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('keeps one account out of another account data', () => {
    setItem(userDataKey(STORAGE_KEYS.progress, ALICE), [{ id: 'p1', bodyWeightKg: 80 }])

    assert.deepEqual(getItem(userDataKey(STORAGE_KEYS.progress, BOB)), null)
    assert.deepEqual(getItem(userDataKey(STORAGE_KEYS.progress, ALICE)), [{ id: 'p1', bodyWeightKg: 80 }])
  })

  it('survives two accounts writing the same key', () => {
    setItem(userDataKey(STORAGE_KEYS.streak, ALICE), { current: 9 })
    setItem(userDataKey(STORAGE_KEYS.streak, BOB), { current: 2 })

    assert.equal(getItem(userDataKey(STORAGE_KEYS.streak, ALICE)).current, 9)
    assert.equal(getItem(userDataKey(STORAGE_KEYS.streak, BOB)).current, 2)
  })

  it('does not leak an update from one account to another', () => {
    setItem(userDataKey(STORAGE_KEYS.workouts, ALICE), ['alice-plan'])
    const bobPlans = getItem(userDataKey(STORAGE_KEYS.workouts, BOB)) ?? []
    assert.deepEqual(bobPlans, [])
  })
})

describe('seedBeFitData', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('seeds an account-scoped copy', () => {
    seedBeFitData(ALICE)
    assert.ok(hasItem(userDataKey(STORAGE_KEYS.streak, ALICE)))
    assert.ok(hasItem(userDataKey(STORAGE_KEYS.progress, ALICE)))
  })

  it('gives a second account its own seeded data', () => {
    seedBeFitData(ALICE)
    assert.equal(hasItem(userDataKey(STORAGE_KEYS.streak, BOB)), false)

    seedBeFitData(BOB)
    assert.ok(hasItem(userDataKey(STORAGE_KEYS.streak, BOB)))
  })

  it('never overwrites existing data', () => {
    setItem(userDataKey(STORAGE_KEYS.progress, ALICE), [{ id: 'mine' }])
    seedBeFitData(ALICE)
    assert.deepEqual(getItem(userDataKey(STORAGE_KEYS.progress, ALICE)), [{ id: 'mine' }])
  })

  it('still seeds the plain keys for a signed-out visitor', () => {
    seedBeFitData()
    assert.ok(hasItem(STORAGE_KEYS.streak))
    assert.ok(hasItem(STORAGE_KEYS.workouts))
  })

  it('does not seed the profile, which auth owns', () => {
    seedBeFitData(ALICE)
    assert.equal(hasItem(STORAGE_KEYS.profile), false)
    assert.equal(hasItem(userDataKey(STORAGE_KEYS.profile, ALICE)), false)
  })
})
