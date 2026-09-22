import { Link } from 'react-router-dom'
import Logo from '../Logo'

const FOOTER_LINKS = [
  { to: '/exercises', label: 'Exercises' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/progress', label: 'Progress' },
  { to: '/ai-tracker', label: 'AI Tracker' },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Logo />
          <p className="site-footer__tag">Plan. Train. Track. Stay consistent.</p>
        </div>
        <nav className="site-footer__nav" aria-label="Footer">
          <ul>
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="site-footer__legal">© {new Date().getFullYear()} BeFit</p>
      </div>
    </footer>
  )
}

export default Footer