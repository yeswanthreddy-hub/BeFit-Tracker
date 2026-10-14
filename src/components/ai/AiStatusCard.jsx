import { getDisplayName } from '../../utils/user'

/**
 * A snapshot of the coaching context.
 *
 * Two rows: the onboarding profile (goal, experience, session length) and a few
 * honest headline numbers taken from the same records the rest of the app uses.
 * Zeros are shown as zeros rather than hidden, so a new athlete sees exactly
 * where they are starting from.
 */
function AiStatusCard({ user, profile, snapshot }) {
  const firstName = getDisplayName(user)
  const duration = Number(profile?.preferredWorkoutDuration) || 0

  const chips = []
  if (profile?.fitnessGoal) chips.push(profile.fitnessGoal)
  if (profile?.experienceLevel) chips.push(profile.experienceLevel)
  if (duration > 0) chips.push(`${duration} min sessions`)

  const stats = [
    {
      key: 'streak',
      label: 'Current streak',
      value: snapshot?.currentStreak ?? 0,
      unit: (snapshot?.currentStreak ?? 0) === 1 ? 'day' : 'days',
    },
    { key: 'week', label: 'Workouts this week', value: snapshot?.weekWorkouts ?? 0, unit: '' },
    { key: 'total', label: 'Workouts total', value: snapshot?.totalWorkouts ?? 0, unit: '' },
    { key: 'nutrition', label: 'Days logged', value: snapshot?.daysLogged ?? 0, unit: '' },
  ]

  return (
    <section className="ai-status card" aria-labelledby="ai-status-title">
      <div className="ai-status__head">
        <div>
          <p className="ai-status__eyebrow">Your coaching profile</p>
          <h2 className="ai-status__title" id="ai-status-title">
            Ready, {firstName}?
          </h2>
        </div>
        <span className="chip chip--primary">
          <span className="chip__dot" aria-hidden="true" />
          Coach ready
        </span>
      </div>

      {chips.length > 0 ? (
        <div className="ai-status__chips">
          {chips.map((chip) => (
            <span key={chip} className="chip">
              {chip}
            </span>
          ))}
        </div>
      ) : (
        <p className="ai-status__note">
          Finish onboarding to get insights tuned to your goal and experience.
        </p>
      )}

      <dl className="ai-status__stats">
        {stats.map((stat) => (
          <div key={stat.key} className="ai-status__stat">
            <dt className="ai-status__stat-label">{stat.label}</dt>
            <dd className="ai-status__stat-value">
              {stat.value}
              {stat.unit && <span className="ai-status__stat-unit"> {stat.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <p className="ai-status__note">
        Insights are built only from your BeFit workouts, nutrition and progress — never your account
        credentials.
      </p>
    </section>
  )
}

export default AiStatusCard
