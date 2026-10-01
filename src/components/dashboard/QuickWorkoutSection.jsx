import SectionHeader from '../ui/SectionHeader'
import QuickWorkoutCard from './QuickWorkoutCard'
import { QUICK_WORKOUTS } from '../../data/workoutTemplates'

/**
 * Quick workout templates offered as immediate actions.
 *
 * These are templates, not completed sessions. Selecting one routes into the
 * workout experience and nothing is recorded until a workout is actually
 * finished.
 */
function QuickWorkoutSection() {
  return (
    <section className="quick-workouts" aria-labelledby="quick-workouts-heading">
      <SectionHeader
        eyebrow="Quick workouts"
        title="No time for a full plan?"
        sub="Short, ready-made sessions you can start right now."
      />

      <h3 className="visually-hidden" id="quick-workouts-heading">
        Available quick workouts
      </h3>

      <div className="quick-workouts__grid">
        {QUICK_WORKOUTS.map((workout) => (
          <QuickWorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>
    </section>
  )
}

export default QuickWorkoutSection