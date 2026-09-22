import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'

const HERO_CHIP = 'Workout planner + fitness tracker'

const FEATURES = [
  {
    title: 'Plan your training',
    text: 'Build workouts from a growing exercise catalog, or pick a ready-made plan and press start.',
  },
  {
    title: 'Track every session',
    text: 'Log sets, reps, and duration. Completed workouts feed your streak and progress history.',
  },
  {
    title: 'Watch the streak grow',
    text: 'Consistency is the goal. BeFit tracks your daily streak and guards your best run.',
  },
  {
    title: 'Mind your fuel',
    text: 'Log meals, track macros, and keep your nutrition in step with your training.',
  },
]

function LandingPage() {
  return (
    <div className="landing">
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="navbar__brand" aria-label="BeFit home">
            <Logo size={32} />
          </Link>

          <nav className="site-header__nav" aria-label="Primary">
            <ul>
              <li>
                <Link to="/exercises">Exercises</Link>
              </li>
              <li>
                <Link to="/workouts">Workouts</Link>
              </li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
            </ul>
          </nav>

          <div className="site-header__actions">
            <Button to="/login" variant="ghost" size="sm">
              Log in
            </Button>
            <Button to="/register" variant="primary" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <section className="hero container">
        <div className="hero__content animate-fade-up">
          <span className="chip chip--primary">
            <span className="chip__dot" aria-hidden="true" />
            {HERO_CHIP}
          </span>

          <h1 className="hero__title">
            Train with a plan.
            <br />
            Build an unshakeable streak.
          </h1>

          <p className="hero__sub">
            Discover exercises, plan sessions, log every workout, and keep an
            eye on food, macros, and progress — all in your browser.
          </p>

          <div className="hero__actions">
            <Button to="/dashboard" variant="primary" size="lg">
              Start training
            </Button>
            <Button to="/exercises" variant="secondary" size="lg">
              Explore exercises
            </Button>
          </div>
        </div>

        <div
          className="hero__stage animate-fade-up delay-2"
          aria-hidden="true"
        >
          <div className="hero__card hero__card--back">
            <span className="chip">This month</span>
            <p className="hero__card-value">18 sessions</p>
            <p className="hero__card-label">kept the momentum going</p>
          </div>

          <div className="hero__card hero__card--mid">
            <span className="chip">Next up</span>
            <p className="hero__card-title">Push Day</p>
            <div className="progress">
              <div className="progress__fill" style={{ width: '70%' }} />
            </div>
            <p className="hero__card-label">4 exercises · ~55 min</p>
          </div>

          <div className="hero__card hero__card--front">
            <span className="chip chip--primary">
              <span className="chip__dot" aria-hidden="true" />
              Current streak
            </span>
            <p className="hero__card-value hero__card-value--big">6 days</p>
            <p className="hero__card-label">
              best streak <strong>12 days</strong> · train today to keep it alive
            </p>
          </div>
        </div>
      </section>

      <section className="features container" aria-labelledby="features-title">
        <div className="section-header">
          <p className="section-header__eyebrow">Why BeFit</p>
          <h2 className="section-header__title">Everything you need to stay consistent</h2>
          <p className="section-header__sub">
            A few focused tools — no noise, no backends, no sign-up walls.
          </p>
        </div>

        <div className="grid grid--cols-4">
          {FEATURES.map((feature) => (
            <div className="card card--hover" key={feature.title}>
              <h3 className="card__title">{feature.title}</h3>
              <p className="card__text">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage