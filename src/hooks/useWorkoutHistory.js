import { useCallback, useMemo } from 'react'

import { useAuth } from './useAuth'
import { useUserStorage } from './useUserStorage'
import { STORAGE_KEYS } from '../utils/storageKeys'
import {
  createCompletedRecord,
  getCompletedById,
  hasCompletedSession,
  parseCompletedWorkouts,
  sortCompletedNewestFirst,
} from '../utils/workoutHistory'

/**
 * Completed-workout history for the signed-in account.
 *
 * Reads and writes `befit_completed_workouts` through `useUserStorage`, so the
 * key is scoped to the account and the dashboard, streak card and history page
 * all see the same list. Recording is idempotent: replaying the same session id
 * never appends a second copy.
 */
export function useWorkoutHistory() {
  const { user } = useAuth()
  const [stored, setStored] = useUserStorage(STORAGE_KEYS.completedWorkouts, [])

  const records = useMemo(() => parseCompletedWorkouts(stored), [stored])
  const newestFirst = useMemo(() => sortCompletedNewestFirst(records), [records])

  /** Save a finished session as one completed record. Returns it, or null. */
  const saveCompleted = useCallback(
    ({ workout, result, sessionId }) => {
      const record = createCompletedRecord(
        {
          sessionId,
          workoutId: workout?.id,
          workoutName: workout?.name,
          userId: user?.id ?? null,
          durationSeconds: result?.durationSeconds,
          exerciseCount: result?.exerciseCount,
          completedExercises: result?.completedExercises,
          completedSets: result?.completedSets,
          totalSets: result?.totalSets,
          goal: workout?.goal,
          difficulty: workout?.difficulty,
          category: workout?.category,
          exerciseNames: result?.exerciseNames,
        },
        new Date(),
      )

      if (!record) return null

      setStored((previous) => {
        const list = parseCompletedWorkouts(previous)
        if (hasCompletedSession(list, record.sessionId)) return list
        return [...list, record]
      })

      return record
    },
    [setStored, user],
  )

  const byId = useCallback((id) => getCompletedById(records, id), [records])

  return { records, newestFirst, count: records.length, byId, saveCompleted }
}

export default useWorkoutHistory
