import {
  ANY_OPTION,
  WORKOUT_DIFFICULTIES,
  WORKOUT_DURATIONS,
  WORKOUT_EQUIPMENT,
  WORKOUT_GOALS,
} from '../../data/workoutCategories'
import { activeWorkoutFilterCount } from '../../utils/workouts'

/**
 * Difficulty, goal, duration and equipment selects for the workout library.
 *
 * Desktop shows the four selects inline. On narrow screens they collapse behind
 * a single "Filters" button that carries the active count, so the library stays
 * usable at 360px. Native <select> elements keep the keyboard and screen reader
 * behaviour people already expect.
 *
 * The filters combine with AND, so "Beginner + General Fitness + No Equipment"
 * narrows the grid to the plans that match all three.
 */

const FIELDS = [
  { name: 'difficulty', label: 'Difficulty', options: WORKOUT_DIFFICULTIES },
  { name: 'goal', label: 'Goal', options: WORKOUT_GOALS },
  { name: 'duration', label: 'Duration', options: WORKOUT_DURATIONS },
  { name: 'equipment', label: 'Equipment', options: WORKOUT_EQUIPMENT },
]

function FilterSelect({ id, label, value, options, onChange }) {
  return (
    <div className="workout-filters__field">
      <label className="workout-filters__label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value={ANY_OPTION}>{ANY_OPTION}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function WorkoutFilters({ filters, onChange, onReset, open, onToggle }) {
  const active = activeWorkoutFilterCount(filters)

  const setValue = (name) => (event) => onChange(name, event.target.value)

  return (
    <section className={open ? 'workout-filters is-open' : 'workout-filters'}>
      <button
        type="button"
        className="workout-filters__toggle"
        aria-expanded={open}
        aria-controls="workout-filter-fields"
        onClick={onToggle}
      >
        <span>Filters</span>
        {active > 0 && (
          <span className="workout-filters__badge">
            {active}
            <span className="visually-hidden"> filters applied</span>
          </span>
        )}
        <span className="workout-filters__chevron" aria-hidden="true" />
      </button>

      <div className="workout-filters__fields" id="workout-filter-fields">
        {FIELDS.map((field) => (
          <FilterSelect
            key={field.name}
            id={`workout-filter-${field.name}`}
            label={field.label}
            value={filters[field.name]}
            options={field.options}
            onChange={setValue(field.name)}
          />
        ))}

        <button
          type="button"
          className="btn btn--ghost btn--sm workout-filters__reset"
          onClick={onReset}
          disabled={active === 0}
        >
          Reset filters
        </button>
      </div>
    </section>
  )
}

export default WorkoutFilters