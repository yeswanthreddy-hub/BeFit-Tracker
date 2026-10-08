import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import {
  clearActiveSession,
  completedSetCount,
  createInitialState,
  createSessionId,
  elapsedSeconds,
  isValidSnapshot,
  readActiveSession,
  sessionReducer,
  sessionResult,
  toSessionSnapshot,
  totalSets,
  writeActiveSession,
} from '../utils/workoutSession'

/**
 * Drives a live workout session.
 *
 * The reducer owns the rules (see `src/utils/workoutSession.js`); this hook owns
 * the things a reducer cannot: a single 1-second heartbeat while the session is
 * active and unpaused, persistence of the in-progress snapshot, and the
 * offer to resume after a refresh.
 *
 * Only one interval ever runs, and it is cleared on pause, on finishing, and on
 * unmount, so a background tab cannot stack timers.
 *
 * @param {object} options
 * @param {Array} options.plan       resolved workout entries
 * @param {string} options.workoutId
 * @param {string} [options.userId]
 * @param {boolean} [options.autostart] begin as soon as the page opens
 */
export function useWorkoutSession({ plan, workoutId, userId, autostart = false }) {
  const [state, dispatch] = useReducer(
    sessionReducer,
    { plan, workoutId, userId },
    (initial) =>
      createInitialState(initial.plan, { workoutId: initial.workoutId, userId: initial.userId }),
  )

  const [now, setNow] = useState(() => Date.now())

  // A session left behind by a refresh, read once when the page opens. It is
  // deliberately not derived from reactive storage: writing our own snapshots
  // must never make the resume prompt reappear mid-session.
  const [recovery, setRecovery] = useState(() => {
    if (!workoutId || !userId) return null
    const snapshot = readActiveSession(userId)
    return isValidSnapshot(snapshot, workoutId, userId) ? snapshot : null
  })

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })

  // A plan loaded after the first render (custom workouts) updates the intro
  // state so "Start" launches the real plan.
  useEffect(() => {
    dispatch({ type: 'SET_PLAN', plan })
  }, [plan])

  const startedRef = useRef(false)

  const start = useCallback(() => {
    startedRef.current = true
    dispatch({ type: 'START', now: Date.now(), sessionId: createSessionId() })
  }, [])

  useEffect(() => {
    if (startedRef.current || recovery) return
    if (!autostart || state.phase !== 'intro') return
    startedRef.current = true
    dispatch({ type: 'START', now: Date.now(), sessionId: createSessionId() })
  }, [autostart, recovery, state.phase])

  const heartbeat = state.phase === 'work' || state.phase === 'rest' || state.phase === 'exerciseComplete'

  useEffect(() => {
    if (!heartbeat || state.isPaused) return undefined

    const id = setInterval(() => {
      dispatch({ type: 'TICK' })
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(id)
  }, [heartbeat, state.isPaused])

  useEffect(() => {
    if (!userId) return
    if (state.phase === 'intro') return
    if (state.phase === 'complete') {
      clearActiveSession(userId)
      return
    }
    writeActiveSession(userId, toSessionSnapshot(state, Date.now()))
  }, [state, userId])

  const resumeRecovery = useCallback(() => {
    const snapshot = recovery
    if (!snapshot) return
    dispatch({ type: 'RESTORE', snapshot, now: Date.now() })
    setRecovery(null)
  }, [recovery])

  const discardRecovery = useCallback(() => {
    if (userId) clearActiveSession(userId)
    setRecovery(null)
    startedRef.current = true
    dispatch({ type: 'START', now: Date.now(), sessionId: createSessionId() })
  }, [userId])

  const completeSet = useCallback(() => dispatch({ type: 'COMPLETE_SET' }), [])
  const nextExercise = useCallback(() => dispatch({ type: 'NEXT_EXERCISE' }), [])
  const previousExercise = useCallback(() => dispatch({ type: 'PREVIOUS_EXERCISE' }), [])
  const pause = useCallback(() => dispatch({ type: 'PAUSE', now: Date.now() }), [])
  const resume = useCallback(() => dispatch({ type: 'RESUME', now: Date.now() }), [])
  const startExerciseTimer = useCallback(() => dispatch({ type: 'START_EXERCISE_TIMER' }), [])
  const pauseExerciseTimer = useCallback(() => dispatch({ type: 'PAUSE_EXERCISE_TIMER' }), [])
  const resetExerciseTimer = useCallback(() => dispatch({ type: 'RESET_EXERCISE_TIMER' }), [])
  const startRestTimer = useCallback(() => dispatch({ type: 'START_REST_TIMER' }), [])
  const pauseRestTimer = useCallback(() => dispatch({ type: 'PAUSE_REST_TIMER' }), [])
  const skipRest = useCallback(() => dispatch({ type: 'SKIP_REST' }), [])

  /** Finish the run, clear the snapshot and hand back the summary to store. */
  const finish = useCallback(() => {
    const result = sessionResult(stateRef.current, Date.now())
    dispatch({ type: 'FINISH', now: Date.now() })
    if (userId) clearActiveSession(userId)
    return result
  }, [userId])

  /** Leave the runner: forget the snapshot so no resume prompt lingers. */
  const exit = useCallback(() => {
    if (userId) clearActiveSession(userId)
  }, [userId])

  const progress = useMemo(
    () => ({
      totalSets: totalSets(state.plan),
      doneSets: completedSetCount(state.completedSets),
      totalExercises: state.plan.length,
    }),
    [state.plan, state.completedSets],
  )

  return {
    state,
    now,
    recovery,
    isStarted: state.phase !== 'intro',
    currentEntry: state.plan[state.currentExerciseIndex] ?? null,
    nextEntry: state.plan[state.currentExerciseIndex + 1] ?? null,
    elapsed: elapsedSeconds(state, now),
    progress,
    start,
    completeSet,
    nextExercise,
    previousExercise,
    pause,
    resume,
    startExerciseTimer,
    pauseExerciseTimer,
    resetExerciseTimer,
    startRestTimer,
    pauseRestTimer,
    skipRest,
    finish,
    exit,
    resumeRecovery,
    discardRecovery,
  }
}

export default useWorkoutSession
