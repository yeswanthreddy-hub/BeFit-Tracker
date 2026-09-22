import Button from '../ui/Button'

const BARS = [
  { height: '45%', on: true },
  { height: '70%', on: true },
  { height: '55%', on: true },
  { height: '90%', on: true },
  { height: '65%', on: true },
]

function Hero() {
  const ringValue = 0.72
  const pct = Math.round(ringValue * 100)

  return (
    <section className="hero container" id="home">
      <div className="hero__content animate-fade-up">
        <span className="chip chip--primary">
          <span className="chip__dot" aria-hidden="true" />
          Workout planner + fitness tracker
        </span>

        <h1 className="hero__title">
          Build Your <span className="hero__title-accent">Stronger</span> Self.
        </h1>

        <p className="hero__sub">
          A calm, focused home for your training — plan workouts, log every
          session, and let consistency do the heavy lifting. Everything lives
          in your browser.
        </p>

        <div className="hero__actions">
          <Button to="/register" variant="primary" size="lg">
            Start Your Journey
          </Button>
          <Button to="/workouts" variant="secondary" size="lg">
            Explore Workouts
          </Button>
        </div>
      </div>

      <div className="hero__stage animate-fade-up delay-2" aria-hidden="true">
        <div className="hero__card hero__card--back">
          <span className="chip">Activity</span>
          <div className="hero__bars">
            {BARS.map((bar, index) => (
              <span
                key={index}
                className={bar.on ? 'hero__bar hero__bar--on' : 'hero__bar'}
                style={{ height: bar.height }}
              />
            ))}
          </div>
          <p className="hero__card-label">18 sessions this month</p>
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
            <span className="chip__dot" />
            Current streak
          </span>
          <div className="hero__ring-wrap">
            <div
              className="hero__ring"
              style={{
                background: `conic-gradient(var(--color-primary) 0 ${pct}%, var(--color-surface-hover) ${pct}% 100%)`,
              }}
            >
              <span className="hero__ring-value">6</span>
            </div>
            <div className="hero__ring-text">
              <p className="hero__card-value">days</p>
              <p className="hero__card-label">
                best <strong>12</strong> · train today to keep it alive
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero