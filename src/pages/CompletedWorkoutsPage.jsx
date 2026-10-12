import { useMemo, useState } from 'react'

import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import SectionHeader from '../components/ui/SectionHeader'
import DifficultyBadge from '../components/exercises/DifficultyBadge'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { formatDuration } from '../utils/workoutSession'
import { recordDate } from '../utils/dashboard'
import './CompletedWorkoutsPage.css'

/** "Today" / "Yesterday" / "Mon 12 Oct 2026" for a completion date. */
function relativeDay(date) {
  if (!date) return 'Unknown date'
  const today = new Date()
  const dayKey = (value) => value.toDateString()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dayKey(date) === dayKey(today)) return 'Today'
  if (dayKey(date) === dayKey(yesterday)) return 'Yesterday'

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatTime(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date)
}

/**
 * Completed workout history.
 *
 * One card per finished session, newest first, built entirely from the stored
 * completed records the dashboard and streak card already read. The session's
 * duration, set and exercise counts come straight from the record, so this page
 * cannot disagree with the rest of the app. Details expand in place rather than
 * on a separate route, which keeps the history a single, scannable list.
 */
function CompletedWorkoutsPage() {
  const { records } = useWorkoutHistory()
  const [expandedId, setExpandedId] = useState(null)

  const cards = useMemo(
    () =>
      records.map((record) => ({
        record,
        date: recordDate(record),
      })),
    [records],
  )

  if (cards.length === 0) {
    return (
      <div className="page completed">
        <SectionHeader
          eyebrow="Your training"
          title="Completed workouts"
          sub="Every finished session lands here, and feeds your streak and dashboard totals."
        />
        <EmptyState
          title="No completed workouts yet"
          note="Finish a workout session and it will appear here with its duration, sets and exercises."
          action={
            <Button to="/workouts" variant="primary">
              Browse workouts
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="page completed">
      <SectionHeader
        eyebrow="Your training"
        title="Completed workouts"
        sub={`${cards.length} ${cards.length === 1 ? 'session' : 'sessions'} saved on this device.`}
      />

      <ol className="completed__list">
        {cards.map(({ record, date }) => {
          const isOpen = expandedId === record.id
          const sets =
            record.totalSets > 0
              ? `${record.completedSets} / ${record.totalSets} sets`
              : `${record.completedSets} sets`

          return (
            <li key={record.id} className="completed__item card">
              <div className="completed__head">
                <div className="completed__heading">
                  <p className="completed__when">
                    {relativeDay(date)}
                    {date && <span className="completed__time"> · {formatTime(date)}</span>}
                  </p>
                  <h2 className="completed__name">{record.workoutName || 'Workout'}</h2>
                </div>
                {record.difficulty && <DifficultyBadge difficulty={record.difficulty} />}
              </div>

              <ul className="completed__meta">
                <li className="chip chip--muted">
                  {formatDuration(record.durationSeconds || record.durationMinutes * 60)}
                </li>
                <li className="chip chip--muted">
                  {record.completedExercises} / {record.exerciseCount} exercises
                </li>
                <li className="chip chip--muted">{sets}</li>
                {record.goal && <li className="chip chip--muted">{record.goal}</li>}
              </ul>

              {record.exercises?.length > 0 && (
                <>
                  <button
                    type="button"
                    className="completed__toggle"
                    aria-expanded={isOpen}
                    onClick={() => setExpandedId(isOpen ? null : record.id)}
                  >
                    {isOpen ? 'Hide exercises' : 'Show exercises'}
                    <span aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
                  </button>

                  {isOpen && (
                    <ol className="completed__exercises">
                      {record.exercises.map((exerciseName, index) => (
                        <li key={`${index}-${exerciseName}`} className="completed__exercise">
                          <span className="completed__exercise-index" aria-hidden="true">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {exerciseName}
                        </li>
                      ))}
                    </ol>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default CompletedWorkoutsPage
