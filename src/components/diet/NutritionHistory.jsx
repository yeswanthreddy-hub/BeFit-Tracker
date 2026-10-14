import { useMemo } from 'react'

import {
  formatCalories,
  formatGrams,
  normalizeDateKey,
  recentDayKeys,
  summariseDay,
} from '../../utils/nutrition'

function labelForKey(key, todayKey, yesterdayKey) {
  if (key === todayKey) return 'Today'
  if (key === yesterdayKey) return 'Yesterday'

  const parsed = new Date(`${key}T00:00:00`)
  return parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * A short run of recent days and what was logged on each.
 *
 * Each row is built with the same `summariseDay` the diet page and dashboard
 * use, so the history can never drift from the rest of the app. Empty days are
 * shown honestly as "0 items logged" rather than being hidden.
 */
function NutritionHistory({ entries, profile, days = 7 }) {
  const todayKey = normalizeDateKey(new Date())
  const yesterdayKey = useMemo(() => recentDayKeys(2)[1], [])
  const keys = useMemo(() => recentDayKeys(days), [days])

  return (
    <section className="nutrition-history card" aria-labelledby="nutrition-history-title">
      <div className="nutrition-history__head">
        <h2 className="nutrition-history__title" id="nutrition-history-title">
          Nutrition history
        </h2>
        <p className="nutrition-history__note">Last {days} days, pulled from your log.</p>
      </div>

      <ul className="nutrition-history__list">
        {keys.map((key) => {
          const summary = summariseDay(entries, profile, key)
          return (
            <li key={key} className="nutrition-history__item">
              <div className="nutrition-history__main">
                <p className="nutrition-history__day">
                  {labelForKey(key, todayKey, yesterdayKey)}
                </p>
                <p className="nutrition-history__meta">
                  {summary.entryCount} {summary.entryCount === 1 ? 'item' : 'items'} logged
                </p>
              </div>
              <div className="nutrition-history__cal">
                {formatCalories(summary.consumed.calories)}
              </div>
              <div className="nutrition-history__macros">
                <span>{formatGrams(summary.consumed.protein)} P</span>
                <span>{formatGrams(summary.consumed.carbs)} C</span>
                <span>{formatGrams(summary.consumed.fats)} F</span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default NutritionHistory
