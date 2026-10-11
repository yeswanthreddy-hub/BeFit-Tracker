import { useEffect, useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { useWorkoutHistory } from '../../hooks/useWorkoutHistory'
import { useWorkout } from '../../hooks/useWorkout'
import { formatDuration } from '../../utils/workoutSession'
import './WorkoutComplete.css'

/** "1 Oct 2026, 18:30" for a stored completion. */
function formatCompletedAt(isoDate) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function Stat({ label, value }) {
  return (
    <div className="complete__stat">
      <dt className="complete__stat-label">{label}</dt>
      <dd className="complete__stat-value">{value}</dd>
    </div>
  )
}

/**
 * Post-session summary.
 *
 * Reads the record that the runner just wrote or, after a refresh, the newest
 * record for this workout — it never creates one, so revisiting the page cannot
 * double-count a session. The dashboard and streak card pick the same record up
 * from history, so this page only has to present it.
 */
function WorkoutComplete() {
  const { workoutId } = useParams()
  const location = useLocation()
  const workout = useWorkout(workoutId)
  const { byId, newestFirst } = useWorkoutHistory()

  const completedId = location.state?.completedId ?? null

  const record = useMemo(() => {
    if (completedId) {
      const found = byId(completedId)
      if (found) return found
    }
    return newestFirst.find((item) => item.workoutId === workoutId) ?? null
  }, [completedId, byId, newestFirst, workoutId])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  if (!record) {
    return (
      <div className="page complete">
        <EmptyState
          title="No completed session found"
          note="We could not find a saved session for this workout. Finish a workout to see your summary here."
          action={
            <Button to="/workouts" variant="secondary">
              Back to workout library
            </Button>
          }
        />
      </div>
    )
  }

  const name = record.workoutName || workout?.name || 'Workout'
  const setsLabel =
    record.totalSets > 0 ? `${record.completedSets} of ${record.totalSets}` : `${record.completedSets}`

  return (
    <div className="page complete">
      <section className="complete__hero card">
        <span className="complete__check" aria-hidden="true">
          <svg viewBox="0 0 52 52" focusable="false">
            <circle className="complete__check-ring" cx="26" cy="26" r="23" />
            <path className="complete__check-mark" d="M15 27l7 7 15-16" />
          </svg>
        </span>

        <p className="complete__eyebrow">Workout complete</p>
        <h1 className="complete__title">{name}</h1>
        <p className="complete__message">
          Nice work. This session is saved to your history and counts toward your streak.
        </p>

        <dl className="complete__stats">
          <Stat label="Duration" value={formatDuration(record.durationSeconds || record.durationMinutes * 60)} />
          <Stat label="Exercises" value={`${record.completedExercises} / ${record.exerciseCount}`} />
          <Stat label="Sets" value={setsLabel} />
          <Stat label="Finished" value={formatCompletedAt(record.completedAt || record.date)} />
        </dl>

        <div className="complete__actions">
          <Button to="/dashboard" variant="primary" size="lg">
            Back to dashboard
          </Button>
          <Button to="/completed" variant="secondary" size="lg">
            View workout history
          </Button>
          <Link to={`/workouts/${workoutId}/start`} className="complete__again">
            Do this workout again
          </Link>
        </div>
      </section>

      {record.exercises?.length > 0 && (
        <section className="complete__exercises" aria-label="Exercises in this session">
          <h2 className="complete__exercises-title">What you trained</h2>
          <ul className="complete__exercises-list">
            {record.exercises.map((exerciseName, index) => (
              <li key={`${index}-${exerciseName}`} className="chip">
                {exerciseName}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default WorkoutComplete
