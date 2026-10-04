/**
 * Library search field.
 *
 * Search spans the exercise name, target and secondary muscles, category,
 * equipment and type, so "chest", "bodyweight" and "hamstring" all find
 * something useful. The label is visible rather than screen-reader-only
 * because a bare search box is ambiguous next to the filter controls.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 */
function ExerciseSearch({ value, onChange }) {
  return (
    <div className="exercise-search">
      <label className="exercise-search__label" htmlFor="exercise-search">
        Search exercises
      </label>
      <div className="exercise-search__field">
        <span className="exercise-search__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          id="exercise-search"
          className="field"
          type="search"
          placeholder="Try “chest”, “bodyweight” or “hamstring”"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
        />
      </div>
    </div>
  )
}

export default ExerciseSearch