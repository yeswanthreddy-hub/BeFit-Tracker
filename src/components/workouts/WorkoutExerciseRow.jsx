import { Link } from 'react-router-dom'
import DifficultyBadge from '../exercises/DifficultyBadge'
import { workoutVolumeLabel } from '../../utils/workouts'
import { exerciseSubtitle } from '../../utils/exercises'

/**
 * One exercise inside a workout's plan.
 *
 * Shows the plan values (sets / reps / rest) and resolves the name, category
 * and muscles from the exercise catalog, so a workout never carries a second
 * copy of exercise data. "View exercise" links to the existing exercise detail
 * page rather than opening a second version of it.
 *
 * @param {object} props
 * @param {{exercise: object, sets: number, reps: number, restSeconds: number, durationSeconds: number}} props.entry
 * @param {number} [props.index] 1-based position in the plan
 * @param {boolean} [props.showLink] hide the link on read-only screens
 */
function WorkoutExerciseRow({ entry, index, showLink = true }) {
  const { exercise, restSeconds } = entry

  return (
    <li className="workout-row">
      <span className="workout-row__index" aria-hidden="true">
        {index}
      </span>

      <div className="workout-row__body">
        <h4 className="workout-row__name">{exercise.name}</h4>
<p className="workout-row__meta">
            <span className="workout-row__category">{exerciseSubtitle(exercise)}</span>
            <span aria-hidden="true">·</span>
            <span>{workoutVolumeLabel(entry)}</span>
          </p>
        {exercise.targetMuscles.length > 1 && (
          <p className="workout-row__muscles">
            {exercise.targetMuscles.join(', ')}
          </p>
        )}
      </div>

      <dl className="workout-row__plan">
        <div className="workout-row__plan-item">
          <dt>Sets</dt>
          <dd>{entry.sets}</dd>
        </div>
        <div className="workout-row__plan-item">
          <dt>{entry.durationSeconds > 0 ? 'Hold' : 'Reps'}</dt>
          <dd>{entry.durationSeconds > 0 ? `${entry.durationSeconds}s` : entry.reps}</dd>
        </div>
        <div className="workout-row__plan-item">
          <dt>Rest</dt>
          <dd>{restSeconds}s</dd>
        </div>
      </dl>

      <span className="workout-row__volume">{workoutVolumeLabel(entry)}</span>
      <DifficultyBadge difficulty={exercise.difficulty} className="workout-row__difficulty" />

      {showLink && (
        <Link to={`/exercises/${exercise.id}`} className="btn btn--ghost btn--sm workout-row__link">
          View exercise
          <span aria-hidden="true"> →</span>
        </Link>
      )}
    </li>
  )
}

export default WorkoutExerciseRow