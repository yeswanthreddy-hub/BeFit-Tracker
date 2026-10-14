import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import {
  EXPORT_APP,
  EXPORT_VERSION,
  applyImport,
  clearFitnessData,
  collectUserData,
  createExportPayload,
  deleteAllLocalData,
  exportFileName,
  parseImportPayload,
  sanitizeForExport,
} from '../src/utils/dataExport.js'
import { STORAGE_KEYS, userDataKey } from '../src/utils/storageKeys.js'
import { getItem, hasItem, setItem } from '../src/utils/storage.js'
import { installBrowser } from './helpers/browser.js'

const ALICE = 'user-alice'
const BOB = 'user-bob'
const USER = { id: ALICE, name: 'Alice', email: 'alice@example.com' }

describe('sanitizeForExport', () => {
  it('strips forbidden keys wherever they appear', () => {
    const clean = sanitizeForExport({
      name: 'Alice',
      password: 'hunter2',
      nested: { secret: 'nope', token: 'nope', keep: 1 },
      list: [{ apiKey: 'gsk_x' }, { ok: true }],
    })
    assert.equal(clean.name, 'Alice')
    assert.equal('password' in clean, false)
    assert.deepEqual(clean.nested, { keep: 1 })
    assert.deepEqual(clean.list, [{}, { ok: true }])
  })

  it('matches forbidden keys case-insensitively', () => {
    const clean = sanitizeForExport({ Password: 'x', GROQ_API_KEY: 'y', Authorization: 'z' })
    assert.deepEqual(clean, {})
  })

  it('never mutates the source and returns fresh structures', () => {
    const source = { profile: { name: 'Alice' } }
    const clean = sanitizeForExport(source)
    clean.profile.name = 'Changed'
    assert.equal(source.profile.name, 'Alice')
  })
})

describe('collectUserData', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('fills fallbacks for keys that are not stored', () => {
    const data = collectUserData(ALICE)
    assert.deepEqual(data.workouts, [])
    assert.deepEqual(data.settings, {})
  })

  it('reads the account-scoped values', () => {
    setItem(userDataKey(STORAGE_KEYS.workouts, ALICE), [{ id: 'w1' }])
    assert.deepEqual(collectUserData(ALICE).workouts, [{ id: 'w1' }])
    assert.deepEqual(collectUserData(BOB).workouts, [])
  })
})

describe('createExportPayload', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('labels the export with the app and version', () => {
    const payload = createExportPayload(USER, ALICE, new Date('2026-01-02T03:04:05Z'))
    assert.equal(payload.app, EXPORT_APP)
    assert.equal(payload.version, EXPORT_VERSION)
    assert.equal(payload.exportedAt, '2026-01-02T03:04:05.000Z')
  })

  it('includes the athlete name and email but no password', () => {
    setItem(userDataKey(STORAGE_KEYS.profile, ALICE), {
      id: ALICE,
      name: 'Alice',
      email: 'alice@example.com',
      password: 'hunter2',
    })
    const payload = createExportPayload(USER, ALICE)
    assert.equal(payload.user.name, 'Alice')
    assert.equal(payload.user.email, 'alice@example.com')
    assert.equal('password' in payload.profile, false)
  })

  it('never leaks a Groq key or session secret', () => {
    setItem(userDataKey(STORAGE_KEYS.aiPreferences, ALICE), { apiKey: 'gsk_secret', token: 's' })
    const payload = createExportPayload(USER, ALICE)
    assert.deepEqual(payload.aiPreferences, {})
    assert.equal(JSON.stringify(payload).includes('gsk_'), false)
  })

  it('only carries the signing-in account data', () => {
    setItem(userDataKey(STORAGE_KEYS.progress, ALICE), [{ id: 'alice' }])
    setItem(userDataKey(STORAGE_KEYS.progress, BOB), [{ id: 'bob' }])
    assert.deepEqual(createExportPayload(USER, ALICE).progress, [{ id: 'alice' }])
  })
})

describe('exportFileName', () => {
  it('datestamps the file', () => {
    assert.equal(exportFileName(new Date('2026-05-06T00:00:00Z')), 'befit-data-2026-05-06.json')
  })
})

describe('parseImportPayload', () => {
  const valid = { app: EXPORT_APP, version: 1, workouts: [] }

  it('accepts a well-formed payload object', () => {
    const result = parseImportPayload(valid)
    assert.equal(result.ok, true)
    assert.deepEqual(result.payload, valid)
  })

  it('accepts a JSON string', () => {
    assert.equal(parseImportPayload(JSON.stringify(valid)).ok, true)
  })

  it('rejects malformed JSON', () => {
    assert.equal(parseImportPayload('{not json').ok, false)
  })

  it('rejects a foreign file', () => {
    assert.equal(parseImportPayload({ app: 'OtherApp', version: 1, workouts: [] }).ok, false)
  })

  it('rejects an unsupported version', () => {
    assert.equal(parseImportPayload({ app: EXPORT_APP, version: 99, workouts: [] }).ok, false)
  })

  it('rejects a payload with no fitness data', () => {
    assert.equal(parseImportPayload({ app: EXPORT_APP, version: 1 }).ok, false)
  })
})

describe('applyImport', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('writes whitelisted fitness keys to the account', () => {
    const written = applyImport(ALICE, USER, {
      app: EXPORT_APP,
      version: 1,
      workouts: [{ id: 'w1' }],
      settings: { theme: 'dark' },
    })
    assert.equal(written, 2)
    assert.deepEqual(getItem(userDataKey(STORAGE_KEYS.workouts, ALICE)), [{ id: 'w1' }])
    assert.deepEqual(getItem(userDataKey(STORAGE_KEYS.settings, ALICE)), { theme: 'dark' })
  })

  it('forces the imported profile to belong to the account', () => {
    applyImport(ALICE, USER, {
      app: EXPORT_APP,
      version: 1,
      profile: { id: BOB, userId: BOB, name: 'Mallory', email: 'mallory@example.com' },
    })
    const profile = getItem(userDataKey(STORAGE_KEYS.profile, ALICE))
    assert.equal(profile.id, ALICE)
    assert.equal(profile.userId, ALICE)
    assert.equal(profile.name, 'Alice')
    assert.equal(profile.email, 'alice@example.com')
  })

  it('never writes the user list, session or server secrets', () => {
    applyImport(ALICE, USER, {
      app: EXPORT_APP,
      version: 1,
      workouts: [],
      users: [{ id: 'x' }],
      session: { userId: 'x' },
    })
    assert.equal(hasItem(userDataKey(STORAGE_KEYS.users, ALICE)), false)
    assert.equal(hasItem(userDataKey(STORAGE_KEYS.session, ALICE)), false)
  })

  it('strips secrets from imported data', () => {
    applyImport(ALICE, USER, {
      app: EXPORT_APP,
      version: 1,
      aiPreferences: { apiKey: 'gsk_x', model: 'fast' },
    })
    assert.deepEqual(getItem(userDataKey(STORAGE_KEYS.aiPreferences, ALICE)), { model: 'fast' })
  })

  it('returns 0 for a non-object payload', () => {
    assert.equal(applyImport(ALICE, USER, null), 0)
  })
})

describe('clearFitnessData', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('removes fitness history but keeps the account and settings', () => {
    setItem(userDataKey(STORAGE_KEYS.workouts, ALICE), [{ id: 'w1' }])
    setItem(userDataKey(STORAGE_KEYS.completedWorkouts, ALICE), [{ id: 'c1' }])
    setItem(userDataKey(STORAGE_KEYS.foodLog, ALICE), [{ id: 'f1' }])
    setItem(userDataKey(STORAGE_KEYS.settings, ALICE), { theme: 'dark' })
    setItem(STORAGE_KEYS.users, [{ id: ALICE }])

    clearFitnessData(ALICE)

    assert.equal(hasItem(userDataKey(STORAGE_KEYS.workouts, ALICE)), false)
    assert.equal(hasItem(userDataKey(STORAGE_KEYS.completedWorkouts, ALICE)), false)
    assert.equal(hasItem(userDataKey(STORAGE_KEYS.foodLog, ALICE)), false)
    assert.ok(hasItem(userDataKey(STORAGE_KEYS.settings, ALICE)))
    assert.ok(hasItem(STORAGE_KEYS.users))
  })

  it('does not touch another account history', () => {
    setItem(userDataKey(STORAGE_KEYS.progress, ALICE), [{ id: 'a' }])
    setItem(userDataKey(STORAGE_KEYS.progress, BOB), [{ id: 'b' }])

    clearFitnessData(ALICE)

    assert.equal(hasItem(userDataKey(STORAGE_KEYS.progress, ALICE)), false)
    assert.ok(hasItem(userDataKey(STORAGE_KEYS.progress, BOB)))
  })
})

describe('deleteAllLocalData', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('removes every BeFit key but keeps unrelated data', () => {
    setItem(STORAGE_KEYS.users, [{ id: ALICE }])
    setItem(userDataKey(STORAGE_KEYS.workouts, ALICE), [{ id: 'w1' }])
    setItem('some-other-app', { keep: true })

    deleteAllLocalData()

    assert.equal(hasItem(STORAGE_KEYS.users), false)
    assert.equal(hasItem(userDataKey(STORAGE_KEYS.workouts, ALICE)), false)
    assert.ok(hasItem('some-other-app'))
  })
})
