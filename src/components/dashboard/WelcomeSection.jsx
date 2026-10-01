import { getDisplayName, getGreeting } from '../../utils/user'
import { isProfileComplete } from '../../data/onboarding'

/**
 * Personalized greeting band.
 *
 * The name always comes from the account record created at registration — it is
 * never hardcoded. The supporting line is chosen from the browser's local clock
 * so it matches the time of day the athlete is actually looking at it.
 *
 * Copy stays motivational and makes no health or medical claims.
 */
function WelcomeSection({ user, profile }) {
  const { greeting, context, period } = getGreeting()
  const firstName = getDisplayName(user)
  const profileReady = isProfileComplete(profile)

  return (
    <section className={`welcome welcome--${period}`} aria-labelledby="welcome-title">
      <div className="welcome__glow" aria-hidden="true" />

      <div className="welcome__body">
        <p className="welcome__eyebrow">
          {greeting}
          {firstName ? `, ${firstName}` : ''}
        </p>
        <h1 className="welcome__title" id="welcome-title">
          {context}
        </h1>
        <p className="welcome__sub">
          {profileReady
            ? 'Here is where your training stands today.'
            : 'Finish your fitness profile and BeFit will tailor every session to you.'}
        </p>
      </div>

      {!profileReady && (
        <p className="welcome__setup" role="status">
          <span className="welcome__setup-dot" aria-hidden="true" />
          Profile setup incomplete
        </p>
      )}
    </section>
  )
}

export default WelcomeSection