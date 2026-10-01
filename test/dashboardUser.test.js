import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'

import {
  getCurrentProfile,
  getCurrentUser,
  getDisplayName,
  getGreeting,
  getUserInitials,
  readUserCollection,
} from '../src/utils/user.js'
import { setItem } from '../src/utils/storage.js'
import { registerUser, saveProfile, signIn, signOut } from '../src/services/authService.js'
import { STORAGE_KEYS } from '../src/utils/storageKeys.js'
import { installBrowser, uninstallBrowser } from './helpers/browser.js'

describe('display helpers', () => {
  it('uses the first name only', () => {
    assert.equal(getDisplayName({ name: 'Yaswanth Reddy' }), 'Yaswanth')
    assert.equal(getDisplayName({ name: '  Ada   Lovelace King ' }), 'Ada')
  })

  it('falls back to Athlete when no name exists', () => {
    assert.equal(getDisplayName(null), 'Athlete')
    assert.equal(getDisplayName({ name: '   ' }), 'Athlete')
  })

  it('builds initials from one or two words', () => {
    assert.equal(getUserInitials('Yaswanth Reddy'), 'YR')
    assert.equal(getUserInitials('cher'), 'CH')
    assert.equal(getUserInitials(''), 'BF')
  })
})

describe('getGreeting', () => {
  it('greets in the morning before noon', () => {
    const result = getGreeting(new Date(2026, 0, 1, 7, 30))
    assert.equal(result.greeting, 'Good morning')
    assert.equal(result.context, 'Ready to start your day strong?')
    assert.equal(result.period, 'morning')
  })

  it('greets in the afternoon before six', () => {
    const result = getGreeting(new Date(2026, 0, 1, 14, 0))
    assert.equal(result.greeting, 'Good afternoon')
    assert.equal(result.period, 'afternoon')
  })

  it('greets in the evening after six', () => {
    const result = getGreeting(new Date(2026, 0, 1, 21, 15))
    assert.equal(result.greeting, 'Good evening')
    assert.equal(result.context, 'Finish the day with a strong session.')
    assert.equal(result.period, 'evening')
  })

  it('uses the local clock at the boundaries', () => {
    assert.equal(getGreeting(new Date(2026, 0, 1, 11, 59)).period, 'morning')
    assert.equal(getGreeting(new Date(2026, 0, 1, 12, 0)).period, 'afternoon')
    assert.equal(getGreeting(new Date(2026, 0, 1, 17, 59)).period, 'afternoon')
    assert.equal(getGreeting(new Date(2026, 0, 1, 18, 0)).period, 'evening')
  })
})

describe('session-backed readers', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('returns nothing while signed out', () => {
    assert.equal(getCurrentUser(), null)
    assert.equal(getCurrentProfile(), null)
  })

  it('resolves the active user and profile through the session id', () => {
    const result = registerUser({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret123', confirmPassword: 'secret123' })
    assert.equal(result.ok, true)
    saveProfile(result.user.id, {
      fitnessGoal: 'Build Muscle',
      experienceLevel: 'Beginner',
      preferredWorkoutDuration: 30,
    })

    assert.equal(getCurrentUser().email, 'ada@example.com')
    assert.equal(getCurrentProfile().fitnessGoal, 'Build Muscle')
  })

  it('resolves nothing once the session is cleared', () => {
    registerUser({ name: 'Ada', email: 'ada@example.com', password: 'secret123', confirmPassword: 'secret123' })
    signOut()
    assert.equal(getCurrentUser(), null)
  })

  it('reopens the session on sign in', () => {
    registerUser({ name: 'Ada', email: 'ada@example.com', password: 'secret123', confirmPassword: 'secret123' })
    signOut()
    assert.equal(signIn({ email: 'ADA@example.com', password: 'secret123', confirmPassword: 'secret123' }).ok, true)
    assert.equal(getCurrentUser().name, 'Ada')
  })
})

describe('readUserCollection', () => {
  beforeEach(() => {
    installBrowser()
  })

  afterEach(() => {
    uninstallBrowser()
  })

  it('returns an empty list when nothing is stored', () => {
    assert.deepEqual(readUserCollection(STORAGE_KEYS.completedWorkouts, 'user-a'), [])
  })

  it('returns an empty list for corrupt payloads', () => {
    setItem('befit_u_user-a_completed_workouts', { not: 'an array' })
    assert.deepEqual(readUserCollection(STORAGE_KEYS.completedWorkouts, 'user-a'), [])
  })

  it('keeps one account out of another account data', () => {
    setItem('befit_u_user-a_completed_workouts', [{ id: 'a1' }])
    assert.deepEqual(readUserCollection(STORAGE_KEYS.completedWorkouts, 'user-b'), [])
    assert.deepEqual(readUserCollection(STORAGE_KEYS.completedWorkouts, 'user-a'), [{ id: 'a1' }])
  })
})