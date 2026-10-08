import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import DifficultyBadge from '../../components/exercises/DifficultyBadge'
import ExerciseVisual from '../../components/exercises/ExerciseVisual'
import WorkoutVisual from '../../components/workouts/WorkoutVisual'
import { useAuth } from '../../hooks/useAuth'
import { useWorkout } from '../../hooks/useWorkout'
import { useWorkoutHistory } from '../../hooks/useWorkoutHistory'
import { useWorkoutSession } from '../../hooks/useWorkoutSession'
import { resolveWorkoutExercises } from '../../utils/workouts'
import {
  formatClock,
  isTimedEntry,
  setTargetLabel,
} from '../../utils/workoutSession'
import './WorkoutSession.css'

/**
 * The guided session runner.
 *
 * Walks the athlete through one workout set by set: the current movement, a set
 * list, an optional hold timer, a between-set rest countdown, a pause overlay
 * with "End workout", and a confirmation before the session is recorded on the
 * completion screen.
 *
 * The screen never invents a session. Leaving with "End workout" clears the
 * in-progress snapshot and stores nothing; only pressing "Finish workout" on the
 * last exercise leads to a completed record. A refresh mid-session offers to
 * resume instead of silently throwing the work away.
 */
function WorkoutSession() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const workout = useWorkout(workoutId)
  const { user } = useAuth()
  const { saveCompleted } = useWorkoutHistory()

  const plan = useMemo(() => resolveWorkoutExercises(workout), [workout])

  const session = useWorkoutSession({
    plan,
    workoutId,
    userId: user?.id,
    autostart: Boolean(location.state?.autostart),
  })

  const [confirmExit, setConfirmExit] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [workoutId])

  if (!workout) {
    return (
      <div className="page session">
        <EmptyState
          title="Workout not found"
          note={`We could not find a workout called "${workoutId}".`}
          action={
            <Button to="/workouts" variant="secondary">
              Back to workout library
            </Button>
          }
        />
      </div>
    )
  }

  if (plan.length === 0) {
    return (
      <div className="page session">
        <EmptyState
          title="This workout has no exercises"
          note="Add some movements in the workout builder before starting a session."
          action={
            <Button to={`/workouts/${workout.id}`} variant="secondary">
              Back to workout
            </Button>
          }
        />
      </div>
    )
  }

  const { state, progress } = session
  const entry = session.currentEntry
  const exerciseIndex = state.currentExerciseIndex
  const setIndex = state.currentSetIndex
  const doneThisExercise = new Set(state.completedSets[exerciseIndex] ?? [])
  const isLastExercise = exerciseIndex >= plan.length - 1
  const exerciseProgressRatio =
    progress.totalSets > 0 ? progress.doneSets / progress.totalSets : 0

  const handleFinish = () => {
    const result = session.finish()
    const record = saveCompleted({ workout, result, sessionId: state.sessionId })
    navigate(`/workouts/${workout.id}/complete`, {
      state: { completedId: record?.id ?? null },
      replace: true,
    })
  }

  const handleExit = () => {
    session.exit()
    navigate('/workouts')
  }

  const pauseOverlay =
    session.isStarted && state.phase !== 'complete' && state.isPaused

  return (
    <div className="page session">
      <header className="session__bar">
        <Link to="/workouts" className="session__brand" aria-label="Back to workouts">
          <WorkoutVisual category={workout.category} size="card" />
          <span className="session__brand-text">
            <span className="session__brand-name">{workout.name}</span>
            <span className="session__brand-sub">
              {session.isStarted
                ? `Workout time ${formatClock(session.elapsed)}`
                : `${plan.length} exercises · ${workout.durationMinutes} min`}
            </span>
          </span>
        </Link>

        {session.isStarted && state.phase !== 'complete' && (
          <div className="session__bar-actions">
            <Button variant="secondary" size="sm" onClick={session.pause} disabled={state.isPaused}>
              Pause
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmExit(true)}>
              End workout
            </Button>
          </div>
        )}
      </header>

      {state.phase === 'intro' && (
        <SessionIntro
          workout={workout}
          plan={plan}
          recovery={session.recovery}
          onStart={session.start}
          onResume={session.resumeRecovery}
          onRestart={session.discardRecovery}
        />
      )}

      {state.phase === 'complete' && (
        <section className="session__stage card">
          <h1 className="session__complete-title">Workout finished</h1>
          <p className="session__muted">Saving your results…</p>
          <Button to="/completed" variant="primary">
            View workout history
          </Button>
        </section>
      )}

      {session.isStarted && state.phase !== 'complete' && (
        <>
          <div className="session__progress" aria-hidden="true">
            <span
              className="session__progress-fill"
              style={{ width: `${Math.round(exerciseProgressRatio * 100)}%` }}
            />
          </div>
          <p className="session__progress-label">
            Exercise {exerciseIndex + 1} of {plan.length}
            <span className="session__dot" aria-hidden="true">
              ·
            </span>
            {progress.doneSets} / {progress.totalSets} sets done
          </p>

          {(state.phase === 'work' || state.phase === 'rest') && entry && (
            <div className="session__stage">
              <article className="session__exercise">
                <div className="session__visual">
                  <ExerciseVisual
                    category={entry.exercise.category}
                    size="detail"
                    decorative={false}
                  />
                </div>

                <div className="session__exercise-body">
                  <p className="session__eyebrow">
                    {entry.exercise.category} · {entry.exercise.type}
                  </p>
                  <h1 className="session__title">{entry.exercise.name}</h1>
                  <div className="session__badges">
                    <DifficultyBadge difficulty={entry.exercise.difficulty} />
                    <span className="chip chip--muted">{entry.exercise.equipment}</span>
                    <span className="chip chip--muted">{setTargetLabel(entry)}</span>
                  </div>
                  <p className="session__description">{entry.exercise.description}</p>
                </div>
              </article>

              <aside className="session__panel card">
                {state.phase === 'rest' ? (
                  <RestPanel
                    state={state}
                    entry={entry}
                    setIndex={setIndex}
                    onPause={session.pauseRestTimer}
                    onResume={session.startRestTimer}
                    onSkip={session.skipRest}
                  />
                ) : (
                  <WorkPanel
                    state={state}
                    entry={entry}
                    setIndex={setIndex}
                    doneSets={doneThisExercise}
                    isFirstExercise={exerciseIndex === 0}
                    onComplete={session.completeSet}
                    onPrevious={session.previousExercise}
                    onStartTimer={session.startExerciseTimer}
                    onPauseTimer={session.pauseExerciseTimer}
                    onResetTimer={session.resetExerciseTimer}
                  />
                )}
              </aside>
            </div>
          )}

          {state.phase === 'exerciseComplete' && entry && (
            <ExerciseCompletePanel
              entry={entry}
              nextEntry={session.nextEntry}
              isLastExercise={isLastExercise}
              isFirstExercise={exerciseIndex === 0}
              onNext={session.nextExercise}
              onPrevious={session.previousExercise}
              onFinish={handleFinish}
            />
          )}
        </>
      )}

      {pauseOverlay && (
        <div className="session__overlay" role="dialog" aria-modal="true" aria-label="Workout paused">
          <div className="session__overlay-card card">
            <p className="session__eyebrow">Paused</p>
            <h2 className="session__overlay-title">Session paused</h2>
            <p className="session__muted">
              Your workout time is stopped while you are paused.
            </p>
            <div className="session__overlay-actions">
              <Button variant="primary" size="lg" onClick={session.resume}>
                Resume workout
              </Button>
              <Button variant="ghost" onClick={() => setConfirmExit(true)}>
                End workout
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmExit}
        title="End this workout?"
        description="Nothing from this session will be saved to your history. Your workout plan stays exactly as it is."
        confirmLabel="End workout"
        cancelLabel="Keep training"
        onCancel={() => setConfirmExit(false)}
        onConfirm={handleExit}
      />
    </div>
  )
}

/** Pre-session screen, with a resume offer when a snapshot was recovered. */
function SessionIntro({ workout, plan, recovery, onStart, onResume, onRestart }) {
  if (recovery) {
    return (
      <section className="session__stage card session__recovery">
        <p className="session__eyebrow">Workout in progress</p>
        <h1 className="session__title">Resume your session?</h1>
        <p className="session__description">
          You left a workout part-way through. {workout.name} has{' '}
          {Object.values(recovery.completedSets ?? {}).reduce(
            (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
            0,
          )}{' '}
          sets recorded so far.
        </p>
        <div className="session__overlay-actions">
          <Button variant="primary" size="lg" onClick={onResume}>
            Resume workout
          </Button>
          <Button variant="secondary" size="lg" onClick={onRestart}>
            Start again
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="session__stage session__intro card">
      <WorkoutVisual category={workout.category} size="detail" decorative={false} />
      <p className="session__eyebrow">Ready to train</p>
      <h1 className="session__title">{workout.name}</h1>
      <p className="session__description">{workout.description}</p>
      <div className="session__badges">
        <DifficultyBadge difficulty={workout.difficulty} />
        <span className="chip chip--muted">{plan.length} exercises</span>
        <span className="chip chip--muted">about {workout.durationMinutes} min</span>
      </div>
      <div className="session__overlay-actions">
        <Button variant="primary" size="lg" onClick={onStart}>
          Start workout
        </Button>
        <Button to={`/workouts/${workout.id}`} variant="ghost">
          Back to details
        </Button>
      </div>
    </section>
  )
}

/** Set list plus the primary "set complete" action and timer controls. */
function WorkPanel({
  state,
  entry,
  setIndex,
  doneSets,
  isFirstExercise,
  onComplete,
  onPrevious,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
}) {
  const timed = isTimedEntry(entry)
  const total = Math.max(1, Number(entry.sets) || 1)

  return (
    <div className="session__work">
      <div className="session__panel-head">
        <p className="session__panel-label">
          Set {Math.min(setIndex + 1, total)} of {total}
        </p>
        <p className="session__panel-target">Target: {setTargetLabel(entry)}</p>
      </div>

      <ol className="session__sets">
        {Array.from({ length: total }, (_value, index) => {
          const isDone = doneSets.has(index)
          const isCurrent = index === setIndex && !isDone
          const status = isDone ? 'done' : isCurrent ? 'current' : 'upcoming'
          return (
            <li key={index} className={`session__set session__set--${status}`}>
              <span className="session__set-index">Set {index + 1}</span>
              <span className="session__set-target">{setTargetLabel(entry)}</span>
              <span className="session__set-status">
                {isDone ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
              </span>
            </li>
          )
        })}
      </ol>

      {timed && (
        <div className="session__timer">
          <p className="session__timer-value" role="timer" aria-live="off">
            {formatClock(state.exerciseTimer.remaining)}
          </p>
          {state.timeUp ? (
            <p className="session__timer-note session__timer-note--done">Time complete</p>
          ) : (
            <p className="session__timer-note">
              {state.exerciseTimer.isRunning ? 'Hold timer running' : 'Start the hold timer when ready'}
            </p>
          )}
          <div className="session__timer-actions">
            {state.exerciseTimer.isRunning ? (
              <Button variant="secondary" size="sm" onClick={onPauseTimer}>
                Pause timer
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={onStartTimer}
                disabled={state.timeUp}
              >
                {state.exerciseTimer.started ? 'Resume timer' : 'Start timer'}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onResetTimer}>
              Reset timer
            </Button>
          </div>
        </div>
      )}

      <div className="session__controls">
        <Button variant="primary" size="lg" onClick={onComplete}>
          {state.phase === 'work' && setIndex >= total - 1 ? 'Complete final set' : 'Set complete'}
        </Button>
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={isFirstExercise}
        >
          Previous exercise
        </Button>
      </div>
    </div>
  )
}

/** Countdown between sets, with pause and skip. */
function RestPanel({ state, entry, setIndex, onPause, onResume, onSkip }) {
  const total = Math.max(1, Number(entry.sets) || 1)
  const nextSet = Math.min(setIndex + 1, total)

  return (
    <div className="session__rest">
      <p className="session__panel-label">Rest</p>
      <p className="session__rest-time" role="timer" aria-live="off">
        {formatClock(state.restTimer.remaining)}
      </p>
      <p className="session__rest-next">
        Next: Set {nextSet} of {total} · {setTargetLabel(entry)}
      </p>
      <div className="session__controls">
        {state.restTimer.isRunning ? (
          <Button variant="secondary" onClick={onPause}>
            Pause rest
          </Button>
        ) : (
          <Button variant="secondary" onClick={onResume}>
            Resume rest
          </Button>
        )}
        <Button variant="primary" onClick={onSkip}>
          Skip rest
        </Button>
      </div>
    </div>
  )
}

/** Transition between exercises, or the jump to finishing the workout. */
function ExerciseCompletePanel({
  entry,
  nextEntry,
  isLastExercise,
  isFirstExercise,
  onNext,
  onPrevious,
  onFinish,
}) {
  return (
    <section className="session__stage card session__exercise-complete">
      <p className="session__eyebrow">Exercise complete</p>
      <h1 className="session__title">{entry.exercise.name} done</h1>

      {nextEntry ? (
        <>
          <p className="session__muted">Coming up next</p>
          <p className="session__next-name">{nextEntry.exercise.name}</p>
          <p className="session__description">
            {nextEntry.exercise.category} · {setTargetLabel(nextEntry)}
          </p>
        </>
      ) : (
        <p className="session__description">
          That was the last movement in this workout. Finish to save your results.
        </p>
      )}

      <div className="session__overlay-actions">
        {isLastExercise ? (
          <Button variant="primary" size="lg" onClick={onFinish}>
            Finish workout
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={onNext}>
            Next exercise
          </Button>
        )}
        <Button variant="ghost" onClick={onPrevious} disabled={isFirstExercise}>
          Previous exercise
        </Button>
      </div>
    </section>
  )
}

export default WorkoutSession
