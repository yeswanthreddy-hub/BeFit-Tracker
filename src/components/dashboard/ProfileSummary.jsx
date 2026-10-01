import { Link } from 'react-router-dom'
import { getDisplayName, getUserInitials } from '../../utils/user'
import { isProfileComplete } from '../../data/onboarding'

/**
 * Compact profile summary.
 *
 * Reads the onboarding answers straight from the signed-in account's profile.
 * When the profile is incomplete the missing values are labelled as such and a
 * setup link is offered, rather than showing blanks or a crash.
 */
function ProfileSummary({ user, profile }) {
  const ready = isProfileComplete(profile)
  const initials = getUserInitials(user?.name)

  const rows = [
    { label: 'Name', value: user?.name || 'Not set' },
    { label: 'Fitness goal', value: profile?.fitnessGoal || 'Not set' },
    { label: 'Experience level', value: profile?.experienceLevel || 'Not set' },
    {
      label: 'Preferred session',
      value: profile?.preferredWorkoutDuration
        ? `${profile.preferredWorkoutDuration} min`
        : 'Not set',
    },
  ]

  return (
    <section className="profile-summary card" aria-labelledby="profile-summary-title">
      <div className="profile-summary__head">
        <span className="profile-summary__avatar" aria-hidden="true">
          {initials}
        </span>
        <div className="profile-summary__identity">
          <h2 className="profile-summary__title" id="profile-summary-title">
            {getDisplayName(user)}
          </h2>
          <p className="profile-summary__email">{user?.email}</p>
        </div>
      </div>

      <dl className="profile-summary__rows">
        {rows.map((row) => (
          <div className="profile-summary__row" key={row.label}>
            <dt className="profile-summary__label">{row.label}</dt>
            <dd className="profile-summary__value">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="profile-summary__footer">
        <Link to="/settings" className="btn btn--secondary btn--sm">
          Edit Profile
        </Link>
        {!ready && (
          <Link to="/onboarding" className="profile-summary__setup">
            Complete setup
          </Link>
        )}
      </div>
    </section>
  )
}

export default ProfileSummary