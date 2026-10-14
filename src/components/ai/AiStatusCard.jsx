import { getDisplayName } from '../../utils/user'

/**
 * A short snapshot of the coaching context.
 *
 * On the first cut this is the athlete's onboarding profile — the same values
 * the recommendation rules already use — framed as chips so the page has a
 * grounding block before the first insight. Later milestones enrich it with
 * live workout and nutrition counts.
 */
function AiStatusCard({ user, profile }) {
  const firstName = getDisplayName(user)
  const duration = Number(profile?.preferredWorkoutDuration) || 0

  const chips = []
  if (profile?.fitnessGoal) chips.push(profile.fitnessGoal)
  if (profile?.experienceLevel) chips.push(profile.experienceLevel)
  if (duration > 0) chips.push(`${duration} min sessions`)

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

      <p className="ai-status__note">
        Insights are built only from your BeFit workouts, nutrition and progress — never your account
        credentials.
      </p>
    </section>
  )
}

export default AiStatusCard
