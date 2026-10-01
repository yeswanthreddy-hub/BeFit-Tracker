/**
 * Today's fitness summary.
 *
 * A compact read-out of what actually happened, straight from stored records.
 * A brand-new account legitimately has zeroes everywhere, so the tiles read
 * "0" and the strip says so explicitly rather than inventing numbers.
 */
function TodaySummary({ todayCount, streak, weekCount, totalCount }) {
  const tiles = [
    {
      key: 'today',
      label: "Today's workout",
      value: todayCount,
      suffix: todayCount === 1 ? 'session done' : 'sessions done',
      tone: 'primary',
    },
    {
      key: 'streak',
      label: 'Workout streak',
      value: streak,
      suffix: streak === 1 ? 'day' : 'days',
      tone: 'accent',
    },
    {
      key: 'week',
      label: 'Weekly workouts',
      value: weekCount,
      suffix: weekCount === 1 ? 'this week' : 'this week',
      tone: 'plain',
    },
    {
      key: 'total',
      label: 'Completed workouts',
      value: totalCount,
      suffix: 'all time',
      tone: 'plain',
    },
  ]

  return (
    <section className="today-summary" aria-labelledby="today-summary-heading">
      <h2 className="today-summary__heading" id="today-summary-heading">
        Today&apos;s summary
      </h2>

      <dl className="today-summary__tiles">
        {tiles.map((tile) => (
          <div className={`today-summary__tile today-summary__tile--${tile.tone}`} key={tile.key}>
            <dt className="today-summary__label">{tile.label}</dt>
            <dd className="today-summary__value">
              {tile.value}
              <span className="today-summary__suffix">{tile.suffix}</span>
            </dd>
          </div>
        ))}
      </dl>

      {totalCount === 0 && (
        <p className="today-summary__note">
          Nothing recorded yet — your numbers appear here the moment you finish a
          workout.
        </p>
      )}
    </section>
  )
}

export default TodaySummary