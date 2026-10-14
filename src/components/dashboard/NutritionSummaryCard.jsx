import { useMemo } from 'react'

import Button from '../ui/Button'
import { useUserStorage } from '../../hooks/useUserStorage'
import { STORAGE_KEYS } from '../../utils/storageKeys'
import {
  formatCalories,
  formatGrams,
  normalizeNutritionProfile,
  NUTRITION_DISCLAIMER,
  parseFoodLog,
  summariseDay,
} from '../../utils/nutrition'

/**
 * Today's nutrition on the dashboard.
 *
 * Reads the same stored food log and targets the diet page writes to, so the two
 * can never disagree. A day with nothing logged says so plainly instead of
 * inventing numbers, and the reminder about approximate values travels with the
 * figures rather than being left behind on the diet page.
 */
function NutritionSummaryCard() {
  const [log] = useUserStorage(STORAGE_KEYS.foodLog, [])
  const [targets] = useUserStorage(STORAGE_KEYS.nutritionProfile, {})

  const summary = useMemo(
    () => summariseDay(parseFoodLog(log), normalizeNutritionProfile(targets)),
    [log, targets],
  )

  const hasAnything = summary.entryCount > 0 || summary.hasCalorieTarget

  return (
    <section className="nutrition-card card" aria-labelledby="nutrition-card-heading">
      <div className="nutrition-card__head">
        <h2 className="nutrition-card__title" id="nutrition-card-heading">
          Nutrition today
        </h2>
        <Button to="/diet" variant="secondary" size="sm">
          {summary.entryCount > 0 ? 'Open diet page' : 'Log your first food'}
        </Button>
      </div>

      {hasAnything ? (
        <div className="nutrition-card__body">
          <p className="nutrition-card__calories">
            {formatCalories(summary.consumed.calories)}
            {summary.hasCalorieTarget && (
              <span className="nutrition-card__of">
                {' '}
                / {Math.round(summary.calorieTarget).toLocaleString()} kcal
              </span>
            )}
          </p>

          {summary.hasCalorieTarget ? (
            <p className="nutrition-card__remaining">
              {summary.overCalories
                ? `${formatCalories(Math.abs(summary.remainingCalories))} over target`
                : `${formatCalories(summary.remainingCalories)} remaining`}
            </p>
          ) : (
            <p className="nutrition-card__remaining">No daily target set yet.</p>
          )}

          <dl className="nutrition-card__macros">
            <div className="nutrition-card__macro">
              <dt>Protein</dt>
              <dd>{formatGrams(summary.consumed.protein)}</dd>
            </div>
            <div className="nutrition-card__macro">
              <dt>Carbs</dt>
              <dd>{formatGrams(summary.consumed.carbs)}</dd>
            </div>
            <div className="nutrition-card__macro">
              <dt>Fat</dt>
              <dd>{formatGrams(summary.consumed.fats)}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="nutrition-card__empty">
          Nothing logged today yet — track your meals to see calories and macros here.
        </p>
      )}

      <p className="nutrition-card__note">{NUTRITION_DISCLAIMER}</p>
    </section>
  )
}

export default NutritionSummaryCard
