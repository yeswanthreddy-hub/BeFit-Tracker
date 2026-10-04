import { useWorkoutSelection } from '../../hooks/useWorkoutSelection'

/**
 * What is currently in the temporary workout selection.
 *
 * Renders nothing while the selection is empty, so the library stays calm until
 * an athlete actually picks something. Every selected exercise can be removed
 * again from here, which is the "remove" half of the add/remove/count loop.
 */
function WorkoutSelectionBar() {
  const { selectedExercises, count, remove, clear } = useWorkoutSelection()

  if (count === 0) return null

  return (
    <section className="selection" aria-labelledby="workout-selection-heading">
      <div className="selection__header">
        <div>
          <p className="section-header__eyebrow">Workout selection</p>
          <h2 className="selection__title" id="workout-selection-heading">
            {count} {count === 1 ? 'exercise' : 'exercises'} selected
          </h2>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={clear}>
          Clear selection
        </button>
      </div>

      <ul className="selection__list">
        {selectedExercises.map((exercise) => (
          <li key={exercise.id} className="selection__item">
            <span className="selection__name">{exercise.name}</span>
            <span className="selection__meta">
              {exercise.category} · {exercise.equipment}
            </span>
            <button
              type="button"
              className="selection__remove"
              onClick={() => remove(exercise)}
            >
              <span aria-hidden="true">✕</span>
              <span className="visually-hidden">Remove {exercise.name} from workout selection</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="selection__note">
        This is a temporary selection, not a finished workout. Nothing is marked as
        completed until you run a session.
      </p>
    </section>
  )
}

export default WorkoutSelectionBar