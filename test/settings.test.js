import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import {
  DEFAULT_SETTINGS,
  THEME_VALUES,
  WORKOUT_STYLE_VALUES,
  getSettings,
  mergeSettings,
  normalizeSettings,
  resetSettings,
  saveSettings,
  settingsStorageKey,
  updateSettings,
} from '../src/utils/settings.js'
import { STORAGE_KEYS, userDataKey } from '../src/utils/storageKeys.js'
import { getItem, setItem } from '../src/utils/storage.js'
import { installBrowser } from './helpers/browser.js'

const ALICE = 'user-alice'
const BOB = 'user-bob'

describe('normalizeSettings', () => {
  it('fills every field for junk input', () => {
    const settings = normalizeSettings('not-an-object')
    assert.equal(settings.theme, DEFAULT_SETTINGS.theme)
    assert.equal(settings.reducedMotion, false)
    assert.equal(settings.aiInsights, true)
    assert.equal(settings.preferredWorkoutStyle, DEFAULT_SETTINGS.preferredWorkoutStyle)
  })

  it('keeps valid values', () => {
    const settings = normalizeSettings({
      theme: 'light',
      reducedMotion: true,
      aiInsights: false,
      showAiInsightsOnDashboard: false,
      preferredWorkoutStyle: 'Strength',
    })
    assert.equal(settings.theme, 'light')
    assert.equal(settings.reducedMotion, true)
    assert.equal(settings.aiInsights, false)
    assert.equal(settings.showAiInsightsOnDashboard, false)
    assert.equal(settings.preferredWorkoutStyle, 'Strength')
  })

  it('rejects values outside the known vocabularies', () => {
    const settings = normalizeSettings({ theme: 'neon', preferredWorkoutStyle: 'Yoga' })
    assert.ok(THEME_VALUES.includes(settings.theme))
    assert.ok(WORKOUT_STYLE_VALUES.includes(settings.preferredWorkoutStyle))
  })

  it('preserves unknown keys so future fields survive a round-trip', () => {
    const settings = normalizeSettings({ theme: 'dark', futureFlag: 'keep-me', nested: { a: 1 } })
    assert.equal(settings.futureFlag, 'keep-me')
    assert.deepEqual(settings.nested, { a: 1 })
  })

  it('migrates the legacy notifications.streakReminder flag', () => {
    assert.equal(normalizeSettings({ notifications: { streakReminder: false } }).workoutReminders, false)
    assert.equal(normalizeSettings({ notifications: { streakReminder: true } }).workoutReminders, true)
  })

  it('prefers the new workoutReminders flag over the legacy one', () => {
    const settings = normalizeSettings({
      workoutReminders: false,
      notifications: { streakReminder: true },
    })
    assert.equal(settings.workoutReminders, false)
  })
})

describe('mergeSettings', () => {
  it('applies a partial update without dropping other values', () => {
    const merged = mergeSettings({ theme: 'dark', reducedMotion: true }, { aiInsights: false })
    assert.equal(merged.theme, 'dark')
    assert.equal(merged.reducedMotion, true)
    assert.equal(merged.aiInsights, false)
  })

  it('stamps an updatedAt timestamp and the user id', () => {
    const merged = mergeSettings({}, { theme: 'light' }, ALICE)
    assert.equal(typeof merged.updatedAt, 'string')
    assert.equal(merged.userId, ALICE)
  })

  it('ignores invalid updates rather than writing them through', () => {
    const merged = mergeSettings({}, { theme: 'neon' })
    assert.equal(merged.theme, DEFAULT_SETTINGS.theme)
  })
})

describe('settings persistence', () => {
  beforeEach(() => {
    installBrowser()
  })

  it('scopes the storage key to the account', () => {
    assert.equal(settingsStorageKey(ALICE), userDataKey(STORAGE_KEYS.settings, ALICE))
    assert.notEqual(settingsStorageKey(ALICE), settingsStorageKey(BOB))
  })

  it('reads back what it saved', () => {
    assert.equal(saveSettings(ALICE, { theme: 'light', aiInsights: false }), true)
    const stored = getItem(userDataKey(STORAGE_KEYS.settings, ALICE))
    assert.equal(stored.theme, 'light')
    assert.equal(stored.aiInsights, false)
    assert.equal(stored.userId, ALICE)
  })

  it('applies updates on top of the stored settings', () => {
    saveSettings(ALICE, { theme: 'dark', reducedMotion: false })
    const next = updateSettings(ALICE, { reducedMotion: true })
    assert.equal(next.theme, 'dark')
    assert.equal(next.reducedMotion, true)
    assert.equal(getSettings(ALICE).reducedMotion, true)
  })

  it('keeps one account out of another account settings', () => {
    saveSettings(ALICE, { theme: 'light' })
    assert.equal(getSettings(BOB).theme, DEFAULT_SETTINGS.theme)

    saveSettings(BOB, { theme: 'dark' })
    assert.equal(getSettings(ALICE).theme, 'light')
    assert.equal(getSettings(BOB).theme, 'dark')
  })

  it('restores defaults but keeps the data account-scoped', () => {
    saveSettings(ALICE, { theme: 'light', aiInsights: false })
    const fresh = resetSettings(ALICE)
    assert.equal(fresh.theme, DEFAULT_SETTINGS.theme)
    assert.equal(fresh.aiInsights, true)
    assert.equal(getSettings(ALICE).theme, DEFAULT_SETTINGS.theme)
  })

  it('returns defaults when nothing is stored', () => {
    assert.deepEqual(getSettings(ALICE).theme, DEFAULT_SETTINGS.theme)
  })

  it('does not overwrite one account with a setItem on the plain key', () => {
    saveSettings(ALICE, { theme: 'light' })
    setItem(userDataKey(STORAGE_KEYS.settings, BOB), { theme: 'dark' })
    assert.equal(getSettings(ALICE).theme, 'light')
  })
})
