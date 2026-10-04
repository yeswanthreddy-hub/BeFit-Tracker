import { useMemo, useState } from 'react'

import { EXERCISES } from '../../data/exercises'
import { EXERCISE_CATEGORY_NAMES } from '../../data/exerciseCategories'
import { exerciseSubtitle, getExercisesByCategory, searchExercises } from '../../utils/exercises'

/** Matches shown at once, so a blank search does not dump 38 rows into the page. */
const VISIBLE_LIMIT = 8

/**
 * Exercise picker for the workout builder.
 *
 * Reads the frozen exercise catalog directly rather than routing back to the
 * exercise library: building a plan means staying on one screen, and the
 * existing "Add to workout" button has already put an id in the selection.
 *
 * Exercises already in the plan stay listed but are marked, so the athlete can
 * see why a movement is unavailable instead of hunting for a hidden filter.
 *
 * @param {object} props
 * @param {string[]} [props.selectedIds] exercise ids already in the plan
 * @param {(exercise: object) => void} props.onAdd
 */
function ExercisePicker({ selectedIds = [], onAdd }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const results = useMemo(() => {
    const pool = category === 'All' ? EXERCISES : getExercisesByCategory(category)
    return searchExercises(pool, query)
  }, [category, query])

  const chosen = new Set(selectedIds)
  const visible = results.slice(0, VISIBLE_LIMIT)
  const hidden = results.length - visible.length

  return (
    <section className="picker" aria-labelledby="exercise-picker-heading">
      <h3 className="picker__heading" id="exercise-picker-heading">
        Add exercises
      </h3>

      <div className="picker__controls">
        <div className="picker__field">
          <label className="picker__label" htmlFor="builder-exercise-search">
            Search the catalog
          </label>
          <input
            id="builder-exercise-search"
            className="field"
            type="search"
            value={query}
            placeholder="Plank, chest, dumbbell&hellip;"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="picker__field">
          <label className="picker__label" htmlFor="builder-exercise-category">
            Body category
          </label>
          <select
            id="builder-exercise-category"
            className="field"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="All">All</option>
            {EXERCISE_CATEGORY_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="picker__count" role="status">
        {results.length} {results.length === 1 ? 'exercise' : 'exercises'} match
        {query.trim() !== '' && ` "${query.trim()}"`}
      </p>

      {visible.length > 0 ? (
        <ul className="picker__list">
          {visible.map((exercise) => {
            const isChosen = chosen.has(exercise.id)

            return (
              <li key={exercise.id} className="picker__item">
                <div className="picker__identity">
                  <p className="picker__name">{exercise.name}</p>
                  <p className="picker__meta">
                    {exerciseSubtitle(exercise)} &middot; {exercise.difficulty}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => onAdd(exercise)}
                  disabled={isChosen}
                >
                  {isChosen ? 'In workout' : 'Add'}
                  <span className="visually-hidden">
                    {isChosen
                      ? `${exercise.name} is already in this workout`
                      : `Add ${exercise.name} to this workout`}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="picker__empty">
          Nothing matches that search. Try a body category or a muscle name.
        </p>
      )}

      {hidden > 0 && (
        <p className="picker__more">
          {hidden} more {hidden === 1 ? 'exercise matches' : 'exercises match'} &mdash; narrow the
          search to see them.
        </p>
      )}
    </section>
  )
}

export default ExercisePicker