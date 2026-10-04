import WorkoutExerciseRow from './WorkoutExerciseRow'
import { resolveWorkoutExercises } from '../../utils/workouts'

/**
 * The exercise list inside a workout.
 *
 * Shared by the workout detail page and the preparation screen so both always
 * show the plan the same way. Entries whose exercise id no longer resolves are
 * dropped by `resolveWorkoutExercises` rather than rendered as a blank row.
 *
 * @param {object} props
 * @param {object} props.workout
 * @param {boolean} [props.showLinks]
 * @param {string} [props.emptyNote] copy for the "no exercises" case
 */
function WorkoutExerciseList({ workout, showLinks = true, emptyNote }) {
  const entries = resolveWorkoutExercises(workout)

  if (entries.length === 0) {
    return (
      <p className="workout-list__empty">
        {emptyNote ?? 'This workout has no exercises yet. Add some in the workout builder.'}
      </p>
    )
  }

  return (
    <ol className="workout-list">
      {entries.map((entry, index) => (
        <WorkoutExerciseRow
          key={entry.exercise.id}
          entry={entry}
          index={index + 1}
          showLink={showLinks}
        />
      ))}
    </ol>
  )
}

export default WorkoutExerciseList