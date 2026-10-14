import { useCallback, useMemo } from 'react'

import { useUserStorage } from './useUserStorage'
import { useNotifications } from './useNotifications'
import { STORAGE_KEYS } from '../utils/storageKeys'
import {
  createCustomFood,
  getCustomFood,
  normalizeCustomFoods,
  removeCustomFood,
  updateCustomFood,
  upsertCustomFood,
} from '../utils/customFoods'

/**
 * The athlete's own foods, persisted in localStorage.
 *
 * Stored under `befit_foods` (scoped per account by `useUserStorage`) as a list
 * of food records in exactly the shape the built-in catalog uses, so a custom
 * food and a shipped food behave identically everywhere.
 *
 * Every read goes through `normalizeCustomFoods`, so hand-edited or
 * half-written storage can never reach the food browser as a broken record.
 */
export function useCustomFoods() {
  const [stored, setStored] = useUserStorage(STORAGE_KEYS.foods, [])
  const { notify } = useNotifications()

  const foods = useMemo(() => normalizeCustomFoods(stored), [stored])

  /** Save a new custom food and return it, or `null` when the draft is unusable. */
  const create = useCallback(
    (draft) => {
      const food = createCustomFood(draft)

      if (!food) {
        notify({
          tone: 'error',
          title: 'Food not saved',
          message: 'Give the food a name, then try again.',
        })
        return null
      }

      setStored(upsertCustomFood(foods, food))
      notify({
        tone: 'success',
        title: 'Custom food saved',
        message: `${food.name} is now available when you log a meal.`,
      })
      return food
    },
    [foods, setStored, notify],
  )

  /** Save changes to a custom food, keeping its id and creation date. */
  const update = useCallback(
    (id, draft) => {
      const existing = getCustomFood(foods, id)

      if (!existing) {
        notify({
          tone: 'error',
          title: 'Food not updated',
          message: 'That custom food is no longer stored on this device.',
        })
        return null
      }

      const food = updateCustomFood(existing, draft)

      if (!food) {
        notify({
          tone: 'error',
          title: 'Food not updated',
          message: 'Give the food a name, then try again.',
        })
        return null
      }

      setStored(upsertCustomFood(foods, food))
      notify({
        tone: 'success',
        title: 'Custom food updated',
        message: `${food.name} now holds your latest values.`,
      })
      return food
    },
    [foods, setStored, notify],
  )

  /** Delete a custom food. */
  const remove = useCallback(
    (id) => {
      const existing = getCustomFood(foods, id)
      if (!existing) return false

      setStored(removeCustomFood(foods, id))
      notify({
        tone: 'info',
        title: 'Custom food deleted',
        message: `${existing.name} was removed from this device.`,
      })
      return true
    },
    [foods, setStored, notify],
  )

  /** Find one custom food by id. */
  const find = useCallback((id) => getCustomFood(foods, id), [foods])

  return {
    foods,
    count: foods.length,
    isEmpty: foods.length === 0,
    find,
    create,
    update,
    remove,
  }
}

export default useCustomFoods
