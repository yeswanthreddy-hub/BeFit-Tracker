/**
 * Horizontal bar list for a set of {name, count, percent} rows.
 *
 * Shared by the workout-category and muscle-group sections. Each row shows the
 * count and percentage as text, so the meaning never depends on the bar length
 * or colour alone.
 */
function StatBars({ items = [], unit = 'workouts' }) {
  if (items.length === 0) return null

  return (
    <ul className="stat-bars">
      {items.map((item) => (
        <li className="stat-bars__row" key={item.name}>
          <div className="stat-bars__head">
            <span className="stat-bars__name">{item.name}</span>
            <span className="stat-bars__value">
              {item.count} {item.count === 1 ? unit.replace(/s$/, '') : unit} · {item.percent}%
            </span>
          </div>
          <div
            className="progress stat-bars__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={item.percent}
            aria-label={`${item.name}: ${item.percent} percent`}
          >
            <div className="progress__fill stat-bars__fill" style={{ width: `${item.percent}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default StatBars
