import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import SectionHeader from '../../components/ui/SectionHeader'
import DifficultyBadge from '../../components/exercises/DifficultyBadge'
import WorkoutVisual from '../../components/workouts/WorkoutVisual'
import WorkoutExerciseList from '../../components/workouts/WorkoutExerciseList'
import { useWorkout } from '../../hooks/useWorkout'
import { isCustomWorkout } from '../../utils/customWorkouts'
import './WorkoutPrepare.css'

/**
 * Preparation stage for one workout: "are you ready, and what are you about to do?"
 *
 * This is deliberately the *last* screen before the session runner. It shows
 * the plan exactly as the athlete will meet it, for a built-in template or a
 * workout they saved themselves, and the Begin button starts the guided session
 * that records real sets, rest and a completion summary.
 *
 * Nothing here marks a workout as completed or records a set: that only happens
 * inside the session runner. Preparing is free.
 */
function WorkoutPrepare() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const workout = useWorkout(workoutId)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [workoutId])

  if (!workout) {
    return (
      <div className="page workout-prepare">
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

  const handleBegin = () => {
    navigate(`/workouts/${workout.id}/session`, { state: { autostart: true } })
  }

  return (
    <div className="page workout-prepare">
      <Link to={`/workouts/${workout.id}`} className="workout-detail__back">
        <span aria-hidden="true">←</span> Back to workout
      </Link>

      <header className="workout-prepare__hero">
        <div className="workout-prepare__panel">
          <WorkoutVisual category={workout.category} size="detail" />
          <p className="workout-prepare__eyebrow">
            Ready to train
            {isCustomWorkout(workout) && <span className="chip chip--muted">My workout</span>}
          </p>
          <h1 className="workout-prepare__title">{workout.name}</h1>
          <p className="workout-prepare__summary">
            {workout.exercises.length} exercises · about {workout.durationMinutes} minutes ·{' '}
            {workout.equipment}
          </p>
          <DifficultyBadge difficulty={workout.difficulty} />
        </div>

        <div className="workout-prepare__start">
          <SectionHeader
            eyebrow="Before you begin"
            title="Check the plan"
            sub="Warm up, clear some space, and read the order below. Your sets, rest and time are tracked as you go."
          />
          <div className="workout-prepare__actions">
            <Button variant="primary" size="lg" onClick={handleBegin}>
              Begin workout
            </Button>
            <Button to={`/workouts/${workout.id}`} variant="ghost">
              Back to details
            </Button>
            {isCustomWorkout(workout) && (
              <Button to={`/workouts/edit/${workout.id}`} variant="ghost">
                Edit plan
              </Button>
            )}
          </div>
          <p className="workout-prepare__note">
            Begin starts the guided session: it walks through each exercise, counts
            your sets and rest, and saves a completed workout to your history when
            you finish. Ending early records nothing.
          </p>
        </div>
      </header>

      <section className="workout-prepare__plan" aria-label="Exercises in this workout">
        <SectionHeader
          eyebrow="Your plan"
          title="Exercises, in order"
          sub="Sets, reps and rest come straight from the workout record."
        />
        <WorkoutExerciseList workout={workout} />
      </section>
    </div>
  )
}

export default WorkoutPrepare