/**
 * Weekly workout consistency.
 *
 * Monday to Sunday, driven entirely by real completion dates. Each day states
 * its own status in text (not colour alone) and marks today separately.
 */
function WorkoutConsistency({ days = [] }) {
  const activeCount = days.filter((day) => day.isActive).length

  return (
    <section className="consistency card" aria-labelledby="consistency-heading">
      <div className="consistency__head">
        <div>
          <h2 className="consistency__title" id="consistency-heading">
            Workout consistency
          </h2>
          <p className="consistency__note">
            {activeCount} of 7 days active this week
          </p>
        </div>
        <span className="consistency__badge" aria-hidden="true">
          {activeCount}/7
        </span>
      </div>

      <ol className="consistency__days">
        {days.map((day) => (
          <li
            key={day.key}
            className={[
              'consistency__day',
              day.isActive ? 'consistency__day--active' : '',
              day.isToday ? 'consistency__day--today' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="consistency__dot" aria-hidden="true">
              {day.isActive ? '●' : '○'}
            </span>
            <span className="consistency__label" aria-hidden="true">
              {day.label.charAt(0)}
            </span>
            <span className="visually-hidden">
              {day.label}: {day.isActive ? 'workout completed' : 'no workout'}
              {day.isToday ? ', today' : ''}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default WorkoutConsistency
