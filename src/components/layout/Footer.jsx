import { Link } from 'react-router-dom'
import Logo from '../Logo'

const FOOTER_LINKS = [
  { to: '/workouts', label: 'Workout' },
  { to: '/progress', label: 'Progress' },
  { to: '/diet', label: 'Diet' },
  { to: '/ai-tracker', label: 'AI Tracker' },
  { to: '/settings', label: 'Settings' },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Logo />
          <p className="site-footer__tag">
            BeFit keeps your training, nutrition, and progress in one calm,
            local-first place. Plan. Train. Track. Stay consistent.
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Footer navigation">
          <h2 className="visually-hidden">Explore</h2>
          <ul>
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <p className="site-footer__legal">
          © {new Date().getFullYear()} BeFit. Built locally — your data stays
          on your device.
        </p>
      </div>
    </footer>
  )
}

export default Footer