import { useMemo, useState } from 'react'

import PageContainer from '../../components/ui/PageContainer'
import SectionHeader from '../../components/ui/SectionHeader'
import Button from '../../components/ui/Button'
import DailyNutritionSummary from '../../components/diet/DailyNutritionSummary'
import MealSection from '../../components/diet/MealSection'
import { useFoodLog } from '../../hooks/useFoodLog'
import { useNutritionProfile } from '../../hooks/useNutritionProfile'
import {
  MEALS,
  NUTRITION_DISCLAIMER,
  groupEntriesByMeal,
  summariseDay,
} from '../../utils/nutrition'
import './Diet.css'

/** "Today" / "Yesterday" / "Monday 12 Oct" for the selected day. */
function dayLabel(date) {
  const today = new Date()
  const sameDay = (a, b) => a.toDateString() === b.toDateString()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (sameDay(date, today)) return 'Today'
  if (sameDay(date, yesterday)) return 'Yesterday'

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

/** Shift a date by whole days without mutating the original. */
function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

/** A general starting-point calorie target for an onboarding goal. */
function suggestedCalories(goal) {
  const RULES = {
    'Lose Weight': 1800,
    'Build Muscle': 2600,
    'Improve Strength': 2400,
    'Improve Endurance': 2400,
    'General Fitness': 2200,
  }
  return RULES[goal] ?? 2200
}

/**
 * Food & diet tracker.
 *
 * The day's meals, totals and targets, built entirely from the athlete's stored
 * food log. Everything is scoped to the signed-in account by `useFoodLog`, and
 * every number is an estimate from approximate food values rather than an exact
 * measurement — said plainly on the page so it is never mistaken for medical
 * advice.
 *
 * `useFoodLog` and the summary helpers do the maths, so this page cannot
 * disagree with the dashboard's nutrition card.
 */
function Diet() {
  const { entries } = useFoodLog()
  const { profile, save } = useNutritionProfile()

  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [calorieInput, setCalorieInput] = useState(() =>
    profile.dailyCalorieTarget > 0 ? String(profile.dailyCalorieTarget) : '',
  )
  const [proteinInput, setProteinInput] = useState(() =>
    profile.dailyProteinTarget > 0 ? String(profile.dailyProteinTarget) : '',
  )

  const groups = useMemo(
    () => groupEntriesByMeal(entries, selectedDate),
    [entries, selectedDate],
  )
  const summary = useMemo(
    () => summariseDay(entries, profile, selectedDate),
    [entries, profile, selectedDate],
  )

  const isToday = selectedDate.toDateString() === new Date().toDateString()

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
    setCalorieInput(String(suggestedCalories(profile?.fitnessGoal)))
  }

  return (
    <PageContainer className="diet">
      <SectionHeader
        eyebrow="Nutrition"
        title="Food & diet"
        sub="Log what you eat, watch your macros and keep the day on target. All values are estimates."
      />

      <div className="diet__datebar" role="group" aria-label="Select a day">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDate((date) => addDays(date, -1))}
        >
          ← Previous
        </Button>
        <p className="diet__date" aria-live="polite">
          {dayLabel(selectedDate)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDate((date) => addDays(date, 1))}
        >
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
              Optional. Set your own numbers to see what is left. Leave a field
              blank to skip it.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={useSuggestion}>
            Use a suggested start
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
          A suggested start is a general guide based on your goal, not a personal
          plan — adjust it to your own needs.
        </p>
      </section>

      <section aria-labelledby="diet-meals-title">
        <h2 className="diet__meals-title" id="diet-meals-title">
          {isToday ? "Today's meals" : `Meals · ${dayLabel(selectedDate)}`}
        </h2>
        <div className="diet__meals">
          {MEALS.map((meal) => (
            <MealSection key={meal} meal={meal} entries={groups[meal]} />
          ))}
        </div>
      </section>

      <p className="diet__disclaimer">{NUTRITION_DISCLAIMER}</p>
    </PageContainer>
  )
}

export default Diet
