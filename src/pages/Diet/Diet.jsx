import { useMemo, useState } from 'react'

import PageContainer from '../../components/ui/PageContainer'
import SectionHeader from '../../components/ui/SectionHeader'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import DailyNutritionSummary from '../../components/diet/DailyNutritionSummary'
import MealSection from '../../components/diet/MealSection'
import AddFoodModal from '../../components/diet/AddFoodModal'
import CustomFoodForm from '../../components/diet/CustomFoodForm'
import NutritionHistory from '../../components/diet/NutritionHistory'
import { useFoodLog } from '../../hooks/useFoodLog'
import { useCustomFoods } from '../../hooks/useCustomFoods'
import { useNutritionProfile } from '../../hooks/useNutritionProfile'
import { FOODS } from '../../data/foods'
import { MEALS, NUTRITION_DISCLAIMER, groupEntriesByMeal, summariseDay } from '../../utils/nutrition'

// Track a few recently logged foods so users can jump back to something they just ate.
const MAX_RECENT_FOODS = 8

/**
 * Food & diet tracker.
 *
 * One page that owns the whole logging loop: pick a day, see the totals,
 * browse the food library, add a food to a meal, and manage the athlete's own
 * foods. Everything is scoped to the signed-in account by `useFoodLog` and
 * `useCustomFoods`, and every number is an estimate from approximate food
 * values rather than an exact measurement — said plainly on the page so it is
 * never mistaken for medical advice.
 *
 * The summaries come from `summariseDay`, so this page cannot disagree with the
 * dashboard's nutrition card.
 */
function Diet() {
  const { entries, addFood, removeEntry } = useFoodLog()
  const { foods: customFoods, create, update, remove } = useCustomFoods()
  const { profile, save } = useNutritionProfile()

  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [calorieInput, setCalorieInput] = useState(() =>
    profile.dailyCalorieTarget > 0 ? String(profile.dailyCalorieTarget) : '',
  )
  const [proteinInput, setProteinInput] = useState(() =>
    profile.dailyProteinTarget > 0 ? String(profile.dailyProteinTarget) : '',
  )

  const [addOpen, setAddOpen] = useState(false)
  const [addMeal, setAddMeal] = useState(MEALS[0])
  const [customOpen, setCustomOpen] = useState(false)
  const [editingCustom, setEditingCustom] = useState(null)
  const [returnToAdd, setReturnToAdd] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const allFoods = useMemo(() => [...customFoods, ...FOODS], [customFoods])

  const recentFoods = useMemo(() => {
    const seen = new Set()
    const recent = []
    for (let index = entries.length - 1; index >= 0 && recent.length < MAX_RECENT_FOODS; index -= 1) {
      const entry = entries[index]
      if (!entry.foodId || seen.has(entry.foodId)) continue
      const food = allFoods.find((item) => item.id === entry.foodId)
      if (!food) continue
      seen.add(entry.foodId)
      recent.push(food)
    }
    return recent
  }, [entries, allFoods])

  const groups = useMemo(
    () => groupEntriesByMeal(entries, selectedDate),
    [entries, selectedDate],
  )
  const summary = useMemo(
    () => summariseDay(entries, profile, selectedDate),
    [entries, profile, selectedDate],
  )

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  const shiftDay = (days) =>
    setSelectedDate((date) => {
      const next = new Date(date)
      next.setDate(next.getDate() + days)
      return next
    })

  const dayLabel = isToday
    ? 'Today'
    : selectedDate.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })

  const saveTargets = (event) => {
    event.preventDefault()
    const clean = (value) => {
      const number = Number(value)
      return Number.isFinite(number) && number > 0 ? number : 0
    }
    save({
      dailyCalorieTarget: clean(calorieInput),
      dailyProteinTarget: clean(proteinInput),
    })
  }

  const useSuggestion = () => {
    const RULES = {
      'Lose Weight': 1800,
      'Build Muscle': 2600,
      'Improve Strength': 2400,
      'Improve Endurance': 2400,
      'General Fitness': 2200,
    }
    setCalorieInput(String(RULES[profile?.fitnessGoal] ?? 2200))
  }

  const openAdd = (meal) => {
    setAddMeal(meal)
    setReturnToAdd(false)
    setAddOpen(true)
  }

  const handleAdd = ({ food, meal, servings }) => {
    addFood({ food, meal, servings, date: selectedDate })
  }

  const openCustomFromAdd = (food) => {
    setAddOpen(false)
    setEditingCustom(food)
    setReturnToAdd(true)
    setCustomOpen(true)
  }

  const openCustomNew = () => {
    setAddOpen(false)
    setEditingCustom(null)
    setReturnToAdd(true)
    setCustomOpen(true)
  }

  const handleSaveCustom = (draft) => {
    const saved = editingCustom ? update(editingCustom.id, draft) : create(draft)
    if (saved && returnToAdd) setAddOpen(true)
    return Boolean(saved)
  }

  const requestDeleteCustom = (food) => {
    setAddOpen(false)
    setCustomOpen(false)
    setPendingDelete(food)
  }

  const confirmDeleteCustom = () => {
    if (pendingDelete) remove(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <PageContainer className="diet">
      <SectionHeader
        eyebrow="Nutrition"
        title="Food & diet"
        sub="Log what you eat, watch your macros and keep the day on target. All values are estimates."
      />

      <div className="diet__datebar" role="group" aria-label="Select a day">
        <Button variant="ghost" size="sm" onClick={() => shiftDay(-1)}>
          ← Previous
        </Button>
        <p className="diet__date" aria-live="polite">
          {dayLabel}
        </p>
        <Button variant="ghost" size="sm" onClick={() => shiftDay(1)}>
          Next →
        </Button>
        {!isToday && (
          <Button variant="secondary" size="sm" onClick={() => setSelectedDate(new Date())}>
            Today
          </Button>
        )}
      </div>

      <DailyNutritionSummary summary={summary} />

      <section className="diet-targets card" aria-labelledby="diet-targets-title">
        <div className="diet-targets__head">
          <div>
            <h2 className="diet-targets__title" id="diet-targets-title">
              Daily targets
            </h2>
            <p className="diet-targets__note">
              Optional. Set a target to see what is left for the day — adjust it to your own needs.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={useSuggestion}>
            Suggest a calorie target
          </Button>
        </div>

        <form className="diet-targets__form" onSubmit={saveTargets}>
          <div className="diet-field">
            <label className="form-field__label" htmlFor="diet-calorie-target">
              Daily calorie target
            </label>
            <input
              id="diet-calorie-target"
              className="field"
              type="number"
              min="0"
              step="10"
              inputMode="numeric"
              placeholder="e.g. 2200"
              value={calorieInput}
              onChange={(event) => setCalorieInput(event.target.value)}
            />
          </div>

          <div className="diet-field">
            <label className="form-field__label" htmlFor="diet-protein-target">
              Daily protein target (g)
            </label>
            <input
              id="diet-protein-target"
              className="field"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="e.g. 130"
              value={proteinInput}
              onChange={(event) => setProteinInput(event.target.value)}
            />
          </div>

          <div className="diet-targets__actions">
            <Button type="submit" variant="primary">
              Save targets
            </Button>
          </div>
        </form>

        <p className="diet-targets__disclaimer">
          A suggested target is a general guide based on your goal, not a personal plan.
        </p>
      </section>

      <section aria-labelledby="diet-meals-title">
        <h2 className="diet__meals-title" id="diet-meals-title">
          {isToday ? "Today's meals" : `Meals · ${dayLabel}`}
        </h2>
        <div className="diet__meals">
          {Object.keys(groups).map((meal) => (
            <MealSection
              key={meal}
              meal={meal}
              entries={groups[meal]}
              onAdd={openAdd}
              onRemove={removeEntry}
            />
          ))}
        </div>
      </section>

      <NutritionHistory entries={entries} profile={profile} days={7} />

      {addOpen && (
        <AddFoodModal
          defaultMeal={addMeal}
          foods={allFoods}
          recentFoods={recentFoods}
          onClose={() => setAddOpen(false)}
          onAdd={handleAdd}
          onNewCustomFood={openCustomNew}
          onEditCustomFood={openCustomFromAdd}
          onDeleteCustomFood={requestDeleteCustom}
        />
      )}

      {customOpen && (
        <CustomFoodForm
          initial={editingCustom}
          onClose={() => setCustomOpen(false)}
          onSubmit={handleSaveCustom}
          onDelete={requestDeleteCustom}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this custom food?"
        description={
          pendingDelete
            ? `${pendingDelete.name} will be removed from your saved foods. Meals you already logged with it are kept.`
            : ''
        }
        confirmLabel="Delete food"
        onConfirm={confirmDeleteCustom}
        onCancel={() => setPendingDelete(null)}
      />

      <p className="diet__disclaimer">{NUTRITION_DISCLAIMER}</p>
    </PageContainer>
  )
}

export default Diet
