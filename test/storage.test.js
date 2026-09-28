import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import { getItem, getValue, setItem, removeItem, hasItem, clearBeFitData } from '../src/utils/storage.js'
import { STORAGE_KEYS, PREFIX } from '../src/utils/storageKeys.js'
import { installBrowser, uninstallBrowser } from './helpers/browser.js'

describe('storage utility', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('reads back what it writes', () => {
    setItem('demo', { a: 1 })
    assert.deepEqual(getItem('demo'), { a: 1 })
  })

  it('returns null for missing keys', () => {
    assert.equal(getItem('nope'), null)
  })

  it('returns the fallback for missing keys', () => {
    assert.deepEqual(getValue('nope', []), [])
    assert.equal(getValue('nope'), null)
  })

  it('returns null instead of throwing on malformed JSON', () => {
    installBrowser({ broken: '{not json' })
    assert.equal(getItem('broken'), null)
  })

  it('returns the fallback instead of throwing on malformed JSON', () => {
    installBrowser({ broken: 'not json at all' })
    assert.deepEqual(getValue('broken', 'fallback'), 'fallback')
  })

  it('reports key presence', () => {
    setItem('here', 1)
    assert.equal(hasItem('here'), true)
    assert.equal(hasItem('gone'), false)
  })

  it('removes a single key', () => {
    setItem('temp', 1)
    assert.equal(removeItem('temp'), true)
    assert.equal(hasItem('temp'), false)
  })

  it('treats an empty string as absent', () => {
    installBrowser({ empty: '' })
    assert.equal(getItem('empty'), null)
  })

  it('round-trips falsy values', () => {
    setItem('zero', 0)
    setItem('false', false)
    setItem('null', null)
    assert.equal(getItem('zero'), 0)
    assert.equal(getItem('false'), false)
    assert.equal(getItem('null'), null)
  })

  it('degrades gracefully with no storage available', () => {
    uninstallBrowser()
    assert.equal(setItem('x', 1), false)
    assert.equal(getItem('x'), null)
    assert.equal(hasItem('x'), false)
    assert.equal(removeItem('x'), false)
  })
})

describe('clearBeFitData', () => {
  it('removes every namespaced key', () => {
    const storage = installBrowser()
    setItem(STORAGE_KEYS.users, [{ id: 'a' }])
    setItem(STORAGE_KEYS.session, { userId: 'a' })
    setItem(STORAGE_KEYS.profile, { userId: 'a' })

    assert.equal(clearBeFitData(), true)
    assert.equal(storage.getItem(STORAGE_KEYS.users), null)
    assert.equal(storage.getItem(STORAGE_KEYS.session), null)
    assert.equal(storage.getItem(STORAGE_KEYS.profile), null)
  })

  it('leaves unrelated keys untouched', () => {
    const storage = installBrowser()
    storage.setItem('some_other_app', 'keep me')
    setItem(STORAGE_KEYS.streak, { current: 3 })

    clearBeFitData()

    assert.equal(storage.getItem('some_other_app'), 'keep me')
    assert.equal(storage.getItem(STORAGE_KEYS.streak), null)
  })

  it('only clears keys carrying the BeFit prefix', () => {
    const storage = installBrowser()
    storage.setItem('befitish', 'not ours')
    setItem(STORAGE_KEYS.workouts, [])

    clearBeFitData()

    assert.equal(storage.getItem('befitish'), 'not ours')
    assert.ok(Object.values(STORAGE_KEYS).every((key) => key.startsWith(PREFIX)))
  })
})
