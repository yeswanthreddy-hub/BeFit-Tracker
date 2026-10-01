import { Link } from 'react-router-dom'
import Button from '../ui/Button'

/**
 * Dashboard's primary call to action.
 *
 * Deliberately the largest, highest-contrast element on the page: whatever else
 * the athlete does today, this is what they came here to do. It routes to the
 * workout library rather than pretending a session has been performed.
 */
function StartWorkoutCard() {
  return (
    <section className="start-workout" aria-labelledby="start-workout-title">
      <div className="start-workout__glow" aria-hidden="true" />
      <div className="start-workout__ring" aria-hidden="true">
        <span className="start-workout__ring-value">GO</span>
      </div>

      <div className="start-workout__body">
        <p className="start-workout__eyebrow">Ready to train?</p>
        <h2 className="start-workout__title" id="start-workout-title">
          Choose a workout and start moving
        </h2>
        <p className="start-workout__text">
          Pick a quick session or a full plan. Every completed workout is tracked
          here automatically.
        </p>
      </div>

      <div className="start-workout__actions">
        <Button to="/workouts" variant="primary" size="lg" className="start-workout__cta">
          Start Workout
        </Button>
        <Link to="/completed" className="start-workout__secondary">
          View completed workouts
        </Link>
      </div>
    </section>
  )
}

export default StartWorkoutCard