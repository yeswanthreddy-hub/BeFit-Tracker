import Button from '../ui/Button'

/**
 * A single quick workout template.
 *
 * Owns its own hover/lift treatment and is the only card in the grid with a
 * nested action, which is why it lives in its own file.
 *
 * The "Start" button only navigates to the workout library. Nothing here marks
 * the workout as completed.
 */
function QuickWorkoutCard({ workout }) {
  return (
    <article className="quick-card card card--hover">
      <div className="quick-card__head">
        <h4 className="quick-card__title">{workout.name}</h4>
        <span className="quick-card__duration">
          <span className="quick-card__duration-value">{workout.durationMinutes}</span>
          <span className="quick-card__unit">min</span>
          <span className="visually-hidden">duration in minutes</span>
        </span>
      </div>

      <p className="quick-card__text">{workout.description}</p>

      <dl className="quick-card__meta">
        <div className="quick-card__meta-row">
          <dt>Difficulty</dt>
          <dd>{workout.difficulty}</dd>
        </div>
        <div className="quick-card__meta-row">
          <dt>Target</dt>
          <dd>{workout.target}</dd>
        </div>
      </dl>

      <div className="quick-card__footer">
        <Button to="/workouts" variant="secondary" size="sm" className="btn--block">
          Start
        </Button>
      </div>
    </article>
  )
}

export default QuickWorkoutCard