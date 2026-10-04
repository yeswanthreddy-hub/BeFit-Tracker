import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ExerciseCard from '../components/exercises/ExerciseCard'
import ExerciseSearch from '../components/exercises/ExerciseSearch'
import ExerciseFilters from '../components/exercises/ExerciseFilters'
import CategorySelector from '../components/exercises/CategorySelector'
import { EXERCISES } from '../data/exercises'
import { EXERCISE_CATEGORY_NAMES, countExercisesByCategory } from '../data/exerciseCategories'
import {
  ANY_OPTION,
  DEFAULT_FILTERS,
  EXERCISE_FILTERS,
  exerciseCountLabel,
  filterExercises,
  isExerciseQueryActive,
  searchExercises,
} from '../utils/exercises'

/**
 * BeFit exercise library.
 *
 * All state is local: choosing a category, typing a search term or changing a
 * filter re-derives the visible list without touching the router, so browsing
 * stays instant. The source catalog in `src/data/exercises.js` is never
 * mutated — only the derived view changes.
 */
function ExercisesPage() {
  const location = useLocation()

  // The landing page links here with a category in the router state, which is
  // how a category tile can preselect a filter.
  const requested = location.state?.category
  const [category, setCategory] = useState(
    EXERCISE_CATEGORY_NAMES.includes(requested) ? requested : ANY_OPTION,
  )
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // A new page starts at the top rather than inheriting the previous scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const counts = useMemo(() => countExercisesByCategory(EXERCISES), [])

  // One derived value drives the grid: category and search first, then the
  // difficulty / equipment / type filters, all combined.
  const visible = useMemo(() => {
    const byCategory =
      category === ANY_OPTION
        ? [...EXERCISES]
        : EXERCISES.filter((item) => item.category === category)

    return filterExercises(searchExercises(byCategory, query), filters)
  }, [category, query, filters])

  const isFiltered = isExerciseQueryActive(filters, query) || category !== ANY_OPTION

  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }))

  const resetFilters = () => {
    setCategory(ANY_OPTION)
    setQuery('')
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <div className="page exercise-library">
      <SectionHeader
        eyebrow="Exercise library"
        title="Explore Exercises"
        sub="Find movements that fit your goals, experience and workout style."
      />

      <div className="exercise-library__controls card">
        <ExerciseSearch value={query} onChange={setQuery} />

        <CategorySelector
          value={category}
          onChange={setCategory}
          counts={counts}
          total={EXERCISES.length}
        />

        <ExerciseFilters
          filters={filters}
          onChange={updateFilter}
          onReset={resetFilters}
          open={filtersOpen}
          onToggle={() => setFiltersOpen((open) => !open)}
        />
      </div>

      <div className="exercise-library__summary">
        <p className="exercise-library__count" role="status">
          {exerciseCountLabel(visible.length, isFiltered)}
        </p>
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="exercise-grid" key={gridSignature(category, query, filters)}>
          {visible.map((exercise, index) => (
            <li key={exercise.id} style={{ '--reveal-index': Math.min(index, 11) }}>
              <ExerciseCard exercise={exercise} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No exercises found"
          note="Try a different search or clear your filters to see the whole library again."
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
  return [category, query.trim().toLowerCase(), ...EXERCISE_FILTERS.map((name) => filters[name])].join(
    '|',
  )
}

export default ExercisesPage