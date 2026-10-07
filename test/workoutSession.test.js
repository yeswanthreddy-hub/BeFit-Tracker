import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { installBrowser, uninstallBrowser } from './helpers/browser.js'
import {
  clearActiveSession,
  completedExerciseCount,
  completedSetCount,
  createInitialState,
  createSessionId,
  elapsedSeconds,
  firstIncompleteSet,
  formatClock,
  formatDuration,
  idleTimer,
  isTimedEntry,
  isValidSnapshot,
  isExerciseComplete,
  readActiveSession,
  restoreState,
  sanitizeCompletedSets,
  sessionReducer,
  sessionResult,
  setTargetLabel,
  toSessionSnapshot,
  totalSets,
  writeActiveSession,
} from '../src/utils/workoutSession.js'

/** Two exercises: a counted push-up and a timed plank. */
const plan = [
  {
    exercise: { id: 'push-up', name: 'Push-Up', category: 'Chest', type: 'Strength' },
    sets: 2,
    reps: 10,
    restSeconds: 30,
    durationSeconds: 0,
  },
  {
    exercise: { id: 'plank', name: 'Plank', category: 'Core', type: 'Strength' },
    sets: 1,
    reps: 0,
    restSeconds: 0,
    durationSeconds: 30,
  },
]

const fresh = () => createInitialState(plan, { workoutId: 'w-1', userId: 'user-1' })

const start = () => sessionReducer(fresh(), { type: 'START', now: 1000, sessionId: 'session-1' })

const tickN = (state, count) => {
  let current = state
  for (let i = 0; i < count; i += 1) current = sessionReducer(current, { type: 'TICK' })
  return current
}

describe('session counters', () => {
  it('counts total sets, completed sets and completed exercises', () => {
    assert.equal(totalSets(plan), 3)
    assert.equal(completedSetCount({ 0: [0, 1], 1: [0] }), 3)
    assert.equal(completedExerciseCount(plan, { 0: [0] }), 0)
    assert.equal(completedExerciseCount(plan, { 0: [0, 1] }), 1)
  })

  it('detects a finished exercise once every set is done', () => {
    assert.equal(isExerciseComplete(plan, 0, { 0: [0] }), false)
    assert.equal(isExerciseComplete(plan, 0, { 0: [0, 1] }), true)
  })

  it('finds the next unfinished set, or the set count when all are done', () => {
    assert.equal(firstIncompleteSet(plan, 0, {}), 0)
    assert.equal(firstIncompleteSet(plan, 0, { 0: [0] }), 1)
    assert.equal(firstIncompleteSet(plan, 0, { 0: [0, 1] }), 2)
  })
})

describe('set labels and clock formatting', () => {
  it('labels counted and timed sets differently', () => {
    assert.equal(isTimedEntry(plan[1]), true)
    assert.equal(setTargetLabel(plan[0]), '10 reps')
    assert.equal(setTargetLabel(plan[1]), '30s hold')
  })

  it('formats mm:ss and rolls over to hours', () => {
    assert.equal(formatClock(0), '00:00')
    assert.equal(formatClock(65), '01:05')
    assert.equal(formatClock(3600), '1:00:00')
  })

  it('formats human durations', () => {
    assert.equal(formatDuration(45), '45s')
    assert.equal(formatDuration(600), '10 min')
    assert.equal(formatDuration(3900), '1h 5m')
  })
})

describe('idle timer and session id', () => {
  it('builds a timer that is not running', () => {
    assert.deepEqual(idleTimer(20), { duration: 20, remaining: 20, isRunning: false, started: false })
  })

  it('generates unique session ids', () => {
    const a = createSessionId(new Date(1000))
    const b = createSessionId(new Date(1000))
    assert.notEqual(a, b)
  })
})

describe('sessionReducer flow', () => {
  it('starts from the intro phase', () => {
    const state = fresh()
    assert.equal(state.phase, 'intro')
    assert.equal(state.sessionId, null)
  })

  it('start moves into the first set of work', () => {
    const state = start()
    assert.equal(state.phase, 'work')
    assert.equal(state.sessionId, 'session-1')
    assert.equal(state.currentExerciseIndex, 0)
    assert.equal(state.currentSetIndex, 0)
    assert.equal(state.runStartedAt, 1000)
  })

  it('ignores a second start', () => {
    const state = start()
    assert.equal(sessionReducer(state, { type: 'START', now: 5000, sessionId: 'nope' }), state)
  })

  it('completing a set enters rest until the exercise is finished', () => {
    const after = sessionReducer(start(), { type: 'COMPLETE_SET' })
    assert.deepEqual(after.completedSets, { 0: [0] })
    assert.equal(after.phase, 'rest')
    assert.equal(after.restTimer.remaining, 30)
    assert.equal(after.restTimer.isRunning, true)
    assert.equal(after.currentSetIndex, 1)
  })

  it('rest counts down and returns to work', () => {
    const resting = sessionReducer(start(), { type: 'COMPLETE_SET' })
    const after = tickN(resting, 29)
    assert.equal(after.phase, 'rest')
    assert.equal(after.restTimer.remaining, 1)

    const done = sessionReducer(after, { type: 'TICK' })
    assert.equal(done.phase, 'work')
    assert.equal(done.restTimer.remaining, 0)
  })

  it('the final set of an exercise skips rest and marks it complete', () => {
    let state = start()
    state = sessionReducer(state, { type: 'COMPLETE_SET' })
    state = tickN(state, 30)
    state = sessionReducer(state, { type: 'COMPLETE_SET' })
    assert.equal(state.phase, 'exerciseComplete')
    assert.equal(state.currentSetIndex, 2)
  })

  it('ignores a set that has already been recorded', () => {
    // A hand-edited or stale snapshot could point the marker at a recorded set;
    // the reducer must not count it twice.
    const state = { ...start(), currentSetIndex: 0, completedSets: { 0: [0] } }
    const after = sessionReducer(state, { type: 'COMPLETE_SET' })
    assert.deepEqual(after.completedSets, { 0: [0] })
  })

  it('a timed hold counts down and reports time up', () => {
    let state = start()
    state = sessionReducer(state, { type: 'COMPLETE_SET' })
    state = tickN(state, 30)
    state = sessionReducer(state, { type: 'COMPLETE_SET' })
    state = sessionReducer(state, { type: 'NEXT_EXERCISE' })

    assert.equal(state.phase, 'work')
    assert.equal(state.currentExerciseIndex, 1)
    assert.equal(state.exerciseTimer.duration, 30)

    state = sessionReducer(state, { type: 'START_EXERCISE_TIMER' })
    assert.equal(state.exerciseTimer.isRunning, true)

    state = tickN(state, 30)
    assert.equal(state.exerciseTimer.remaining, 0)
    assert.equal(state.timeUp, true)
  })

  it('can pause and reset a hold timer', () => {
    let state = sessionReducer(start(), { type: 'NEXT_EXERCISE' })
    state = sessionReducer(state, { type: 'START_EXERCISE_TIMER' })
    state = tickN(state, 5)
    state = sessionReducer(state, { type: 'PAUSE_EXERCISE_TIMER' })
    assert.equal(state.exerciseTimer.isRunning, false)
    state = tickN(state, 5)
    assert.equal(state.exerciseTimer.remaining, 25)
    state = sessionReducer(state, { type: 'RESET_EXERCISE_TIMER' })
    assert.equal(state.exerciseTimer.remaining, 30)
    assert.equal(state.timeUp, false)
  })

  it('previous and next move without losing completed sets', () => {
    let state = start()
    state = sessionReducer(state, { type: 'COMPLETE_SET' })
    state = tickN(state, 30)
    state = sessionReducer(state, { type: 'NEXT_EXERCISE' })
    assert.equal(state.currentExerciseIndex, 1)

    const back = sessionReducer(state, { type: 'PREVIOUS_EXERCISE' })
    assert.equal(back.currentExerciseIndex, 0)
    assert.equal(back.currentSetIndex, 1)
    assert.deepEqual(back.completedSets, { 0: [0] })
  })

  it('skip rest returns to work', () => {
    const resting = sessionReducer(start(), { type: 'COMPLETE_SET' })
    const after = sessionReducer(resting, { type: 'SKIP_REST' })
    assert.equal(after.phase, 'work')
    assert.equal(after.restTimer.remaining, 0)
  })

  it('pause freezes the workout clock and resume carries it forward', () => {
    const running = start()
    const paused = sessionReducer(running, { type: 'PAUSE', now: 61000 })
    assert.equal(paused.isPaused, true)
    assert.equal(elapsedSeconds(paused, 999999), 60)

    const resumed = sessionReducer(paused, { type: 'RESUME', now: 70000 })
    assert.equal(resumed.isPaused, false)
    assert.equal(Math.round(elapsedSeconds(resumed, 75000)), 65)
  })

  it('finish closes the session and stops the clock', () => {
    const finished = sessionReducer(start(), { type: 'FINISH', now: 130000 })
    assert.equal(finished.phase, 'complete')
    assert.equal(finished.runStartedAt, null)
    assert.equal(Math.round(elapsedSeconds(finished, 500000)), 129)
  })
})

describe('sessionResult', () => {
  it('summarises a finished run for storage', () => {
    const result = sessionResult(start(), 91000)
    assert.equal(result.durationSeconds, 90)
    assert.equal(result.exerciseCount, 2)
    assert.equal(result.totalSets, 3)
    assert.equal(result.completedSets, 0)
    assert.deepEqual(result.exerciseNames, ['Push-Up', 'Plank'])
  })
})

describe('snapshot and restore', () => {
  it('snapshots stay tied to the workout and account', () => {
    const state = sessionReducer(start(), { type: 'COMPLETE_SET' })
    const snapshot = toSessionSnapshot(state, 20000)
    assert.equal(isValidSnapshot(snapshot, 'w-1', 'user-1'), true)
    assert.equal(isValidSnapshot(snapshot, 'w-2', 'user-1'), false)
    assert.equal(isValidSnapshot(snapshot, 'w-1', 'user-2'), false)
    assert.equal(isValidSnapshot(null, 'w-1', 'user-1'), false)
  })

  it('sanitizes completed sets against the plan', () => {
    const clean = sanitizeCompletedSets({ 0: [0, 5, 0, 'x'], 1: [0], 9: [0] }, plan)
    assert.deepEqual(clean, { 0: [0], 1: [0] })
  })

  it('restores onto the first unfinished set', () => {
    const snapshot = {
      sessionId: 'session-9',
      workoutId: 'w-1',
      userId: 'user-1',
      currentExerciseIndex: 0,
      completedSets: { 0: [0] },
      elapsedSeconds: 120,
      startedAt: 1000,
    }
    const state = restoreState(snapshot, plan, 5000)
    assert.equal(state.phase, 'work')
    assert.equal(state.sessionId, 'session-9')
    assert.equal(state.currentSetIndex, 1)
    assert.equal(state.runStartedAt, 5000)
    assert.equal(state.elapsedBase, 120)
  })

  it('restores a fully completed exercise to the transition phase', () => {
    const snapshot = {
      sessionId: 'session-9',
      workoutId: 'w-1',
      userId: 'user-1',
      currentExerciseIndex: 0,
      completedSets: { 0: [0, 1] },
      elapsedSeconds: 60,
      startedAt: 1000,
    }
    const state = restoreState(snapshot, plan, 5000)
    assert.equal(state.phase, 'exerciseComplete')
  })
})

describe('stored active session', () => {
  it('writes, reads and clears a snapshot per account', () => {
    installBrowser()
    try {
      assert.equal(readActiveSession('user-1'), null)
      writeActiveSession('user-1', { sessionId: 's-1' })
      assert.deepEqual(readActiveSession('user-1'), { sessionId: 's-1' })
      assert.equal(readActiveSession('user-2'), null)

      clearActiveSession('user-1')
      assert.equal(readActiveSession('user-1'), null)
    } finally {
      uninstallBrowser()
    }
  })

  it('does nothing without an account id', () => {
    installBrowser()
    try {
      assert.equal(writeActiveSession('', { sessionId: 's-1' }), false)
      assert.equal(clearActiveSession(null), false)
      assert.equal(readActiveSession(undefined), null)
    } finally {
      uninstallBrowser()
    }
  })
})
