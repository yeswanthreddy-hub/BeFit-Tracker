import {
  formatCalories,
  formatGrams,
} from '../../utils/nutrition'

/**
 * A day's nutrition at a glance.
 *
 * Calories lead, with a target and progress bar only when the athlete has set
 * one. An unset target is never rendered as "0 kcal left": the summary says so
 * plainly instead. Over target is reported as "X kcal over target" rather than
 * a negative number, so the reading stays clear and non-judgemental.
 */
function DailyNutritionSummary({ summary }) {
  const {
    consumed,
    entryCount,
    calorieTarget,
    proteinTarget,
    remainingCalories,
    remainingProtein,
    hasCalorieTarget,
    hasProteinTarget,
    caloriePercent,
    proteinPercent,
    overCalories,
    overProtein,
  } = summary

  return (
    <section className="diet-summary card" aria-labelledby="diet-summary-title">
      <div className="diet-summary__head">
        <h2 className="diet-summary__title" id="diet-summary-title">
          Daily nutrition
        </h2>
        <p className="diet-summary__count" role="status">
          {entryCount} {entryCount === 1 ? 'item logged' : 'items logged'}
        </p>
      </div>

      <div className="diet-summary__calories">
        <p className="diet-summary__big">
          {formatCalories(consumed.calories)}
          {hasCalorieTarget && (
            <span className="diet-summary__of">
              {' '}
              / {Math.round(calorieTarget).toLocaleString()} kcal
            </span>
          )}
        </p>

        {hasCalorieTarget ? (
          <p
            className={`diet-summary__remaining${
              overCalories ? ' diet-summary__remaining--over' : ''
            }`}
          >
            {overCalories
              ? `${formatCalories(Math.abs(remainingCalories))} over target`
              : `${formatCalories(remainingCalories)} remaining`}
          </p>
        ) : (
          <p className="diet-summary__note">
            Set a daily calorie target below to see what is left.
          </p>
        )}

        {hasCalorieTarget && (
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={caloriePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Calories used today"
          >
            <div className="progress__fill" style={{ width: `${caloriePercent}%` }} />
          </div>
        )}
      </div>

      <dl className="diet-summary__macros">
        <div className="diet-summary__macro">
          <dt className="diet-summary__macro-label">Protein</dt>
          <dd className="diet-summary__macro-value">
            {formatGrams(consumed.protein)}
            {hasProteinTarget && (
              <span className="diet-summary__macro-target"> / {formatGrams(proteinTarget)}</span>
            )}
          </dd>
          {hasProteinTarget && (
            <p className={`diet-summary__macro-note${overProtein ? ' diet-summary__macro-note--over' : ''}`}>
              {overProtein
                ? `${formatGrams(Math.abs(remainingProtein))} over target`
                : `${formatGrams(remainingProtein)} to go`}
            </p>
          )}
          {hasProteinTarget && (
            <div className="progress diet-summary__macro-progress">
              <div className="progress__fill" style={{ width: `${proteinPercent}%` }} />
            </div>
          )}
        </div>

        <div className="diet-summary__macro">
          <dt className="diet-summary__macro-label">Carbs</dt>
          <dd className="diet-summary__macro-value">{formatGrams(consumed.carbs)}</dd>
        </div>

        <div className="diet-summary__macro">
          <dt className="diet-summary__macro-label">Fat</dt>
          <dd className="diet-summary__macro-value">{formatGrams(consumed.fats)}</dd>
        </div>
      </dl>

      {!hasCalorieTarget && !hasProteinTarget && consumed.calories === 0 && (
        <p className="diet-summary__hint">
          Log a food to start building your day, or set a target to see what you have left.
        </p>
      )}
    </section>
  )
}

export default DailyNutritionSummary
