import { WORKOUT_CATEGORIES } from '../../data/workoutCategories'

/**
 * Category tabs for the workout library.
 *
 * A radio-style tab list rather than page navigation: selecting one only
 * changes local state, so filtering never re-renders the route. The row scrolls
 * horizontally on narrow screens instead of wrapping into a tall wall of
 * buttons.
 *
 * @param {object} props
 * @param {string} props.value                 active category name, or 'All'
 * @param {(category: string) => void} props.onChange
 * @param {Record<string, number>} [props.counts]  workouts per category
 * @param {number} [props.total]                library size, shown on the All tab
 */
function WorkoutCategoryTabs({ value, onChange, counts = {}, total }) {
  const options = [
    { id: 'all', name: 'All', accent: 'var(--color-primary)' },
    ...WORKOUT_CATEGORIES,
  ]

  return (
    <div className="category-tabs" role="group" aria-label="Filter workouts by category">
      {options.map((option) => {
        const isActive = option.name === value
        const count = option.id === 'all' ? total : counts[option.name]

        return (
          <button
            key={option.id}
            type="button"
            className={isActive ? 'category-tab is-active' : 'category-tab'}
            aria-pressed={isActive}
            onClick={() => onChange(option.name)}
            style={isActive ? { '--tab-accent': option.accent } : undefined}
          >
            <span className="category-tab__name">{option.name}</span>
            {typeof count === 'number' && <span className="category-tab__count">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default WorkoutCategoryTabs