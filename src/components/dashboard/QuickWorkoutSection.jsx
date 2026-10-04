import SectionHeader from '../ui/SectionHeader'
import QuickWorkoutCard from './QuickWorkoutCard'
import { getQuickWorkouts } from '../../utils/workouts'

/**
 * Quick workout templates offered as immediate actions.
 *
 * These are real entries from the workout library, chosen as the shortest
 * plans so the row always has something short enough to actually start. They
 * are templates, not completed sessions: each card routes into the preparation
 * stage, and nothing is recorded until a workout is actually finished.
 */
function QuickWorkoutSection() {
  const quickWorkouts = getQuickWorkouts(undefined, 3)

  return (
    <section className="quick-workouts" aria-labelledby="quick-workouts-heading">
      <SectionHeader
        eyebrow="Quick workouts"
        title="No time for a full plan?"
        sub="Short, ready-made sessions you can start right now."
        action={
          <span className="quick-workouts__note">
            <span className="visually-hidden">Showing the</span>
            shortest plans in the library
          </span>
        }
      />

      <h3 className="visually-hidden" id="quick-workouts-heading">
        Available quick workouts
      </h3>

      <div className="quick-workouts__grid">
        {quickWorkouts.map((workout) => (
          <QuickWorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>
    </section>
  )
}

export default QuickWorkoutSection