import { useEffect, useMemo, useState } from 'react'

import SectionHeader from '../../components/ui/SectionHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import WorkoutCard from '../../components/workouts/WorkoutCard'
import WorkoutSearch from '../../components/workouts/WorkoutSearch'
import WorkoutFilters from '../../components/workouts/WorkoutFilters'
import WorkoutCategoryTabs from '../../components/workouts/WorkoutCategoryTabs'
import { WORKOUTS } from '../../data/workouts'
import { ANY_OPTION } from '../../data/workoutCategories'
import {
  DEFAULT_WORKOUT_FILTERS,
  countWorkoutsByCategory,
  filterWorkouts,
  isWorkoutQueryActive,
  searchWorkouts,
  workoutCountLabel,
} from '../../utils/workouts'
import './Workouts.css'

/**
 * BeFit workout library.
 *
 * Browsing is pure local state: choosing a category, typing a search term or
 * changing a filter re-derives the visible list without touching the router, so
 * filtering stays instant. The templates in `src/data/workouts.js` are frozen
 * and never mutated, and custom workouts saved in the builder are merged in by
 * the "My Workouts" section further down the page.
 */
function Workouts() {
  const [category, setCategory] = useState(ANY_OPTION)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_WORKOUT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // A new page starts at the top rather than inheriting the previous scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const counts = useMemo(() => countWorkoutsByCategory(WORKOUTS), [])

  // One derived value drives the grid: category and search first, then the
  // difficulty / goal / duration / equipment filters, all combined.
  const visible = useMemo(() => {
    const byCategory =
      category === ANY_OPTION
        ? [...WORKOUTS]
        : WORKOUTS.filter((workout) => workout.category === category)

    return filterWorkouts(searchWorkouts(byCategory, query), filters)
  }, [category, query, filters])

  const isFiltered = isWorkoutQueryActive(filters, query) || category !== ANY_OPTION

  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }))

  const resetFilters = () => {
    setCategory(ANY_OPTION)
    setQuery('')
    setFilters(DEFAULT_WORKOUT_FILTERS)
  }

  return (
    <div className="page workout-library">
      <SectionHeader
        eyebrow="Workout library"
        title="Workout Library"
        titleAs="h1"
        sub="Train smarter. Choose a plan that fits your goal."
        action={
          <p className="workout-library__total">
            <span className="workout-library__total-value">{WORKOUTS.length}</span> ready-made
            workouts
          </p>
        }
      />

      <div className="workout-library__controls card">
        <WorkoutSearch value={query} onChange={setQuery} />

        <WorkoutCategoryTabs
          value={category}
          onChange={setCategory}
          counts={counts}
          total={WORKOUTS.length}
        />

        <WorkoutFilters
          filters={filters}
          onChange={updateFilter}
          onReset={resetFilters}
          open={filtersOpen}
          onToggle={() => setFiltersOpen((open) => !open)}
        />
      </div>

      <div className="workout-library__summary">
        <p className="workout-library__count" role="status">
          {workoutCountLabel(visible.length, isFiltered)}
        </p>
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="workout-grid" key={gridSignature(category, query, filters)}>
          {visible.map((workout, index) => (
            <li key={workout.id} style={{ '--reveal-index': Math.min(index, 11) }}>
              <WorkoutCard workout={workout} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No workouts found"
          note="Try a different search, or clear your filters to see all 15 workouts again."
          action={
            <Button variant="secondary" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      )}
    </div>
  )
}

/**
 * Identity for the rendered grid.
 *
 * Keying on the active query replays the card entrance animation when the
 * result set changes, so filtering feels like a transition rather than a jump.
 */
function gridSignature(category, query, filters) {
  return [
    category,
    query.trim().toLowerCase(),
    ...Object.keys(DEFAULT_WORKOUT_FILTERS).map((key) => filters[key]),
  ].join('|')
}

export default Workouts