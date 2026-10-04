import Button from '../ui/Button'
import DifficultyBadge from '../exercises/DifficultyBadge'
import WorkoutVisual from './WorkoutVisual'
import { resolveWorkoutExercises, workoutVolumeLabel } from '../../utils/workouts'

/**
 * One workout in the library grid.
 *
 * The card is an article with two clearly named actions instead of one link
 * wrapping the whole card, which keeps the tab order short and stops screen
 * readers announcing the same text three times.
 *
 * "Start workout" only routes into the workout detail / preparation stage. It
 * never marks anything as completed: the session system is a later stage.
 *
 * @param {{workout: object, startHref?: string}} props
 */
function WorkoutCard({ workout, startHref }) {
  const entries = resolveWorkoutExercises(workout)
  const preview = entries[0]

  return (
    <article className="card card--hover workout-card">
      <div className="workout-card__visual">
        <WorkoutVisual category={workout.category} />
        <span className="chip chip--primary workout-card__category">{workout.category}</span>
        <span className="workout-card__duration">
          <span className="workout-card__duration-value">{workout.durationMinutes}</span>
          <span className="workout-card__unit">min</span>
          <span className="visually-hidden">estimated duration in minutes</span>
        </span>
      </div>

      <div className="workout-card__body">
        <h3 className="workout-card__title">{workout.name}</h3>
        <p className="workout-card__description">{workout.description}</p>
      </div>

      <ul className="workout-card__facts">
        <li>
          <DifficultyBadge difficulty={workout.difficulty} />
        </li>
        <li className="workout-card__fact">
          <span className="workout-card__fact-label">Goal</span>
          <span className="workout-card__fact-value">{workout.goal}</span>
        </li>
        <li className="workout-card__fact">
          <span className="workout-card__fact-label">Equipment</span>
          <span className="workout-card__fact-value">{workout.equipment}</span>
        </li>
        <li className="workout-card__fact">
          <span className="workout-card__fact-label">Exercises</span>
          <span className="workout-card__fact-value">{workout.exercises.length}</span>
        </li>
      </ul>

      {workout.targetMuscles.length > 0 && (
        <ul className="workout-card__muscles" aria-label="Target muscles">
          {workout.targetMuscles.slice(0, 4).map((muscle) => (
            <li key={muscle} className="chip">
              {muscle}
            </li>
          ))}
        </ul>
      )}

      {preview && (
        <p className="workout-card__preview">
          <span className="workout-card__preview-label">Starts with</span>
          <span className="workout-card__preview-value">
            {preview.exercise.name} · {workoutVolumeLabel(preview, { compact: true })}
          </span>
        </p>
      )}

      <div className="workout-card__footer">
        <Button
          to={`/workouts/${workout.id}`}
          variant="secondary"
          size="sm"
          className="workout-card__cta"
        >
          View details
          <span aria-hidden="true"> →</span>
        </Button>
        <Button
          to={startHref ?? `/workouts/${workout.id}/start`}
          size="sm"
          className="workout-card__cta"
        >
          Start workout
        </Button>
      </div>
    </article>
  )
}

export default WorkoutCard