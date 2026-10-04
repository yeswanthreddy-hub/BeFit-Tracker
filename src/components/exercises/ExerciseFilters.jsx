import { EXERCISE_DIFFICULTIES, EXERCISE_EQUIPMENT, EXERCISE_TYPES } from '../../data/exercises'
import { ANY_OPTION, activeFilterCount } from '../../utils/exercises'

/**
 * Difficulty, equipment and type selects for the library.
 *
 * Desktop shows the three selects inline. On narrow screens they collapse
 * behind a single "Filters" button so the library stays usable at 360px — the
 * button carries the active count, and the panel is a short stack rather than
 * a full-screen drawer. Native <select> elements keep the keyboard and screen
 * reader behaviour people already expect.
 */

const FIELDS = [
  { name: 'difficulty', label: 'Difficulty', options: EXERCISE_DIFFICULTIES },
  { name: 'equipment', label: 'Equipment', options: EXERCISE_EQUIPMENT },
  { name: 'type', label: 'Exercise type', options: EXERCISE_TYPES },
]

function FilterSelect({ id, label, value, options, onChange }) {
  return (
    <div className="exercise-filters__field">
      <label className="exercise-filters__label" htmlFor={id}>
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

function ExerciseFilters({ filters, onChange, onReset, open, onToggle }) {
  const active = activeFilterCount(filters)

  const setValue = (name) => (event) => onChange(name, event.target.value)

  return (
    <section className={open ? 'exercise-filters is-open' : 'exercise-filters'}>
      <button
        type="button"
        className="exercise-filters__toggle"
        aria-expanded={open}
        aria-controls="exercise-filter-fields"
        onClick={onToggle}
      >
        <span>Filters</span>
        {active > 0 && (
          <span className="exercise-filters__badge">
            {active}
            <span className="visually-hidden"> filters applied</span>
          </span>
        )}
        <span className="exercise-filters__chevron" aria-hidden="true" />
      </button>

      <div className="exercise-filters__fields" id="exercise-filter-fields">
        {FIELDS.map((field) => (
          <FilterSelect
            key={field.name}
            id={`exercise-filter-${field.name}`}
            label={field.label}
            value={filters[field.name]}
            options={field.options}
            onChange={setValue(field.name)}
          />
        ))}

        <button
          type="button"
          className="btn btn--ghost btn--sm exercise-filters__reset"
          onClick={onReset}
          disabled={active === 0}
        >
          Reset filters
        </button>
      </div>
    </section>
  )
}

export default ExerciseFilters