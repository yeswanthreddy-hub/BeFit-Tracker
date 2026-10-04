import { useCallback, useMemo } from 'react'

import { useUserStorage } from './useUserStorage'
import { useNotifications } from './useNotifications'
import { STORAGE_KEYS } from '../utils/storageKeys'
import { getExerciseById } from '../utils/exercises'
import {
  addExercise,
  clearSelection,
  isExerciseSelected,
  normalizeSelection,
  removeExercise,
  resolveSelection,
} from '../utils/workoutSelection'

/**
 * The temporary workout selection, persisted in localStorage.
 *
 * Stored under `befit_workout_builder` (scoped per account by `useUserStorage`,
 * so two local athletes never share a selection) as
 * `[{ exerciseId, addedAt }]`.
 *
 * This is a *selection*, not a session: nothing here marks a workout complete
 * and no sets, reps or calories are recorded. The workout builder and workout
 * session features will read this key later.
 */

/** Accept an exercise record or a bare id. */
function toId(target) {
  return typeof target === 'string' ? target : target?.id
}

/** Best available name for a toast. */
function toName(target) {
  const id = toId(target)
  return (typeof target === 'string' ? getExerciseById(target) : target)?.name ?? id ?? 'Exercise'
}

export function useWorkoutSelection() {
  const [stored, setStored] = useUserStorage(STORAGE_KEYS.workoutBuilder, [])
  const { notify } = useNotifications()

  const selection = useMemo(() => normalizeSelection(stored), [stored])
  const selectedExercises = useMemo(() => resolveSelection(selection), [selection])

  const add = useCallback(
    (target) => {
      const id = toId(target)
      if (!id) return false
      if (isExerciseSelected(selection, id)) return false

      setStored(addExercise(selection, id))
      notify({
        tone: 'success',
        title: 'Added to workout selection',
        message: `${toName(target)} is waiting in your selection.`,
      })
      return true
    },
    [selection, setStored, notify],
  )

  const remove = useCallback(
    (target) => {
      const id = toId(target)
      if (!id) return false
      if (!isExerciseSelected(selection, id)) return false

      setStored(removeExercise(selection, id))
      notify({
        tone: 'info',
        title: 'Removed from workout selection',
        message: `${toName(target)} is no longer selected.`,
      })
      return true
    },
    [selection, setStored, notify],
  )

  const toggle = useCallback(
    (target) => (isExerciseSelected(selection, toId(target)) ? remove(target) : add(target)),
    [selection, add, remove],
  )

  const clear = useCallback(() => {
    setStored(clearSelection())
    notify({
      tone: 'info',
      title: 'Workout selection cleared',
      message: 'Every exercise was removed from your selection.',
    })
  }, [setStored, notify])

  return {
    selection,
    selectedExercises,
    count: selection.length,
    isSelected: (id) => isExerciseSelected(selection, id),
    add,
    remove,
    toggle,
    clear,
  }
}