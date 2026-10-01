/**
 * Weekly activity strip.
 *
 * Mon-Sun, driven entirely by real completion dates. Each day carries its own
 * label so the state is never communicated by colour alone, and today's marker
 * is a separate visual cue again.
 */
function WeeklyActivity({ days }) {
  const activeCount = days.filter((day) => day.isActive).length

  return (
    <section className="weekly-activity card" aria-labelledby="weekly-activity-heading">
      <div className="weekly-activity__head">
        <h2 className="weekly-activity__title" id="weekly-activity-heading">
          This week
        </h2>
        <p className="weekly-activity__count">
          {activeCount} of 7 days active
        </p>
      </div>

      <ol className="weekly-activity__days">
        {days.map((day) => (
          <li
            key={day.key}
            className={[
              'weekly-activity__day',
              day.isActive ? 'weekly-activity__day--active' : '',
              day.isToday ? 'weekly-activity__day--today' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="weekly-activity__bar" aria-hidden="true" />
            <span className="weekly-activity__label">{day.label}</span>
            <span className="visually-hidden">
              {day.isActive ? 'workout completed' : 'no workout'}
              {day.isToday ? ', today' : ''}
            </span>
            {day.isActive && (
              <span className="weekly-activity__check" aria-hidden="true">
                ✓
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

export default WeeklyActivity