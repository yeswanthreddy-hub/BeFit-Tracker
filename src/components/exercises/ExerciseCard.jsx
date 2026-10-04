import { Link } from 'react-router-dom'
import ExerciseVisual from './ExerciseVisual'
import DifficultyBadge from './DifficultyBadge'
import { primaryMuscle } from '../../utils/exercises'

/**
 * One exercise in the library grid.
 *
 * The card is an article with a single, meaningful link ("View details") rather
 * than a link wrapped around the whole card, which keeps the tab order short
 * and stops screen readers announcing the same text three times.
 *
 * @param {{exercise: import('../../data/exercises.js').Exercise}} props
 */
function ExerciseCard({ exercise }) {
  return (
    <article className="card card--hover exercise-card">
      <div className="exercise-card__visual">
        <ExerciseVisual category={exercise.category} />
        <span className="chip chip--primary exercise-card__category">{exercise.category}</span>
        <span className="chip exercise-card__type">{exercise.type}</span>
      </div>

      <div className="exercise-card__body">
        <h3 className="exercise-card__title">{exercise.name}</h3>
        <p className="exercise-card__description">{exercise.description}</p>
      </div>

      <ul className="exercise-card__facts">
        <li>
          <DifficultyBadge difficulty={exercise.difficulty} />
        </li>
        <li className="exercise-card__fact">
          <span className="exercise-card__fact-label">Equipment</span>
          <span className="exercise-card__fact-value">{exercise.equipment}</span>
        </li>
        <li className="exercise-card__fact">
          <span className="exercise-card__fact-label">Targets</span>
          <span className="exercise-card__fact-value">{primaryMuscle(exercise)}</span>
        </li>
        <li className="exercise-card__fact">
          <span className="exercise-card__fact-label">Time</span>
          <span className="exercise-card__fact-value">{exercise.durationMinutes} min</span>
        </li>
      </ul>

      <div className="exercise-card__footer">
        <Link
          to={`/exercises/${exercise.id}`}
          className="btn btn--secondary btn--sm exercise-card__cta"
        >
          View details
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

export default ExerciseCard