import { Link } from 'react-router-dom'
import Button from '../ui/Button'

/**
 * Progress overview.
 *
 * Shows weekly sessions, total sessions, training time and tracked weight —
 * each only when there is real data behind it. With nothing recorded the card
 * says "No workout data yet" and offers the next action instead of printing a
 * misleading zero next to a bar chart.
 */
function ProgressOverview({ weekCount, totals }) {
  const { totalWorkouts, totalMinutes, latestWeightKg, weightChangeKg } = totals
  const hasWorkoutData = totalWorkouts > 0
  const hasWeightData = latestWeightKg !== null

  const weeklyGoal = 3
  const weekRatio = Math.min(weekCount / weeklyGoal, 1)

  return (
    <section className="progress-overview card" aria-labelledby="progress-overview-heading">
      <div className="progress-overview__head">
        <h2 className="progress-overview__title" id="progress-overview-heading">
          Progress
        </h2>
        <Link to="/progress" className="progress-overview__all">
          Full progress →
        </Link>
      </div>

      {!hasWorkoutData ? (
        <div className="progress-overview__empty">
          <p className="progress-overview__empty-title">No workout data yet</p>
          <p className="progress-overview__empty-note">
            Finish your first session and BeFit starts tracking sessions, time and
            streaks from there.
          </p>
          <Button to="/workouts" variant="primary" size="sm">
            Start your first workout
          </Button>
        </div>
      ) : (
        <>
          <div className="progress-overview__meter">
            <div className="progress-overview__meter-head">
              <span className="progress-overview__meter-label">Weekly target</span>
              <span className="progress-overview__meter-value">
                {weekCount} / {weeklyGoal} sessions
              </span>
            </div>
            <div
              className="progress progress-overview__bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={weeklyGoal}
              aria-valuenow={weekCount}
              aria-label="Sessions completed this week"
            >
              <div className="progress__fill progress-overview__bar-fill" style={{ width: `${weekRatio * 100}%` }} />
            </div>
          </div>

          <dl className="progress-overview__grid">
            <div className="progress-overview__metric">
              <dt>Weekly workouts</dt>
              <dd>{weekCount}</dd>
            </div>
            <div className="progress-overview__metric">
              <dt>Total workouts</dt>
              <dd>{totalWorkouts}</dd>
            </div>
            <div className="progress-overview__metric">
              <dt>Training time</dt>
              <dd>{totalMinutes > 0 ? `${totalMinutes} min` : '—'}</dd>
            </div>
            <div className="progress-overview__metric">
              <dt>Latest weight</dt>
              <dd>
                {hasWeightData ? `${latestWeightKg} kg` : '—'}
                {weightChangeKg !== null && (
                  <span
                    className={`progress-overview__delta${
                      weightChangeKg <= 0 ? ' progress-overview__delta--down' : ' progress-overview__delta--up'
                    }`}
                  >
                    {weightChangeKg > 0 ? '+' : ''}
                    {weightChangeKg} kg
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </>
      )}
    </section>
  )
}

export default ProgressOverview