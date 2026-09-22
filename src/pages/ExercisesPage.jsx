import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { sampleExercises } from '../data/sampleData'
import { EXERCISE_CATEGORIES } from '../data/models'

const ALL = 'All'

function ExercisesPage() {
  const location = useLocation()
  const [category, setCategory] = useState(
    location.state?.category && EXERCISE_CATEGORIES.includes(location.state.category)
      ? location.state.category
      : ALL,
  )
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return sampleExercises.filter((exercise) => {
      const matchesCategory = category === ALL || exercise.category === category
      const matchesQuery =
        term === '' || exercise.name.toLowerCase().includes(term)
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  const resetFilters = () => {
    setCategory(ALL)
    setQuery('')
  }

  return (
    <div className="page">
      <SectionHeader
        eyebrow="Exercise library"
        title="Find your next lift"
        sub="A small but growing catalog built on a scalable structure."
      />

      <div className="toolbar">
        <div className="toolbar__search">
          <label className="visually-hidden" htmlFor="exercise-search">
            Search exercises
          </label>
          <input
            id="exercise-search"
            className="field"
            type="search"
            placeholder="Search exercises…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="chip-group">
          {[ALL, ...EXERCISE_CATEGORIES].map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? 'chip chip--filter is-active' : 'chip chip--filter'}
              aria-pressed={item === category}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="grid grid--cols-3">
          {visible.map((exercise) => (
            <Link
              key={exercise.id}
              to={`/exercises/${exercise.id}`}
              className="card card--hover exercise-card"
            >
              <div className="exercise-card__top">
                <span className="chip chip--primary">{exercise.category}</span>
                <span className="chip">{exercise.difficulty}</span>
              </div>
              <h3 className="card__title">{exercise.name}</h3>
              <p className="exercise-card__meta">
                {exercise.muscleGroup} · {exercise.equipment}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No exercises found"
          note={`Nothing matches "${query}" in ${category}. Try a different term or clear the filters.`}
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