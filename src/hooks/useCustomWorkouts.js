import { useCallback, useMemo } from 'react'

import { useUserStorage } from './useUserStorage'
import { useNotifications } from './useNotifications'
import { STORAGE_KEYS } from '../utils/storageKeys'
import {
  createCustomWorkout,
  getCustomWorkout,
  normalizeCustomWorkouts,
  removeCustomWorkout,
  updateCustomWorkout,
  upsertCustomWorkout,
} from '../utils/customWorkouts'

/**
 * The athlete's saved workouts, persisted in localStorage.
 *
 * Stored under `befit_workouts` (scoped per account by `useUserStorage`, so two
 * local athletes never share a plan) as a list of workout records in exactly
 * the shape the built-in templates use.
 *
 * Saved workouts are *plans*: the builder writes them and the preparation page
 * reads them. Nothing here marks a workout complete, counts a rep or records
 * calories, because no session exists yet.
 *
 * Every read goes through `normalizeCustomWorkouts`, so hand-edited or
 * half-written storage can never reach the library as a broken record.
 */
export function useCustomWorkouts() {
  const [stored, setStored] = useUserStorage(STORAGE_KEYS.workouts, [])
  const { notify } = useNotifications()

  const workouts = useMemo(() => normalizeCustomWorkouts(stored), [stored])

  /** Save a new workout and return it, or `null` when the draft is unusable. */
  const create = useCallback(
    (draft) => {
      const workout = createCustomWorkout(draft)

      if (!workout) {
        notify({
          tone: 'error',
          title: 'Workout not saved',
          message: 'Add a name and at least one exercise, then try again.',
        })
        return null
      }

      setStored(upsertCustomWorkout(workouts, workout))
      notify({
        tone: 'success',
        title: 'Workout saved',
        message: `${workout.name} is in My Workouts and stored on this device.`,
      })
      return workout
    },
    [workouts, setStored, notify],
  )

  /** Save changes to an existing workout, keeping its id and creation date. */
  const update = useCallback(
    (id, draft) => {
      const existing = getCustomWorkout(workouts, id)

      if (!existing) {
        notify({
          tone: 'error',
          title: 'Workout not updated',
          message: 'That workout is no longer stored on this device.',
        })
        return null
      }

      const workout = updateCustomWorkout(existing, draft)

      if (!workout) {
        notify({
          tone: 'error',
          title: 'Workout not updated',
          message: 'Add a name and at least one exercise, then try again.',
        })
        return null
      }

      setStored(upsertCustomWorkout(workouts, workout))
      notify({
        tone: 'success',
        title: 'Workout updated',
        message: `${workout.name} now holds your latest plan.`,
      })
      return workout
    },
    [workouts, setStored, notify],
  )

  /** Delete a saved workout. */
  const remove = useCallback(
    (id) => {
      const existing = getCustomWorkout(workouts, id)

      if (!existing) return false

      setStored(removeCustomWorkout(workouts, id))
      notify({
        tone: 'info',
        title: 'Workout deleted',
        message: `${existing.name} was removed from this device.`,
      })
      return true
    },
    [workouts, setStored, notify],
  )

  /** Find one saved workout, for the edit route and the library's My Workouts list. */
  const find = useCallback((id) => getCustomWorkout(workouts, id), [workouts])

  return {
    workouts,
    count: workouts.length,
    isEmpty: workouts.length === 0,
    find,
    create,
    update,
    remove,
  }
}

export default useCustomWorkouts