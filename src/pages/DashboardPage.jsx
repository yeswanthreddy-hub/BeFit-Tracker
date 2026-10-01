import { Link } from 'react-router-dom'

import DashboardHeader from '../components/dashboard/DashboardHeader'
import WelcomeSection from '../components/dashboard/WelcomeSection'
import ProfileSummary from '../components/dashboard/ProfileSummary'
import StartWorkoutCard from '../components/dashboard/StartWorkoutCard'
import QuickWorkoutSection from '../components/dashboard/QuickWorkoutSection'
import ExploreSection from '../components/dashboard/ExploreSection'

import { useAuth } from '../hooks/useAuth'
import { isProfileComplete } from '../data/onboarding'

/**
 * BeFit user dashboard — the athlete's command centre.
 *
 * Identity comes from `useAuth`, which reads the local session and resolves the
 * account and its onboarding profile from localStorage. Nothing is hardcoded and
 * no statistics are invented.
 *
 * The route stays wrapped in `ProtectedRoute`, so visiting /dashboard without a
 * session redirects to /login.
 */
function DashboardPage() {
  const { user, profile } = useAuth()
  const profileReady = isProfileComplete(profile)

  return (
    <div className="dashboard page">
      <DashboardHeader />

      <div className="dashboard__hero">
        <WelcomeSection user={user} profile={profile} />
        <ProfileSummary user={user} profile={profile} />
      </div>

      <StartWorkoutCard />

      <QuickWorkoutSection />

      <ExploreSection />

      {!profileReady && (
        <aside className="dashboard__setup card" aria-labelledby="dashboard-setup-title">
          <div>
            <h2 className="dashboard__setup-title" id="dashboard-setup-title">
              Your first workout is waiting
            </h2>
            <p className="dashboard__setup-note">
              Start a session to begin tracking your progress. Setting your fitness
              goal first makes every recommendation personal.
            </p>
          </div>
          <Link to="/onboarding" className="btn btn--secondary btn--sm">
            Finish profile setup
          </Link>
        </aside>
      )}
    </div>
  )
}

export default DashboardPage