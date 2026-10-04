import Button from '../ui/Button'
import DifficultyBadge from '../exercises/DifficultyBadge'

/**
 * A single quick workout from the library.
 *
 * Owns its own hover/lift treatment and is the only card in the grid with a
 * nested action, which is why it lives in its own file.
 *
 * The "Start" button only navigates into the preparation stage for that
 * workout. Nothing here marks the workout as completed.
 */
function QuickWorkoutCard({ workout }) {
  return (
    <article className="quick-card card card--hover">
      <div className="quick-card__head">
        <h4 className="quick-card__title">{workout.name}</h4>
        <span className="quick-card__duration">
          <span className="quick-card__duration-value">{workout.durationMinutes}</span>
          <span className="quick-card__unit">min</span>
          <span className="visually-hidden">estimated duration in minutes</span>
        </span>
      </div>

      <p className="quick-card__text">{workout.description}</p>

      <dl className="quick-card__meta">
        <div className="quick-card__meta-row">
          <dt>Difficulty</dt>
          <dd>
            <DifficultyBadge difficulty={workout.difficulty} />
          </dd>
        </div>
        <div className="quick-card__meta-row">
          <dt>Target</dt>
          <dd>{workout.targetMuscles.slice(0, 3).join(', ') || workout.category}</dd>
        </div>
      </dl>

      <div className="quick-card__footer">
        <Button
          to={`/workouts/${workout.id}/start`}
          variant="secondary"
          size="sm"
          className="btn--block"
        >
          Start
          <span className="visually-hidden"> {workout.name}</span>
        </Button>
      </div>
    </article>
  )
}

export default QuickWorkoutCard