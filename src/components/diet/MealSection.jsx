import Button from '../ui/Button'
import {
  formatCalories,
  formatGrams,
  roundTotals,
  sumNutrition,
} from '../../utils/nutrition'

/**
 * One meal's logged foods.
 *
 * Shows the meal subtotal and every entry with the servings, serving size and
 * its two headline numbers. The "add" button is optional so the section can be
 * used purely for reading (for example on a past day) without offering an
 * action it cannot perform.
 */
function MealSection({ meal, entries = [], onAdd, onRemove }) {
  const subtotal = roundTotals(sumNutrition(entries))
  const headingId = `meal-${meal.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <section className="meal card" aria-labelledby={headingId}>
      <div className="meal__head">
        <h3 className="meal__title" id={headingId}>
          {meal}
        </h3>
        <div className="meal__head-right">
          <span className="meal__subtotal">{formatCalories(subtotal.calories)}</span>
          {onAdd && (
            <Button variant="secondary" size="sm" onClick={() => onAdd(meal)}>
              Add food
            </Button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="meal__empty">Nothing logged for {meal.toLowerCase()} yet.</p>
      ) : (
        <ul className="meal__list">
          {entries.map((entry) => (
            <li key={entry.id} className="meal__item">
              <div className="meal__item-main">
                <p className="meal__item-name">
                  {entry.name}
                  {entry.custom && <span className="chip chip--muted meal__custom">Custom</span>}
                </p>
                <p className="meal__item-meta">
                  {entry.servings !== 1 && `${entry.servings} × `}
                  {entry.servingSize || 'serving'}
                  <span className="meal__item-dot" aria-hidden="true"> · </span>
                  {formatGrams(entry.protein)} protein
                </p>
              </div>

              <div className="meal__item-right">
                <span className="meal__item-cal">{formatCalories(entry.calories)}</span>
                {onRemove && (
                  <button
                    type="button"
                    className="meal__remove"
                    onClick={() => onRemove(entry.id)}
                    aria-label={`Remove ${entry.name}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default MealSection
