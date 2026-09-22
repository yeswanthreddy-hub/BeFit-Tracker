import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import SectionHeader from '../components/ui/SectionHeader'
import { seedBeFitData } from '../data/seed'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storageKeys'
import { emptyStreak } from '../data/models'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const EXPLORE = [
  { to: '/exercises', title: 'Exercise library', text: 'Browse moves by muscle group and craft your own sessions.' },
  { to: '/workouts', title: 'Workout plans', text: 'Ready-made plans built around your goals.' },
  { to: '/diet', title: 'Food & macros', text: 'Log meals and keep your fuel in step with training.' },
]

function DashboardPage() {
  useEffect(() => {
    seedBeFitData()
  }, [])

  const [streak] = useLocalStorage(STORAGE_KEYS.streak, emptyStreak())
  const [completed] = useLocalStorage(STORAGE_KEYS.completedWorkouts, [])
  const [progress] = useLocalStorage(STORAGE_KEYS.progress, [])

  const latestWeight = progress.length ? progress[progress.length - 1].bodyWeightKg : null
  const [now] = useState(() => Date.now())
  const sessionsThisMonth = useMemo(
    () =>
      completed.filter((workout) => Date.parse(workout.date) > now - 30 * 86_400_000).length,
    [completed, now],
  )

  return (
    <div className="page">
      <SectionHeader
        eyebrow="Dashboard"
        title={`${greeting()}, Athlete`}
        sub="Your training at a glance. Let's make today count."
      />

      <div className="grid grid--cols-4">
        <div className="card card--featured grid__span-2">
          <span className="chip chip--primary">
            <span className="chip__dot" aria-hidden="true" />
            Ready when you are
          </span>
          <h3 className="card__title">Start a workout</h3>
          <p className="card__text">
            Pick a plan or build your own session and get moving in minutes.
          </p>
          <div className="card__footer">
            <Button to="/workouts" variant="primary">
              Start workout
            </Button>
          </div>
        </div>

        <div className="stat">
          <p className="stat__value">
            {streak.current}
            <span className="stat__delta stat__delta--up" aria-hidden="true">
              ↗ best {streak.best}
            </span>
          </p>
          <p className="stat__label">Day streak</p>
        </div>

        <div className="stat">
          <p className="stat__value">
            {latestWeight ? `${latestWeight} kg` : '—'}
          </p>
          <p className="stat__label">Latest weight</p>
          <p className="stat__delta stat__delta--down">tracked on progress</p>
        </div>
      </div>

      <SectionHeader
        eyebrow="Quick actions"
        title="Keep it moving"
        split
        action={
          <Link to="/completed" className="section-header__link">
            View completed
          </Link>
        }
      />

      <div className="grid grid--cols-4">
        <Card title="Quick workout" hover interactive className="dashboard-action">
          <p className="card__text">A short, no-fuss session when you are short on time.</p>
          <div className="card__footer">
            <Button to="/workouts" variant="secondary" size="sm">
              Jump in
            </Button>
          </div>
        </Card>

        <Card title="This month" hover interactive className="dashboard-action">
          <p className="stat__value">{sessionsThisMonth}</p>
          <p className="card__text">sessions completed</p>
          <div className="card__footer">
            <Button to="/progress" variant="secondary" size="sm">
              See progress
            </Button>
          </div>
        </Card>

        <Card title="Log food" hover interactive className="dashboard-action">
          <p className="card__text">Track calories and macros for the day.</p>
          <div className="card__footer">
            <Button to="/diet" variant="secondary" size="sm">
              Open diet
            </Button>
          </div>
        </Card>

        <Card title="AI check-in" hover interactive className="dashboard-action">
          <p className="card__text">Insights about your training are on the way.</p>
          <div className="card__footer">
            <Button to="/ai-tracker" variant="secondary" size="sm">
              Preview
            </Button>
          </div>
        </Card>
      </div>

      <SectionHeader
        eyebrow="Explore"
        title="Go a little deeper"
      />

      <div className="grid grid--cols-3">
        {EXPLORE.map((item) => (
          <Card
            key={item.to}
            title={item.title}
            hover
            interactive
            className="dashboard-explore"
          >
            <p className="card__text">{item.text}</p>
            <div className="card__footer">
              <Link to={item.to} className="section-header__link">
                Explore →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage