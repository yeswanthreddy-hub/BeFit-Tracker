import { Link } from 'react-router-dom'
import Button from '../ui/Button'

/**
 * Recent completed workouts, newest first.
 *
 * Empty state is the honest one: no history is invented, and the copy points at
 * what to do next. Once workouts are actually recorded the same component fills
 * in automatically.
 */
function RecentActivity({ items }) {
  return (
    <section className="recent-activity card" aria-labelledby="recent-activity-heading">
      <div className="recent-activity__head">
        <h2 className="recent-activity__title" id="recent-activity-heading">
          Recent activity
        </h2>
        {items.length > 0 && (
          <Link to="/completed" className="recent-activity__all">
            View all
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="recent-activity__empty">
          <p className="recent-activity__empty-title">No workouts completed yet.</p>
          <p className="recent-activity__empty-note">
            Your completed workouts will appear here.
          </p>
          <Button to="/workouts" variant="secondary" size="sm">
            Start your first workout
          </Button>
        </div>
      ) : (
        <ul className="recent-activity__list">
          {items.map((item) => (
            <li className="recent-activity__item" key={item.id}>
              <span className="recent-activity__badge" aria-hidden="true">
                {item.durationMinutes > 0 ? `${item.durationMinutes}` : '•'}
                {item.durationMinutes > 0 && <span className="recent-activity__badge-unit">min</span>}
              </span>
              <span className="recent-activity__body">
                <span className="recent-activity__name">{item.name}</span>
                <span className="recent-activity__meta">
                  {formatDate(item.date)}
                  {item.totalSets > 0 && ` · ${item.totalSets} sets`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default RecentActivity