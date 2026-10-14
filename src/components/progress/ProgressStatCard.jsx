/**
 * A single overview statistic.
 *
 * Purely presentational: the page computes every number and passes it in, so
 * the same card can show workouts, active days, streaks or training time
 * without knowing where the data came from. The icon is decorative and hidden
 * from assistive tech; the label carries the meaning.
 */
function ProgressStatCard({ title, value, label, icon, tone = 'plain' }) {
  return (
    <div className={`progress-stat progress-stat--${tone} card`}>
      <div className="progress-stat__head">
        <span className="progress-stat__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="progress-stat__title">{title}</span>
      </div>
      <div className="progress-stat__value">{value}</div>
      {label && <div className="progress-stat__label">{label}</div>}
    </div>
  )
}

export default ProgressStatCard
