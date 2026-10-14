/**
 * Workout activity bar chart.
 *
 * One bar per bucket (day, week or month) counting real completions. Built from
 * plain divs and CSS so it needs no charting dependency, stays responsive, and
 * animates on load. A text alternative is always present for screen readers.
 */
function ActivityChart({ buckets = [], title = 'Workout activity' }) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0)
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count))
  const busiest = buckets.reduce(
    (best, bucket) => (bucket.count > best.count ? bucket : best),
    { label: '', count: 0 },
  )

  const summary = `${total} workout${total === 1 ? '' : 's'} in this range.`

  return (
    <figure className="activity-chart" aria-label={title}>
      <div className="activity-chart__bars" role="img" aria-label={summary}>
        {buckets.map((bucket, index) => (
          <div className="activity-chart__col" key={bucket.key ?? index}>
            <div className="activity-chart__track">
              <div
                className="activity-chart__bar"
                style={{
                  height: `${Math.max((bucket.count / max) * 100, bucket.count > 0 ? 6 : 2)}%`,
                  animationDelay: `${index * 24}ms`,
                }}
              >
                {bucket.count > 0 && (
                  <span className="activity-chart__count">{bucket.count}</span>
                )}
              </div>
            </div>
            <span className="activity-chart__label">{bucket.label}</span>
          </div>
        ))}
      </div>

      <figcaption className="activity-chart__legend">
        <span>{summary}</span>
        {busiest.count > 0 && (
          <span className="activity-chart__peak">
            Busiest: {busiest.label} ({busiest.count})
          </span>
        )}
      </figcaption>

      <ul className="visually-hidden">
        {buckets.map((bucket, index) => (
          <li key={bucket.key ?? index}>
            {bucket.label}: {bucket.count}
          </li>
        ))}
      </ul>
    </figure>
  )
}

export default ActivityChart
