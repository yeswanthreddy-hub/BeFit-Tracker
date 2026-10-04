import ExerciseCard from './ExerciseCard'

/**
 * "Keep exploring" rail at the foot of an exercise.
 *
 * Renders nothing when the catalog has no comparable movements, so the detail
 * page never shows an empty shell.
 *
 * @param {{exercises: import('../../data/exercises.js').Exercise[]}} props
 */
function RelatedExercises({ exercises }) {
  if (!Array.isArray(exercises) || exercises.length === 0) return null

  return (
    <section className="related" aria-labelledby="related-heading">
      <div className="related__header">
        <p className="section-header__eyebrow">Keep going</p>
        <h2 className="related__title" id="related-heading">
          Related exercises
        </h2>
        <p className="related__note">
          Same muscle group, similar difficulty, or the same equipment — pick one and
          keep the session moving.
        </p>
      </div>

      <ul className="exercise-grid exercise-grid--related">
        {exercises.map((exercise, index) => (
          <li key={exercise.id} style={{ '--reveal-index': Math.min(index, 5) }}>
            <ExerciseCard exercise={exercise} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RelatedExercises