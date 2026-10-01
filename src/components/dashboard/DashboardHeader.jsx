import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from '../Logo'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { getUserInitials } from '../../utils/user'

/**
 * Sections reachable from inside the dashboard.
 *
 * Deliberately shorter than the app-shell Navbar: this bar answers "where am I
 * and what can I jump to from here", not "list every page in BeFit".
 */
const DASHBOARD_SECTIONS = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/workouts', label: 'Workouts' },
  { to: '/diet', label: 'Diet' },
  { to: '/progress', label: 'Progress' },
  { to: '/ai-tracker', label: 'AI Tracker' },
]

/**
 * Dashboard header.
 *
 * Sits inside the dashboard page rather than replacing the app-shell Navbar, so
 * the two never show the same thing twice: the global bar owns brand-wide
 * navigation, this bar owns the athlete's identity and dashboard-local jumps.
 *
 * On narrow viewports the section links collapse into a single horizontally
 * scrollable strip so the header never wraps into a tall block.
 */
function DashboardHeader() {
  const { user, logout } = useAuth()
  const { notify } = useNotifications()
  const navigate = useNavigate()

  const firstName = user?.name?.split(' ')[0] ?? ''
  const initials = getUserInitials(user?.name)

  function handleLogout() {
    logout()
    navigate('/login')
    notify({
      tone: 'info',
      title: 'Signed out',
      message: 'Your account and training data stay saved in this browser.',
    })
  }

  return (
    <header className="dash-header">
      <div className="dash-header__inner">
        <div className="dash-header__brand">
          <Logo size={30} />
          <span className="dash-header__scope">Dashboard</span>
        </div>

        <nav className="dash-header__nav" aria-label="Dashboard sections">
          <ul className="dash-header__links">
            {DASHBOARD_SECTIONS.map((section) => (
              <li key={section.to}>
                <NavLink
                  to={section.to}
                  end={section.end}
                  className={({ isActive }) =>
                    isActive
                      ? 'dash-header__link dash-header__link--active'
                      : 'dash-header__link'
                  }
                >
                  {section.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="dash-header__actions">
          <Link to="/settings" className="dash-header__profile">
            <span className="dash-header__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="dash-header__profile-text">
              <span className="dash-header__profile-name">{firstName || 'Athlete'}</span>
              <span className="dash-header__profile-action">Profile &amp; settings</span>
            </span>
          </Link>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader