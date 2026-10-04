import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import SectionHeader from '../../components/ui/SectionHeader'
import DifficultyBadge from '../../components/exercises/DifficultyBadge'
import WorkoutVisual from '../../components/workouts/WorkoutVisual'
import WorkoutExerciseList from '../../components/workouts/WorkoutExerciseList'
import { useNotifications } from '../../hooks/useNotifications'
import { useWorkout } from '../../hooks/useWorkout'
import { isCustomWorkout } from '../../utils/customWorkouts'
import './WorkoutPrepare.css'

/**
 * Preparation stage for one workout: "are you ready, and what are you about to do?"
 *
 * This is deliberately the *last* screen before the session runner. It shows
 * the plan exactly as the athlete will meet it, for a built-in template or a
 * workout they saved themselves, and the Begin button says plainly that the
 * guided session has not been built yet.
 *
 * Nothing here marks a workout as completed, records a set, or counts a
 * calorie. Pressing Begin raises an informational message instead of faking a
 * workout that never happened, so no completed-workout data can be invented.
 */
function WorkoutPrepare() {
  const { workoutId } = useParams()
  const workout = useWorkout(workoutId)
  const { notify } = useNotifications()

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
    notify({
      tone: 'info',
      title: 'Sessions arrive in the next step',
      message:
        'The guided session runner is still being built. Your plan is saved, so nothing is lost.',
    })
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
            sub="Warm up, clear some space, and read the order below. Nothing is recorded until a session runner exists."
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
            The guided session runner &mdash; timers, rest counts and a completion summary &mdash; is
            the next piece of BeFit. Pressing Begin today will not record a workout, because
            pretending a session happened is worse than admitting it has not been built.
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