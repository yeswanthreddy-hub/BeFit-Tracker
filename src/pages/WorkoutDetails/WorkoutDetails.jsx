import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import SectionHeader from '../../components/ui/SectionHeader'
import DifficultyBadge from '../../components/exercises/DifficultyBadge'
import WorkoutVisual from '../../components/workouts/WorkoutVisual'
import WorkoutExerciseList from '../../components/workouts/WorkoutExerciseList'
import { getWorkoutById } from '../../utils/workouts'
import './WorkoutDetails.css'

/**
 * A single workout.
 *
 * Reads the plan from `src/data/workouts.js` (or a saved custom workout) and
 * resolves every exercise through the exercise catalog, so this page never
 * carries a second copy of exercise data. "View exercise" links to the existing
 * `/exercises/:exerciseId` page rather than re-implementing it.
 *
 * "Start workout" routes into the preparation stage. Nothing on this page marks
 * a workout as performed: the session system arrives in a later stage.
 */
function WorkoutDetails() {
  const { workoutId } = useParams()
  const workout = getWorkoutById(workoutId)

  // Arriving from a scrolled grid should land at the top of the new page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [workoutId])

  if (!workout) {
    return (
      <div className="page workout-detail">
        <EmptyState
          title="Workout not found"
          note={`We could not find a workout called "${workoutId}". It may have been renamed or removed.`}
          action={
            <Button to="/workouts" variant="secondary">
              Back to workout library
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="page workout-detail">
      <Link to="/workouts" className="workout-detail__back">
        <span aria-hidden="true">←</span> All workouts
      </Link>

      <header className="workout-detail__hero">
        <div className="workout-detail__panel">
          <WorkoutVisual category={workout.category} size="detail" />
          <p className="workout-detail__eyebrow">{workout.category}</p>
          <h1 className="workout-detail__title">{workout.name}</h1>
          <p className="workout-detail__description">{workout.description}</p>
        </div>

        <div className="workout-detail__intro">
          <SectionHeader
            eyebrow="Overview"
            title="What this session covers"
            sub="Every value below comes straight from the workout record, so nothing is estimated twice."
          />

          <dl className="workout-detail__stats">
            <div className="workout-detail__stat">
              <dt>Exercises</dt>
              <dd>{workout.exercises.length}</dd>
            </div>
            <div className="workout-detail__stat">
              <dt>Duration</dt>
              <dd>{workout.durationMinutes} min</dd>
            </div>
            <div className="workout-detail__stat">
              <dt>Goal</dt>
              <dd>{workout.goal}</dd>
            </div>
            <div className="workout-detail__stat">
              <dt>Equipment</dt>
              <dd>{workout.equipment}</dd>
            </div>
          </dl>

          <div className="workout-detail__meta-row">
            <DifficultyBadge difficulty={workout.difficulty} />
          </div>

          {workout.targetMuscles.length > 0 && (
            <div className="workout-detail__muscles">
              <p className="workout-detail__muscles-title">Target muscles</p>
              <ul className="workout-detail__chips">
                {workout.targetMuscles.map((muscle) => (
                  <li key={muscle} className="chip">
                    {muscle}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="workout-detail__cta">
            <Button to={`/workouts/${workout.id}/start`} variant="primary" size="lg">
              Start workout
            </Button>
            <Button to="/workouts/create" variant="secondary" size="lg">
              Customize workout
            </Button>
            <p className="workout-detail__cta-note">
              Preparing a workout does not mark it as completed. The full session
              runner arrives in the next stage.
            </p>
          </div>
        </div>
      </header>

      <section className="workout-detail__plan" aria-labelledby="workout-plan-heading">
        <SectionHeader
          eyebrow="The plan"
          title="Exercises in this workout"
          sub="Open any movement for full instructions, form tips and related exercises."
        />
        <h2 className="visually-hidden" id="workout-plan-heading">
          Exercises in {workout.name}
        </h2>
        <WorkoutExerciseList workout={workout} />
      </section>
    </div>
  )
}

export default WorkoutDetails