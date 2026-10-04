import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ExerciseCard from '../components/exercises/ExerciseCard'
import ExerciseSearch from '../components/exercises/ExerciseSearch'
import CategorySelector from '../components/exercises/CategorySelector'
import { EXERCISES } from '../data/exercises'
import { EXERCISE_CATEGORY_NAMES, countExercisesByCategory } from '../data/exerciseCategories'
import { exerciseCountLabel, searchExercises } from '../utils/exercises'

const ALL = 'All'

/**
 * BeFit exercise library.
 *
 * All state is local: choosing a category or typing a search term re-derives
 * the visible list without touching the router, so browsing stays instant.
 * The source catalog in `src/data/exercises.js` is never mutated — only the
 * derived view changes.
 */
function ExercisesPage() {
  const location = useLocation()

  // The landing page links here with a category in the router state, which is
  // how a category tile can preselect a filter.
  const requested = location.state?.category
  const [category, setCategory] = useState(
    EXERCISE_CATEGORY_NAMES.includes(requested) ? requested : ALL,
  )
  const [query, setQuery] = useState('')

  const counts = useMemo(() => countExercisesByCategory(EXERCISES), [])

  const visible = useMemo(() => {
    const byCategory =
      category === ALL ? [...EXERCISES] : EXERCISES.filter((item) => item.category === category)
    return searchExercises(byCategory, query)
  }, [category, query])

  const isFiltered = category !== ALL || query.trim() !== ''

  const resetFilters = () => {
    setCategory(ALL)
    setQuery('')
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
        <ul className="exercise-grid" key={`${category}|${query.trim().toLowerCase()}`}>
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

export default ExercisesPage