/**
 * Streak display.
 *
 * Values come from `calculateStreak`, which derives them from real completed
 * workout dates. A new account shows a genuine 0 — there is no seeded or
 * assumed streak anywhere in BeFit.
 */
function StreakCard({ current, best, lastWorkoutDate }) {
  const hasStreak = current > 0
  const circumference = 2 * Math.PI * 46
  // Progress fills up to a 14-day reference so the ring stays readable at any
  // realistic streak length instead of always looking full.
  const ratio = Math.min(current / 14, 1)
  const offset = circumference * (1 - ratio)

  return (
    <section className="streak-card card" aria-labelledby="streak-heading">
      <div className="streak-card__head">
        <span className="streak-card__flame" aria-hidden="true">
          🔥
        </span>
        <div>
          <h2 className="streak-card__title" id="streak-heading">
            {current} Day Streak
          </h2>
          <p className="streak-card__sub">
            {hasStreak
              ? 'Keep it alive — train today to extend it.'
              : 'Complete a workout today to start your streak.'}
          </p>
        </div>
      </div>

      <div className="streak-card__body">
        <div className="streak-card__ring-wrap">
          <svg
            className="streak-card__ring"
            viewBox="0 0 110 110"
            role="img"
            aria-label={`${current} day current streak, ${best} day best streak`}
          >
            <circle className="streak-card__ring-track" cx="55" cy="55" r="46" />
            <circle
              className="streak-card__ring-fill"
              cx="55"
              cy="55"
              r="46"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="streak-card__ring-value" aria-hidden="true">
            {current}
          </span>
        </div>

        <dl className="streak-card__stats">
          <div className="streak-card__stat">
            <dt>Best streak</dt>
            <dd>{best} {best === 1 ? 'day' : 'days'}</dd>
          </div>
          <div className="streak-card__stat">
            <dt>Last workout</dt>
            <dd>{lastWorkoutDate ? formatDay(lastWorkoutDate) : 'None yet'}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

/** Short, locale-aware day label such as "1 Oct". */
function formatDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export default StreakCard