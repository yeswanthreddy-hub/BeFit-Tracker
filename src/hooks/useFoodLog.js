import { useCallback, useMemo } from 'react'

import { useUserStorage } from './useUserStorage'
import { useNotifications } from './useNotifications'
import { STORAGE_KEYS } from '../utils/storageKeys'
import {
  createFoodLogEntry,
  entriesForDate,
  parseFoodLog,
} from '../utils/nutrition'

/**
 * The signed-in athlete's food log, persisted in localStorage.
 *
 * Stored under `befit_food_log` (scoped per account by `useUserStorage`, so two
 * local athletes never share meals) as one flat list of entries, each carrying
 * the day it belongs to and the values already scaled to its servings.
 *
 * Every read goes through `parseFoodLog`, so hand-edited or half-written
 * storage can never reach the diet page as a broken record. Adding an entry is
 * append-only: a log is a record of what was eaten, so an id is never reused.
 */
export function useFoodLog() {
  const [stored, setStored] = useUserStorage(STORAGE_KEYS.foodLog, [])
  const { notify } = useNotifications()

  const entries = useMemo(() => parseFoodLog(stored), [stored])

  /** Log one food. Returns the stored entry, or `null` when input is unusable. */
  const addFood = useCallback(
    (input) => {
      const entry = createFoodLogEntry(input)

      if (!entry) {
        notify({
          tone: 'error',
          title: 'Food not logged',
          message: 'Pick a food and a serving, then try again.',
        })
        return null
      }

      setStored((previous) => [...parseFoodLog(previous), entry])
      return entry
    },
    [setStored, notify],
  )

  /** Remove one logged entry by id. */
  const removeEntry = useCallback(
    (id) => {
      const target = typeof id === 'string' ? id : ''
      if (target === '') return false

      setStored((previous) => parseFoodLog(previous).filter((item) => item.id !== target))
      return true
    },
    [setStored],
  )

  /** All entries for one day (defaults to today). */
  const forDate = useCallback((date = new Date()) => entriesForDate(entries, date), [entries])

  /** One entry by id. */
  const byId = useCallback(
    (id) => entries.find((item) => item.id === id) ?? null,
    [entries],
  )

  return { entries, count: entries.length, isEmpty: entries.length === 0, addFood, removeEntry, forDate, byId }
}

export default useFoodLog
