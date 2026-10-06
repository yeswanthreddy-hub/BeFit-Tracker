import { getItem, setItem, removeItem } from './storage'
import { STORAGE_KEYS, userDataKey } from './storageKeys'

/**
 * The guided workout session, as a pure state machine.
 *
 * A session walks through a resolved workout plan set by set. Everything the
 * runner needs to render lives in one plain object and every transition is a
 * pure `sessionReducer(state, action)` call, so the timing rules can be unit
 * tested without React, a browser or a clock.
 *
 * Phases:
 *  - `intro`             the athlete has not started yet
 *  - `work`              performing the current set
 *  - `rest`              counting down between sets
 *  - `exerciseComplete`  every set of the current exercise is done
 *  - `complete`          the whole session is finished
 *
 * Time handling: the workout clock is derived from real timestamps
 * (`elapsedBase` + now - `runStartedAt`) so it stays honest across an inactive
 * tab, while the exercise and rest countdowns tick down one second at a time
 * from the interval the hook drives.
 *
 * Nothing here writes storage during a session except the small helpers at the
 * bottom, which the hook uses to survive a refresh.
 */

/** A brand-new session id, used to guard against recording the same run twice. */
export function createSessionId(now = new Date()) {
  return `session-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`
}

/** A countdown that is not running yet. */
export function idleTimer(duration = 0) {
  const value = Math.max(0, Math.round(Number(duration) || 0))
  return { duration: value, remaining: value, isRunning: false, started: false }
}

/** Blank session for a resolved plan. */
export function createInitialState(plan = [], meta = {}) {
  return {
    phase: 'intro',
    plan,
    workoutId: meta.workoutId ?? null,
    userId: meta.userId ?? null,
    sessionId: null,
    startedAt: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    completedSets: {},
    isPaused: false,
    elapsedBase: 0,
    runStartedAt: null,
    exerciseTimer: idleTimer(),
    restTimer: idleTimer(),
    timeUp: false,
  }
}

/* ------------------------------- counting ------------------------------- */

/** Total working sets across a plan. */
export function totalSets(plan = []) {
  return plan.reduce((sum, entry) => sum + Math.max(0, Number(entry?.sets) || 0), 0)
}

/** How many sets have been completed. */
export function completedSetCount(completedSets = {}) {
  return Object.values(completedSets).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0,
  )
}

/** Whether every set of one exercise is done. */
export function isExerciseComplete(plan, exerciseIndex, completedSets = {}) {
  const entry = plan[exerciseIndex]
  if (!entry) return false
  const done = completedSets[exerciseIndex]?.length ?? 0
  return done >= Math.max(1, Number(entry.sets) || 1)
}

/** How many whole exercises are finished. */
export function completedExerciseCount(plan = [], completedSets = {}) {
  return plan.reduce(
    (sum, _entry, index) => sum + (isExerciseComplete(plan, index, completedSets) ? 1 : 0),
    0,
  )
}

/** The next unfinished set of an exercise, or its set count when all are done. */
export function firstIncompleteSet(plan, exerciseIndex, completedSets = {}) {
  const entry = plan[exerciseIndex]
  if (!entry) return 0
  const total = Math.max(1, Number(entry.sets) || 1)
  const done = new Set(Array.isArray(completedSets[exerciseIndex]) ? completedSets[exerciseIndex] : [])
  for (let index = 0; index < total; index += 1) {
    if (!done.has(index)) return index
  }
  return total
}

/** True when a plan entry is a timed hold rather than counted reps. */
export function isTimedEntry(entry) {
  return Math.max(0, Number(entry?.durationSeconds) || 0) > 0
}

/** One line describing the current set's target. */
export function setTargetLabel(entry) {
  if (isTimedEntry(entry)) return `${Math.round(entry.durationSeconds)}s hold`
  const reps = Math.max(0, Number(entry?.reps) || 0)
  return `${reps} reps`
}

/* -------------------------------- clock -------------------------------- */

/** Seconds the workout has been running, including time before a pause. */
export function elapsedSeconds(state, now = Date.now()) {
  const base = Math.max(0, Number(state?.elapsedBase) || 0)
  const running = state?.runStartedAt ? Math.max(0, (now - state.runStartedAt) / 1000) : 0
  return base + running
}

/** `mm:ss` (or `h:mm:ss` past an hour) for a whole number of seconds. */
export function formatClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  const hrs = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const mm = String(mins).padStart(2, '0')
  const ss = String(secs).padStart(2, '0')
  return hrs > 0 ? `${hrs}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Short human duration for summaries: "45s", "12 min", "1h 5m". */
export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0))
  if (total < 60) return `${total}s`
  const mins = Math.round(total / 60)
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rest = mins % 60
  return rest > 0 ? `${hrs}h ${rest}m` : `${hrs}h`
}

/** The summary of a finished run, ready to be stored as a completed record. */
export function sessionResult(state, now = Date.now()) {
  const plan = Array.isArray(state?.plan) ? state.plan : []
  return {
    durationSeconds: Math.round(elapsedSeconds(state, now)),
    exerciseCount: plan.length,
    completedExercises: completedExerciseCount(plan, state?.completedSets),
    completedSets: completedSetCount(state?.completedSets),
    totalSets: totalSets(plan),
    exerciseNames: plan.map((entry) => entry?.exercise?.name).filter(Boolean),
  }
}

/* ------------------------------- reducer ------------------------------- */

function clampIndex(value, max) {
  const index = Math.round(Number(value) || 0)
  return Math.min(Math.max(index, 0), Math.max(0, max))
}

function workTimer(plan, exerciseIndex) {
  return idleTimer(plan[exerciseIndex]?.durationSeconds)
}

/**
 * Move the marker to an exercise, landing on its first unfinished set.
 *
 * Used by both "next" and "previous", so stepping back and forth never loses
 * which sets are already done.
 */
function moveToExercise(state, targetIndex) {
  const plan = state.plan
  if (plan.length === 0) return state

  const index = clampIndex(targetIndex, plan.length - 1)
  const setIndex = firstIncompleteSet(plan, index, state.completedSets)
  const done = setIndex >= Math.max(1, Number(plan[index]?.sets) || 1)

  return {
    ...state,
    currentExerciseIndex: index,
    currentSetIndex: setIndex,
    phase: done ? 'exerciseComplete' : 'work',
    exerciseTimer: done ? idleTimer(0) : workTimer(plan, index),
    restTimer: idleTimer(0),
    timeUp: false,
  }
}

function recordSet(state, exerciseIndex, setIndex) {
  const existing = Array.isArray(state.completedSets[exerciseIndex])
    ? state.completedSets[exerciseIndex]
    : []
  if (existing.includes(setIndex)) return state.completedSets
  return { ...state.completedSets, [exerciseIndex]: [...existing, setIndex].sort((a, b) => a - b) }
}

/**
 * One transition of the session.
 *
 * Every timer field is replaced with a fresh object when it changes so React
 * sees new state, and untouched state is returned by identity otherwise.
 */
export function sessionReducer(state, action = {}) {
  switch (action.type) {
    case 'START': {
      if (state.phase !== 'intro') return state
      const now = action.now ?? Date.now()
      return {
        ...createInitialState(state.plan, { workoutId: state.workoutId, userId: state.userId }),
        phase: 'work',
        sessionId: action.sessionId ?? state.sessionId ?? createSessionId(new Date(now)),
        startedAt: now,
        runStartedAt: now,
        exerciseTimer: workTimer(state.plan, 0),
      }
    }

    case 'RESTORE': {
      if (state.phase !== 'intro' || state.sessionId) return state
      return restoreState(action.snapshot, state.plan, action.now ?? Date.now())
    }

    case 'SET_PLAN': {
      if (state.phase !== 'intro' || !Array.isArray(action.plan)) return state
      if (action.plan === state.plan) return state
      return { ...state, plan: action.plan }
    }

    case 'COMPLETE_SET': {
      if (state.phase !== 'work') return state
      const exerciseIndex = state.currentExerciseIndex
      const setIndex = state.currentSetIndex
      if (action.setIndex !== undefined && action.setIndex !== setIndex) return state

      const entry = state.plan[exerciseIndex]
      if (!entry) return state
      if (setIndex >= Math.max(1, Number(entry.sets) || 1)) return state

      const completedSets = recordSet(state, exerciseIndex, setIndex)
      const setsDone = completedSets[exerciseIndex].length
      const exerciseDone = setsDone >= Math.max(1, Number(entry.sets) || 1)
      const restSeconds = Math.max(0, Number(entry.restSeconds) || 0)

      let phase = 'exerciseComplete'
      let exerciseTimer = idleTimer(0)
      let restTimer = idleTimer(0)

      if (!exerciseDone && restSeconds > 0) {
        phase = 'rest'
        restTimer = { ...idleTimer(restSeconds), isRunning: true, started: true }
      } else if (!exerciseDone) {
        phase = 'work'
        exerciseTimer = workTimer(state.plan, exerciseIndex)
      }

      return {
        ...state,
        completedSets,
        currentSetIndex: setsDone,
        phase,
        exerciseTimer,
        restTimer,
        timeUp: false,
      }
    }

    case 'NEXT_EXERCISE':
      return moveToExercise(state, state.currentExerciseIndex + 1)

    case 'PREVIOUS_EXERCISE':
      return moveToExercise(state, state.currentExerciseIndex - 1)

    case 'TICK': {
      let { exerciseTimer, restTimer, phase, timeUp } = state

      if (exerciseTimer.isRunning && exerciseTimer.remaining > 0) {
        const remaining = exerciseTimer.remaining - 1
        exerciseTimer = { ...exerciseTimer, remaining, isRunning: remaining > 0 }
        if (remaining === 0) timeUp = true
      }

      if (restTimer.isRunning && restTimer.remaining > 0) {
        const remaining = restTimer.remaining - 1
        if (remaining === 0) {
          restTimer = idleTimer(0)
          phase = 'work'
        } else {
          restTimer = { ...restTimer, remaining }
        }
      }

      if (
        exerciseTimer === state.exerciseTimer &&
        restTimer === state.restTimer &&
        phase === state.phase &&
        timeUp === state.timeUp
      ) {
        return state
      }

      return { ...state, exerciseTimer, restTimer, phase, timeUp }
    }

    case 'START_EXERCISE_TIMER':
      if (state.exerciseTimer.duration <= 0) return state
      return {
        ...state,
        timeUp: false,
        exerciseTimer: { ...state.exerciseTimer, isRunning: true, started: true },
      }

    case 'PAUSE_EXERCISE_TIMER':
      return state.exerciseTimer.isRunning
        ? { ...state, exerciseTimer: { ...state.exerciseTimer, isRunning: false } }
        : state

    case 'RESET_EXERCISE_TIMER':
      return {
        ...state,
        timeUp: false,
        exerciseTimer: {
          ...state.exerciseTimer,
          remaining: state.exerciseTimer.duration,
          isRunning: false,
          started: false,
        },
      }

    case 'START_REST_TIMER':
      if (state.restTimer.duration <= 0 || state.restTimer.isRunning) return state
      return {
        ...state,
        restTimer: { ...state.restTimer, isRunning: true, started: true },
      }

    case 'PAUSE_REST_TIMER':
      return state.restTimer.isRunning
        ? { ...state, restTimer: { ...state.restTimer, isRunning: false } }
        : state

    case 'SKIP_REST':
      if (state.phase !== 'rest') return state
      return { ...state, phase: 'work', restTimer: idleTimer(0), timeUp: false }

    case 'PAUSE':
      if (state.isPaused || state.phase === 'intro' || state.phase === 'complete') return state
      return {
        ...state,
        isPaused: true,
        elapsedBase: elapsedSeconds(state, action.now ?? Date.now()),
        runStartedAt: null,
        exerciseTimer: { ...state.exerciseTimer, isRunning: false },
        restTimer: { ...state.restTimer, isRunning: false },
      }

    case 'RESUME':
      if (!state.isPaused) return state
      return { ...state, isPaused: false, runStartedAt: action.now ?? Date.now() }

    case 'FINISH': {
      if (state.phase === 'complete') return state
      const elapsed = elapsedSeconds(state, action.now ?? Date.now())
      return {
        ...state,
        phase: 'complete',
        isPaused: true,
        elapsedBase: elapsed,
        runStartedAt: null,
        exerciseTimer: idleTimer(0),
        restTimer: idleTimer(0),
      }
    }

    default:
      return state
  }
}

/* ------------------------- refresh-survival helpers ------------------------- */

/** The minimum needed to rebuild a session after a page reload. */
export function toSessionSnapshot(state, now = Date.now()) {
  return {
    sessionId: state.sessionId,
    workoutId: state.workoutId,
    userId: state.userId,
    // A reload always lands on the set being worked rather than mid-rest, which
    // keeps the resume simple: the athlete re-does the rest if they need it.
    currentExerciseIndex: state.currentExerciseIndex,
    completedSets: state.completedSets,
    elapsedSeconds: Math.round(elapsedSeconds(state, now)),
    startedAt: state.startedAt,
    updatedAt: now,
  }
}

/** Keep only whole, in-range set numbers, so a hand-edited payload cannot lie. */
export function sanitizeCompletedSets(value, plan = []) {
  const clean = {}
  if (!value || typeof value !== 'object' || Array.isArray(value)) return clean

  plan.forEach((entry, index) => {
    const total = Math.max(1, Number(entry?.sets) || 1)
    const list = value[index]
    if (!Array.isArray(list)) return

    const sets = [...new Set(list)]
      .filter((item) => Number.isInteger(item) && item >= 0 && item < total)
      .sort((a, b) => a - b)

    if (sets.length > 0) clean[index] = sets
  })

  return clean
}

/** Whether a snapshot belongs to the workout and account being opened. */
export function isValidSnapshot(snapshot, workoutId, userId) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return false
  if (typeof snapshot.sessionId !== 'string' || snapshot.sessionId === '') return false
  if (snapshot.workoutId !== workoutId) return false
  if (userId && snapshot.userId !== userId) return false
  return true
}

/**
 * Rebuild a live session from a snapshot.
 *
 * Completed sets are re-checked against the plan and the marker is placed on the
 * first unfinished set, so a resumed session always lands somewhere sensible
 * even if the plan changed while the athlete was away.
 */
export function restoreState(snapshot, plan = [], now = Date.now()) {
  const base = createInitialState(plan, { workoutId: snapshot?.workoutId, userId: snapshot?.userId })
  const completedSets = sanitizeCompletedSets(snapshot?.completedSets, plan)
  const index = clampIndex(snapshot?.currentExerciseIndex, plan.length - 1)
  const setIndex = firstIncompleteSet(plan, index, completedSets)
  const done = plan.length === 0 || setIndex >= Math.max(1, Number(plan[index]?.sets) || 1)

  return {
    ...base,
    phase: done ? 'exerciseComplete' : 'work',
    sessionId: snapshot?.sessionId ?? null,
    startedAt: Number(snapshot?.startedAt) || now,
    runStartedAt: now,
    elapsedBase: Math.max(0, Number(snapshot?.elapsedSeconds) || 0),
    currentExerciseIndex: index,
    currentSetIndex: setIndex,
    completedSets,
    exerciseTimer: done ? idleTimer(0) : workTimer(plan, index),
    timeUp: false,
  }
}

/* --------------------------- stored active session --------------------------- */

/** Read the in-progress session snapshot for an account, if there is one. */
export function readActiveSession(userId) {
  if (!userId) return null
  return getItem(userDataKey(STORAGE_KEYS.activeSession, userId))
}

/** Persist an in-progress snapshot so a refresh can offer to resume. */
export function writeActiveSession(userId, snapshot) {
  if (!userId) return false
  return setItem(userDataKey(STORAGE_KEYS.activeSession, userId), snapshot)
}

/** Forget the in-progress snapshot (finished, discarded or exited). */
export function clearActiveSession(userId) {
  if (!userId) return false
  return removeItem(userDataKey(STORAGE_KEYS.activeSession, userId))
}
