import { useEffect, useState } from 'react'

import Button from '../ui/Button'
import { FOOD_CATEGORY_NAMES } from '../../data/foodCategories'
import {
  createCustomFoodDraft,
  validateCustomFoodDraft,
} from '../../utils/customFoods'

/**
 * Create or edit a custom food.
 *
 * One form serves both: only the initial values differ. Values are validated
 * before saving and the messages sit next to the field that caused them, so a
 * mistyped number never silently becomes a zero-calorie food.
 */
function CustomFoodForm({ open, initial = null, onClose, onSubmit, onDelete }) {
  const [draft, setDraft] = useState(createCustomFoodDraft)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return undefined

    setErrors({})
    if (initial) {
      setDraft({
        name: initial.name ?? '',
        category: initial.category ?? createCustomFoodDraft().category,
        servingSize: initial.servingSize ?? '',
        calories: initial.calories != null ? String(initial.calories) : '',
        protein: initial.protein != null ? String(initial.protein) : '',
        carbs: initial.carbs != null ? String(initial.carbs) : '',
        fats: initial.fats != null ? String(initial.fats) : '',
      })
    } else {
      setDraft(createCustomFoodDraft())
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, initial, onClose])

  if (!open) return null

  const updateField = (name, value) => setDraft((current) => ({ ...current, [name]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const found = validateCustomFoodDraft(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const saved = onSubmit(draft, initial?.id ?? null)
    if (saved) onClose()
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
        aria-labelledby="custom-food-title"
      >
        <div className="food-modal__head">
          <h2 className="food-modal__title" id="custom-food-title">
            {initial ? 'Edit custom food' : 'New custom food'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <form className="custom-food" onSubmit={handleSubmit}>
          <div className="diet-field">
            <label className="form-field__label" htmlFor="custom-food-name">
              Name
            </label>
            <input
              id="custom-food-name"
              className={`field${errors.name ? ' field--error' : ''}`}
              type="text"
              value={draft.name}
              maxLength={60}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="e.g. Homemade protein shake"
              aria-invalid={errors.name ? 'true' : undefined}
            />
            {errors.name && <p className="form-field__error">{errors.name}</p>}
          </div>

          <div className="custom-food__row">
            <div className="diet-field">
              <label className="form-field__label" htmlFor="custom-food-category">
                Category
              </label>
              <select
                id="custom-food-category"
                className="field"
                value={draft.category}
                onChange={(event) => updateField('category', event.target.value)}
              >
                {FOOD_CATEGORY_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="diet-field">
              <label className="form-field__label" htmlFor="custom-food-serving">
                Serving size
              </label>
              <input
                id="custom-food-serving"
                className={`field${errors.servingSize ? ' field--error' : ''}`}
                type="text"
                value={draft.servingSize}
                maxLength={40}
                onChange={(event) => updateField('servingSize', event.target.value)}
                placeholder="e.g. 100 g or 1 cup"
                aria-invalid={errors.servingSize ? 'true' : undefined}
              />
              {errors.servingSize && <p className="form-field__error">{errors.servingSize}</p>}
            </div>
          </div>

          <fieldset className="custom-food__numbers">
            <legend className="custom-food__legend">Per serving (approximate)</legend>

            <div className="custom-food__grid">
              <div className="diet-field">
                <label className="form-field__label" htmlFor="custom-food-calories">
                  Calories (kcal)
                </label>
                <input
                  id="custom-food-calories"
                  className={`field${errors.calories ? ' field--error' : ''}`}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  value={draft.calories}
                  onChange={(event) => updateField('calories', event.target.value)}
                  aria-invalid={errors.calories ? 'true' : undefined}
                />
              </div>

              <div className="diet-field">
                <label className="form-field__label" htmlFor="custom-food-protein">
                  Protein (g)
                </label>
                <input
                  id="custom-food-protein"
                  className="field"
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={draft.protein}
                  onChange={(event) => updateField('protein', event.target.value)}
                />
              </div>

              <div className="diet-field">
                <label className="form-field__label" htmlFor="custom-food-carbs">
                  Carbs (g)
                </label>
                <input
                  id="custom-food-carbs"
                  className="field"
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={draft.carbs}
                  onChange={(event) => updateField('carbs', event.target.value)}
                />
              </div>

              <div className="diet-field">
                <label className="form-field__label" htmlFor="custom-food-fats">
                  Fat (g)
                </label>
                <input
                  id="custom-food-fats"
                  className="field"
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={draft.fats}
                  onChange={(event) => updateField('fats', event.target.value)}
                />
              </div>
            </div>

            {errors.calories && <p className="form-field__error">{errors.calories}</p>}
            <p className="custom-food__note">
              Nothing is filled in for you — enter the values from your own label.
            </p>
          </fieldset>

          <div className="custom-food__actions">
            <Button type="submit" variant="primary">
              {initial ? 'Save changes' : 'Save food'}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {initial && onDelete && (
              <button
                type="button"
                className="link-button link-button--danger custom-food__delete"
                onClick={() => onDelete(initial)}
              >
                Delete this food
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomFoodForm
