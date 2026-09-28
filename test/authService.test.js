import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import {
  DEFAULT_WORKOUT_DURATION,
  createProfileForUser,
  ensureProfileForUser,
  getUserByEmail,
  getUserById,
  isEmailTaken,
  normalizeEmail,
  readProfile,
  readSession,
  readUsers,
  registerUser,
  saveProfile,
  signIn,
  signOut,
} from '../src/services/authService.js'
import { AUTH_MESSAGES } from '../src/utils/validation.js'
import { installBrowser } from './helpers/browser.js'

const account = {
  name: 'Alex Carter',
  email: 'Alex@Example.com',
  password: 'strongpass',
  confirmPassword: 'strongpass',
}

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    assert.equal(normalizeEmail('  Alex@Example.COM '), 'alex@example.com')
  })

  it('handles missing values', () => {
    assert.equal(normalizeEmail(undefined), '')
    assert.equal(normalizeEmail(null), '')
  })
})

describe('registerUser', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('creates an account, a profile and a session', () => {
    const result = registerUser(account)
    assert.equal(result.ok, true)

    const [user] = readUsers()
    assert.equal(user.email, 'alex@example.com')
    assert.equal(user.name, 'Alex Carter')
    assert.equal(readProfile(user.id).userId, user.id)
    assert.equal(readSession().userId, user.id)
  })

  it('generates a unique id per account', () => {
    const first = registerUser(account)
    const second = registerUser({ ...account, email: 'sam@example.com' })
    assert.notEqual(first.user.id, second.user.id)
  })

  it('collapses repeated whitespace in the name', () => {
    registerUser({ ...account, name: '  Alex   Carter  ' })
    assert.equal(readUsers()[0].name, 'Alex Carter')
  })

  it('writes an ISO createdAt', () => {
    registerUser(account)
    assert.ok(!Number.isNaN(Date.parse(readUsers()[0].createdAt)))
  })

  it('seeds sensible profile defaults', () => {
    const { user } = registerUser(account)
    const profile = readProfile(user.id)
    assert.equal(profile.fitnessGoal, '')
    assert.equal(profile.experienceLevel, '')
    assert.equal(profile.preferredWorkoutDuration, DEFAULT_WORKOUT_DURATION)
  })

  it('stores the session without duplicating credentials', () => {
    registerUser(account)
    const session = readSession()
    assert.deepEqual(Object.keys(session).sort(), ['loggedInAt', 'userId'])
    assert.equal('password' in session, false)
    assert.equal('email' in session, false)
  })

  it('persists nothing when validation fails', () => {
    registerUser({ ...account, name: '', password: '1', confirmPassword: '2' })
    assert.equal(readUsers().length, 0)
    assert.equal(readSession(), null)
    assert.equal(readProfile(), null)
  })

  it('rejects a duplicate email', () => {
    registerUser(account)
    const result = registerUser({ ...account, name: 'Someone Else' })
    assert.equal(result.ok, false)
    assert.equal(result.errors.email, AUTH_MESSAGES.emailTaken)
  })

  it('rejects a duplicate email across case and spacing', () => {
    registerUser(account)
    const result = registerUser({ ...account, email: '  ALEX@EXAMPLE.com ' })
    assert.equal(result.ok, false)
    assert.equal(readUsers().length, 1)
  })

  it('leaves the original account untouched when a duplicate is rejected', () => {
    registerUser(account)
    registerUser({ ...account, name: 'Impostor' })
    assert.equal(readUsers()[0].name, 'Alex Carter')
  })
})

describe('signIn', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('opens a session for correct credentials', () => {
    const { user } = registerUser(account)
    signOut()

    const result = signIn({ email: 'alex@example.com', password: 'strongpass' })
    assert.equal(result.ok, true)
    assert.equal(readSession().userId, user.id)
  })

  it('tolerates case and spacing in the email', () => {
    registerUser(account)
    assert.equal(signIn({ email: '  ALEX@Example.com ', password: 'strongpass' }).ok, true)
  })

  it('rejects a wrong password without revealing which field failed', () => {
    const { user } = registerUser(account)
    signOut()

    const result = signIn({ email: 'alex@example.com', password: 'wrongpass' })
    assert.equal(result.ok, false)
    assert.equal(result.error, AUTH_MESSAGES.invalidCredentials)
    assert.equal(readSession(), null)
    assert.equal(readUsers().length, 1)
    assert.equal(readUsers()[0].id, user.id)
  })

  it('returns the identical message for an unknown email', () => {
    registerUser(account)
    signOut()

    const wrongPassword = signIn({ email: 'alex@example.com', password: 'wrongpass' })
    const unknownEmail = signIn({ email: 'nobody@example.com', password: 'strongpass' })

    assert.equal(unknownEmail.error, wrongPassword.error)
    assert.equal(unknownEmail.error, AUTH_MESSAGES.invalidCredentials)
    assert.equal(readSession(), null)
  })

  it('returns field errors for empty input instead of a generic message', () => {
    const result = signIn({ email: '', password: '' })
    assert.equal(result.ok, false)
    assert.equal(result.error, undefined)
    assert.equal(result.errors.email, AUTH_MESSAGES.emailRequired)
  })

  it('refreshes loggedInAt on each sign-in', () => {
    const { user } = registerUser(account)
    signOut()

    signIn({ email: 'alex@example.com', password: 'strongpass' })
    const first = readSession().loggedInAt

    signOut()
    signIn({ email: 'alex@example.com', password: 'strongpass' })

    assert.equal(readSession().userId, user.id)
    assert.ok(readSession().loggedInAt >= first)
  })
})

describe('signOut', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('removes the session but keeps the account and profile', () => {
    const { user } = registerUser(account)

    assert.equal(signOut(), true)
    assert.equal(readSession(), null)
    assert.equal(readUsers().length, 1)
    assert.equal(readProfile(user.id).userId, user.id)
  })

  it('is safe to call twice', () => {
    registerUser(account)
    signOut()
    assert.equal(signOut(), true)
    assert.equal(readSession(), null)
  })

  it('allows signing back in afterwards', () => {
    registerUser(account)
    signOut()
    assert.equal(signIn({ email: 'alex@example.com', password: 'strongpass' }).ok, true)
  })
})

describe('user lookup', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('finds a user by id', () => {
    const { user } = registerUser(account)
    assert.equal(getUserById(user.id).email, 'alex@example.com')
  })

  it('finds a user by email regardless of case', () => {
    const { user } = registerUser(account)
    assert.equal(getUserByEmail('ALEX@EXAMPLE.COM').id, user.id)
  })

  it('returns null for unknown lookups', () => {
    registerUser(account)
    assert.equal(getUserById('nope'), null)
    assert.equal(getUserById(''), null)
    assert.equal(getUserByEmail('ghost@example.com'), null)
    assert.equal(getUserByEmail(''), null)
  })

  it('reports taken emails', () => {
    registerUser(account)
    assert.equal(isEmailTaken('alex@example.com'), true)
    assert.equal(isEmailTaken('free@example.com'), false)
  })
})

describe('saveProfile', () => {
  beforeEach(() => {
    installBrowser()
  })

  const full = { fitnessGoal: 'Build Muscle', experienceLevel: 'Beginner', preferredWorkoutDuration: 45 }

  it('persists the onboarding answers', () => {
    const { user } = registerUser(account)
    saveProfile(user.id, full)

    assert.equal(readProfile(user.id).fitnessGoal, 'Build Muscle')
    assert.equal(readProfile(user.id).experienceLevel, 'Beginner')
    assert.equal(readProfile(user.id).preferredWorkoutDuration, 45)
    assert.ok(!Number.isNaN(Date.parse(readProfile(user.id).updatedAt)))
  })

  it('keeps identity fields owned by the user record', () => {
    const { user } = registerUser(account)
    saveProfile(user.id, full)

    assert.equal(readProfile(user.id).userId, user.id)
    assert.equal(readProfile(user.id).email, 'alex@example.com')
    assert.equal('password' in readProfile(user.id), false)
  })

  it('leaves untouched fields alone on a partial update', () => {
    const { user } = registerUser(account)
    saveProfile(user.id, full)
    saveProfile(user.id, { experienceLevel: 'Advanced' })

    assert.equal(readProfile(user.id).fitnessGoal, 'Build Muscle')
    assert.equal(readProfile(user.id).preferredWorkoutDuration, 45)
    assert.equal(readProfile(user.id).experienceLevel, 'Advanced')
  })

  it('ignores an invalid duration', () => {
    const { user } = registerUser(account)
    saveProfile(user.id, full)
    saveProfile(user.id, { preferredWorkoutDuration: 'nonsense' })
    assert.equal(readProfile(user.id).preferredWorkoutDuration, 45)
  })

  it('returns null for an unknown user and writes nothing', () => {
    const { user } = registerUser(account)
    const before = readProfile(user.id)
    assert.equal(saveProfile('ghost', { fitnessGoal: 'Lose Weight' }), null)
    assert.deepEqual(readProfile(user.id), before)
  })
})

describe('profile recovery', () => {
  it('rebuilds a missing profile for the given user', () => {
    installBrowser()
    const { user } = registerUser(account)
    installBrowser() // wipes storage, leaving the user object in memory only

    const rebuilt = ensureProfileForUser(user)
    assert.equal(rebuilt.userId, user.id)
  })

  it('returns null without a user', () => {
    installBrowser()
    assert.equal(ensureProfileForUser(null), null)
    assert.equal(createProfileForUser(null), null)
  })

  it('keeps an intact profile', () => {
    installBrowser()
    const { user } = registerUser(account)
    saveProfile(user.id, { fitnessGoal: 'Lose Weight' })
    assert.equal(ensureProfileForUser(user).fitnessGoal, 'Lose Weight')
  })

  it('creates a profile shape from a user record', () => {
    const profile = createProfileForUser({
      id: 'user-1',
      name: 'Sam',
      email: 'sam@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    assert.equal(profile.id, 'user-1')
    assert.equal(profile.userId, 'user-1')
    assert.equal(profile.preferredWorkoutDuration, DEFAULT_WORKOUT_DURATION)
  })
})

describe('corrupt localStorage recovery', () => {
  it('treats malformed users as an empty list', () => {
    installBrowser({ befit_users: 'not json' })
    assert.deepEqual(readUsers(), [])
    assert.equal(isEmailTaken('alex@example.com'), false)
  })

  it('recovers by writing a fresh list on the next registration', () => {
    installBrowser({ befit_users: 'not json' })
    const result = registerUser(account)
    assert.equal(result.ok, true)
    assert.equal(readUsers().length, 1)
  })

  it('drops malformed user entries but keeps valid ones', () => {
    installBrowser({
      befit_users: JSON.stringify([null, 'nope', 42, { id: 'user-ok', email: 'ok@example.com' }]),
    })
    assert.equal(readUsers().length, 1)
    assert.equal(readUsers()[0].id, 'user-ok')
  })

  it('rejects a session without a userId', () => {
    installBrowser({ befit_session: JSON.stringify({ loggedInAt: 'now' }) })
    assert.equal(readSession(), null)
  })

  it('rejects a session that is not an object', () => {
    installBrowser({ befit_session: '"nonsense"' })
    assert.equal(readSession(), null)
  })

  it('rejects a profile that is not an object', () => {
    installBrowser({ 'befit_u_user-1_profile': '[1,2,3]' })
    assert.equal(readProfile('user-1'), null)
  })

  it('rejects a profile whose userId does not match', () => {
    installBrowser({ 'befit_u_user-1_profile': JSON.stringify({ userId: 'someone-else', fitnessGoal: 'x' }) })
    assert.equal(ensureProfileForUser({ id: 'user-1' }).fitnessGoal, '')
  })

  it('survives a full register/login/logout cycle on damaged data', () => {
    installBrowser({ befit_users: '{{{', befit_session: 'nope' })
    assert.equal(registerUser(account).ok, true)
    signOut()
    assert.equal(signIn({ email: 'alex@example.com', password: 'strongpass' }).ok, true)
  })
})
