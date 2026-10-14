import { useEffect, useMemo, useRef, useState } from 'react'

import Button from '../ui/Button'
import {
  MEALS,
  formatCalories,
  formatGrams,
  scaleNutrition,
} from '../../utils/nutrition'
import { FOOD_CATEGORY_NAMES } from '../../data/foodCategories'

const FILTER_ALL = 'All'

/**
 * Browse the food library and add one food to a meal.
 *
 * One modal, two jobs: pick a food from the built-in catalog or the athlete's
 * own foods, then choose the meal and the number of servings. The preview uses
 * the same `scaleNutrition` the log uses, so what the panel shows is exactly
 * what gets stored.
 *
 * Custom foods are marked, and can be edited or deleted from here without
 * leaving the flow — the page owns those dialogs so nothing nests inside this
 * one.
 */
function AddFoodModal({
  defaultMeal = MEALS[0],
  foods = [],
  recentFoods = [],
  onClose,
  onAdd,
  onNewCustomFood,
  onEditCustomFood,
  onDeleteCustomFood,
}) {
  const [meal, setMeal] = useState(MEALS.includes(defaultMeal) ? defaultMeal : MEALS[0])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(FILTER_ALL)
  const [selectedId, setSelectedId] = useState(null)
  const [servings, setServings] = useState('1')
  const searchRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    const focusId = window.setTimeout(() => searchRef.current?.focus(), 0)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(focusId)
    }
  }, [onClose])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return foods.filter((food) => {
      if (category !== FILTER_ALL && food.category !== category) return false
      if (term !== '' && !food.name.toLowerCase().includes(term)) return false
      return true
    })
  }, [foods, query, category])

  const selected = useMemo(
    () => foods.find((food) => food.id === selectedId) ?? null,
    [foods, selectedId],
  )

  const amount = Number(servings)
  const safeServings = Number.isFinite(amount) && amount > 0 ? amount : 1
  const preview = selected ? scaleNutrition(selected, safeServings) : null

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!selected) return
    onAdd({ food: selected, meal, servings: safeServings })
    onClose()
  }

  return (
    <div
      className="food-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="food-modal__panel card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-food-title"
      >
        <div className="food-modal__head">
          <h2 className="food-modal__title" id="add-food-title">
            Add food
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {recentFoods.length > 0 && (
          <div className="food-modal__recent">
            <p className="food-modal__recent-label">Recent</p>
            <ul className="food-modal__recent-list">
              {recentFoods.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    className={`chip chip--filter${food.id === selectedId ? ' is-active' : ''}`}
                    onClick={() => setSelectedId(food.id)}
                  >
                    {food.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="food-modal__tools">
          <input
            ref={searchRef}
            type="search"
            className="field food-modal__search"
            placeholder="Search foods"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search foods"
          />
          <Button variant="secondary" size="sm" onClick={onNewCustomFood}>
            New custom food
          </Button>
        </div>

        <ul className="chip-group food-modal__filters">
          {[FILTER_ALL, ...FOOD_CATEGORY_NAMES].map((name) => (
            <li key={name}>
              <button
                type="button"
                className={`chip chip--filter${category === name ? ' is-active' : ''}`}
                onClick={() => setCategory(name)}
                aria-pressed={category === name}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>

        <div className="food-modal__list-wrap">
          {filtered.length === 0 ? (
            <p className="food-modal__empty">No foods match that search.</p>
          ) : (
            <ul className="food-modal__list">
              {filtered.map((food) => {
                const isSelected = food.id === selectedId
                return (
                  <li key={food.id}>
                    <button
                      type="button"
                      className={`food-row${isSelected ? ' food-row--selected' : ''}`}
                      onClick={() => setSelectedId(food.id)}
                      aria-pressed={isSelected}
                    >
                      <span className="food-row__main">
                        <span className="food-row__name">
                          {food.name}
                          {food.custom && (
                            <span className="chip chip--muted food-row__tag">Custom</span>
                          )}
                        </span>
                        <span className="food-row__meta">
                          {food.servingSize || '1 serving'} · {formatGrams(food.protein)} protein
                        </span>
                      </span>
                      <span className="food-row__cal">{formatCalories(food.calories)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <form className="food-modal__footer" onSubmit={handleSubmit}>
          {selected ? (
            <div className="food-modal__selected">
              <p className="food-modal__selected-name">
                {selected.name}
                {preview && (
                  <span className="food-modal__selected-cal">
                    {formatCalories(preview.calories)}
                  </span>
                )}
              </p>
              {selected.custom && (onEditCustomFood || onDeleteCustomFood) && (
                <div className="food-modal__selected-actions">
                  {onEditCustomFood && (
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => onEditCustomFood(selected)}
                    >
                      Edit
                    </button>
                  )}
                  {onDeleteCustomFood && (
                    <button
                      type="button"
                      className="link-button link-button--danger"
                      onClick={() => onDeleteCustomFood(selected)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="food-modal__prompt">Pick a food above to add it to your day.</p>
          )}

          <div className="food-modal__controls">
            <div className="diet-field food-modal__control">
              <label className="form-field__label" htmlFor="add-food-servings">
                Servings
              </label>
              <input
                id="add-food-servings"
                type="number"
                className="field"
                min="0.25"
                step="0.25"
                inputMode="decimal"
                value={servings}
                onChange={(event) => setServings(event.target.value)}
              />
            </div>

            <div className="diet-field food-modal__control">
              <label className="form-field__label" htmlFor="add-food-meal">
                Meal
              </label>
              <select
                id="add-food-meal"
                className="field"
                value={meal}
                onChange={(event) => setMeal(event.target.value)}
              >
                {MEALS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="primary" disabled={!selected}>
              Add to {meal.toLowerCase()}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFoodModal
