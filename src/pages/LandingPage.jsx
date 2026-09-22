import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero'
import { HOME_LINKS } from '../components/layout/navigation'

const HOME_ACTIONS = [
  { to: '/login', label: 'Log in', variant: 'ghost' },
  { to: '/register', label: 'Get Started', variant: 'primary' },
]

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
      <Navbar links={HOME_LINKS} actions={HOME_ACTIONS} />

      <Hero />

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