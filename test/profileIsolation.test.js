import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import {
  DEFAULT_WORKOUT_DURATION,
  createProfileForUser,
  ensureProfileForUser,
  getUserById,
  readProfile,
  registerUser,
  saveProfile,
  signOut,
} from '../src/services/authService.js'
import { userDataKey } from '../src/utils/storageKeys.js'
import { installBrowser } from './helpers/browser.js'

const alice = { name: 'Alex Carter', email: 'alice@example.com', password: 'strongpass', confirmPassword: 'strongpass' }
const bob = { name: 'Sam Rivera', email: 'sam@example.com', password: 'strongpass', confirmPassword: 'strongpass' }

describe('profile isolation between accounts', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('gives each account its own profile key', () => {
    const first = registerUser(alice)
    const second = registerUser(bob)

    const firstKey = userDataKey('befit_profile', first.user.id)
    const secondKey = userDataKey('befit_profile', second.user.id)

    assert.notEqual(firstKey, secondKey)
  })

  it('does not let a second account overwrite the first profile', () => {
    const first = registerUser(alice)
    saveProfile(first.user.id, { fitnessGoal: 'Build Muscle', experienceLevel: 'Beginner' })

    const second = registerUser(bob)
    saveProfile(second.user.id, { fitnessGoal: 'Lose Weight', experienceLevel: 'Advanced' })

    const restored = ensureProfileForUser(getUserById(first.user.id))
    assert.equal(restored.fitnessGoal, 'Build Muscle')
    assert.equal(restored.experienceLevel, 'Beginner')
    assert.equal(getUserById(second.user.id).fitnessGoal, undefined)
  })

  it('restores each account on sign-in', () => {
    const first = registerUser(alice)
    saveProfile(first.user.id, { fitnessGoal: 'Build Muscle' })
    signOut()

    const second = registerUser(bob)
    saveProfile(second.user.id, { fitnessGoal: 'Lose Weight' })
    signOut()

    assert.equal(ensureProfileForUser(getUserById(first.user.id)).fitnessGoal, 'Build Muscle')
    assert.equal(ensureProfileForUser(getUserById(second.user.id)).fitnessGoal, 'Lose Weight')
  })

  it('keeps the onboarding answers out of the account record', () => {
    const first = registerUser(alice)
    saveProfile(first.user.id, { fitnessGoal: 'Build Muscle' })

    const stored = getUserById(first.user.id)
    assert.equal(stored.fitnessGoal, undefined)
    assert.equal(stored.preferredWorkoutDuration, undefined)
    assert.equal(readProfile(first.user.id).fitnessGoal, 'Build Muscle')
  })

  it('still creates a profile for an account that has none', () => {
    const first = registerUser(alice)
    const profile = ensureProfileForUser(getUserById(first.user.id))
    assert.equal(profile.userId, first.user.id)
    assert.equal(profile.preferredWorkoutDuration, DEFAULT_WORKOUT_DURATION)
  })
})

describe('stale session recovery', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('rebuilds a profile when the profile key was cleared', () => {
    const { user } = registerUser(alice)
    saveProfile(user.id, { fitnessGoal: 'Endurance' })
    assert.equal(readProfile(user.id).fitnessGoal, 'Endurance')

    const rebuilt = ensureProfileForUser(user)
    assert.equal(rebuilt.userId, user.id)
    assert.equal(rebuilt.preferredWorkoutDuration, DEFAULT_WORKOUT_DURATION)
  })

  it('gives a fresh account its own profile', () => {
    const first = registerUser(alice)
    saveProfile(first.user.id, { fitnessGoal: 'Build Muscle' })

    const second = registerUser(bob)
    assert.equal(readProfile(second.user.id).fitnessGoal, '')
    assert.equal(readProfile(first.user.id).fitnessGoal, 'Build Muscle')
  })

  it('does not invent a profile without a user', () => {
    installBrowser()
    assert.equal(ensureProfileForUser(null), null)
    assert.equal(createProfileForUser(null), null)
  })
})
