import { formatCalories, formatGrams } from '../../utils/nutrition'

/**
 * Nutrition headline numbers for the selected range.
 *
 * Averages are taken over days that actually have food logged, and the protein
 * goal is judged only on tracked days — an untracked day is never treated as a
 * failure. The reminder that values are estimates travels with the figures.
 */
function NutritionProgress({ progress }) {
  const {
    daysLogged,
    avgCalories,
    avgProtein,
    avgCarbs,
    avgFats,
    proteinTarget,
    proteinSuccessDays,
    proteinSuccessPercent,
  } = progress

  const hasTarget = proteinTarget > 0

  return (
    <section className="nutrition-progress card" aria-labelledby="nutrition-progress-heading">
      <div className="nutrition-progress__head">
        <div>
          <h2 className="nutrition-progress__title" id="nutrition-progress-heading">
            Nutrition progress
          </h2>
          <p className="nutrition-progress__note">
            Based on {daysLogged} logged {daysLogged === 1 ? 'day' : 'days'} in this range.
          </p>
        </div>
      </div>

      <dl className="nutrition-progress__stats">
        <div className="nutrition-progress__stat">
          <dt>Average calories</dt>
          <dd>{formatCalories(avgCalories)}</dd>
          <span>per logged day</span>
        </div>
        <div className="nutrition-progress__stat">
          <dt>Average protein</dt>
          <dd>{formatGrams(avgProtein)}</dd>
          <span>per logged day</span>
        </div>
        <div className="nutrition-progress__stat">
          <dt>Protein goal</dt>
          <dd>
            {hasTarget ? `${proteinSuccessDays} / ${daysLogged}` : 'No target'}
          </dd>
          <span>{hasTarget ? `${proteinSuccessPercent}% of tracked days` : 'Set a target on the diet page'}</span>
        </div>
      </dl>

      <div className="nutrition-progress__macros" aria-label="Average daily macros">
        <div className="nutrition-progress__macro">
          <span className="nutrition-progress__macro-label">Calories</span>
          <span className="nutrition-progress__macro-value">{formatCalories(avgCalories)}</span>
        </div>
        <div className="nutrition-progress__macro">
          <span className="nutrition-progress__macro-label">Protein</span>
          <span className="nutrition-progress__macro-value">{formatGrams(avgProtein)}</span>
        </div>
        <div className="nutrition-progress__macro">
          <span className="nutrition-progress__macro-label">Carbs</span>
          <span className="nutrition-progress__macro-value">{formatGrams(avgCarbs)}</span>
        </div>
        <div className="nutrition-progress__macro">
          <span className="nutrition-progress__macro-label">Fats</span>
          <span className="nutrition-progress__macro-value">{formatGrams(avgFats)}</span>
        </div>
      </div>

      <p className="nutrition-progress__disclaimer">
        Nutrition values are approximate and may vary by brand, preparation, and serving size.
      </p>
    </section>
  )
}

export default NutritionProgress
