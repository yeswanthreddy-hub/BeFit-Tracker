/**
 * Workout library search field.
 *
 * Search spans the workout name, category, goal, equipment, target muscles and
 * description, so "core", "dumbbell" and "no equipment" all find something
 * useful. The label is visible rather than screen-reader-only because a bare
 * search box is ambiguous next to the filter controls.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 */
function WorkoutSearch({ value, onChange }) {
  return (
    <div className="workout-search">
      <label className="workout-search__label" htmlFor="workout-search">
        Search workouts
      </label>
      <div className="workout-search__field">
        <input
          id="workout-search"
          className="field"
          type="search"
          placeholder="Search workouts..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
        />
      </div>
    </div>
  )
}

export default WorkoutSearch