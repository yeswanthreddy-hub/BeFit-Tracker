import { Link, Outlet } from 'react-router-dom'
import Logo from '../Logo'

const POINTS = [
  {
    title: 'Plans that fit your week',
    text: 'Build a schedule around the time you actually have.',
  },
  {
    title: 'Every session logged',
    text: 'Workouts, food and progress stay together in one place.',
  },
  {
    title: 'Private to this browser',
    text: 'No server, no tracking — your data stays on this device.',
  },
]

/**
 * Split layout shared by the authentication screens.
 *
 * Desktop shows branding on the left and the form card on the right. On
 * mobile the two sections stack naturally instead of forcing a side-by-side
 * arrangement onto a narrow screen.
 */
function AuthLayout() {
  return (
    <div className="auth">
      <header className="auth__topbar">
        <Link to="/" className="auth__brand" aria-label="BeFit home">
          <Logo size={30} />
        </Link>
        <Link to="/" className="auth__back">
          <span aria-hidden="true">←</span> Back to home
        </Link>
      </header>

      <div className="auth__grid">
        <aside className="auth__aside" aria-hidden="true">
          <span className="chip chip--primary">
            <span className="chip__dot" />
            Local-first fitness
          </span>
          <p className="auth__headline">
            Train <span className="auth__headline-accent">smarter</span> from day one.
          </p>
          <p className="auth__lede">
            BeFit keeps your training, meals and progress in one calm workspace —
            no gym required to start.
          </p>
          <ul className="auth__points">
            {POINTS.map((point) => (
              <li key={point.title} className="auth__point">
                <span className="auth__point-dot" />
                <span>
                  <strong>{point.title}</strong>
                  {point.text}
                </span>
              </li>
            ))}
          </ul>
          <div className="auth__glow" />
        </aside>

        <main className="auth__panel">
          <div className="auth__card">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AuthLayout
