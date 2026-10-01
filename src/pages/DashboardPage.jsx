import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import DashboardHeader from '../components/dashboard/DashboardHeader'
import WelcomeSection from '../components/dashboard/WelcomeSection'
import ProfileSummary from '../components/dashboard/ProfileSummary'
import StartWorkoutCard from '../components/dashboard/StartWorkoutCard'
import QuickWorkoutSection from '../components/dashboard/QuickWorkoutSection'
import TodaySummary from '../components/dashboard/TodaySummary'
import StreakCard from '../components/dashboard/StreakCard'
import WeeklyActivity from '../components/dashboard/WeeklyActivity'
import ProgressOverview from '../components/dashboard/ProgressOverview'
import RecommendationCard from '../components/dashboard/RecommendationCard'
import RecentActivity from '../components/dashboard/RecentActivity'
import ExploreSection from '../components/dashboard/ExploreSection'

import { useAuth } from '../hooks/useAuth'
import { useUserStorage } from '../hooks/useUserStorage'
import { STORAGE_KEYS } from '../utils/storageKeys'
import { isProfileComplete } from '../data/onboarding'
import { calculateStreak } from '../utils/streak'
import {
  completedOnDay,
  getBasicTotals,
  recentActivity,
  weeklyActivity,
  weeklyCompleted,
} from '../utils/dashboard'

/**
 * BeFit user dashboard — the athlete's command centre.
 *
 * Identity comes from `useAuth`, which reads the local session and resolves the
 * account and its onboarding profile from localStorage. History comes from
 * `useUserStorage`, which scopes each key to the signed-in athlete so no local
 * account can see another's numbers. Nothing is hardcoded and no statistics are
 * invented: a new account legitimately shows zeroes.
 *
 * The route stays wrapped in `ProtectedRoute`, so visiting /dashboard without a
 * session redirects to /login.
 */
function DashboardPage() {
  const { user, profile } = useAuth()

  const [completed] = useUserStorage(STORAGE_KEYS.completedWorkouts, [])
  const [progress] = useUserStorage(STORAGE_KEYS.progress, [])

  // One timestamp per render pass so every date comparison on the page agrees
  // on what "today" is.
  const now = useMemo(() => new Date(), [])

  const derived = useMemo(() => {
    const list = Array.isArray(completed) ? completed : []
    const entries = Array.isArray(progress) ? progress : []

    return {
      todayCount: completedOnDay(list, now),
      weekCount: weeklyCompleted(list, now),
      totalCount: list.length,
      streak: calculateStreak(list),
      days: weeklyActivity(list, now),
      recent: recentActivity(list, 4),
      totals: getBasicTotals(list, entries),
    }
  }, [completed, progress, now])

  const profileReady = isProfileComplete(profile)

  return (
    <div className="dashboard page">
      <DashboardHeader />

      <div className="dashboard__hero">
        <WelcomeSection user={user} profile={profile} />
        <ProfileSummary user={user} profile={profile} />
      </div>

      <StartWorkoutCard />

      <TodaySummary
        todayCount={derived.todayCount}
        streak={derived.streak.current}
        weekCount={derived.weekCount}
        totalCount={derived.totalCount}
      />

      <div className="dashboard__consistency">
        <StreakCard
          current={derived.streak.current}
          best={derived.streak.best}
          lastWorkoutDate={derived.streak.lastWorkoutDate}
        />
        <WeeklyActivity days={derived.days} />
      </div>

      <div className="dashboard__detail">
        <ProgressOverview weekCount={derived.weekCount} totals={derived.totals} />
        <RecommendationCard profile={profile} />
      </div>

      <RecentActivity items={derived.recent} />

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