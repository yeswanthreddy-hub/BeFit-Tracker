import { useEffect, useMemo, useState } from 'react'

import SectionHeader from '../../components/ui/SectionHeader'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import WorkoutCard from '../../components/workouts/WorkoutCard'
import WorkoutSearch from '../../components/workouts/WorkoutSearch'
import WorkoutFilters from '../../components/workouts/WorkoutFilters'
import WorkoutCategoryTabs from '../../components/workouts/WorkoutCategoryTabs'
import { useCustomWorkouts } from '../../hooks/useCustomWorkouts'
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
 * and never mutated.
 *
 * The built-in grid below is filterable, and the "My Workouts" section further
 * down is not: it lists exactly what this account saved in the builder, so
 * filtering for "Beginner" never appears to delete your own plan. That section
 * is the only place custom workouts are read from storage, and it is also where
 * they can be edited or deleted.
 */
function Workouts() {
  const [category, setCategory] = useState(ANY_OPTION)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_WORKOUT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const { workouts: savedWorkouts, isEmpty, remove } = useCustomWorkouts()

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
          <div className="workout-library__header-actions">
            <p className="workout-library__total">
              <span className="workout-library__total-value">{WORKOUTS.length}</span> ready-made
              workouts
            </p>
            <Button to="/workouts/create" size="sm">
              Create workout
            </Button>
          </div>
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

      <section className="workout-library__mine" aria-labelledby="my-workouts-heading">
        <SectionHeader
          eyebrow="Saved on this device"
          title="My Workouts"
          titleAs="h2"
          titleId="my-workouts-heading"
          sub={
            isEmpty
              ? 'Anything you build is stored here, private to your account on this device.'
              : `${workoutCountLabel(savedWorkouts.length)} saved. Edit one or start prepping it.`
          }
          action={
            savedWorkouts.length > 0 ? (
              <Button to="/workouts/create" variant="secondary" size="sm">
                New workout
              </Button>
            ) : undefined
          }
        />

        {isEmpty ? (
          <EmptyState
            title="No saved workouts yet"
            note="Build a plan from the exercise library and it will wait for you here, on this device only."
            action={
              <Button to="/workouts/create">Create your first workout</Button>
            }
          />
        ) : (
          <ul className="workout-grid">
            {savedWorkouts.map((workout, index) => (
              <li key={workout.id} style={{ '--reveal-index': Math.min(index, 11) }}>
                <WorkoutCard
                  workout={workout}
                  isCustom
                  editHref={`/workouts/edit/${workout.id}`}
                  onDelete={() => setPendingDelete(workout)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? 'this workout'}?`}
        description="This removes the plan from this device. There is no undo, and the built-in templates are not affected."
        confirmLabel="Delete workout"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          remove(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
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