import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from '../Logo'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { ACCOUNT_LINKS, GUEST_ACTIONS, GUEST_LINKS, NAV_LINKS } from './navigation'

const linkClassName = ({ isActive }) =>
  isActive ? 'navbar__link navbar__link--active' : 'navbar__link'

function NavbarLink({ link, onNavigate }) {
  const classes = 'navbar__link'

  if (link.hash) {
    return (
      <Link to={link.to} className={classes} onClick={onNavigate}>
        {link.label}
      </Link>
    )
  }

  return (
    <NavLink
      to={link.to}
      end={link.to === '/'}
      className={linkClassName}
      onClick={onNavigate}
    >
      {link.label}
    </NavLink>
  )
}

/**
 * BeFit navigation bar.
 *
 * `scope="marketing"` is used on the landing page (a trimmed, product-focused
 * set), while the default `scope="app"` keeps the full in-app navigation.
 * Either way the links and actions follow the local session: signed out shows
 * Login / Get Started, signed in shows the athlete's name and Logout.
 */
function Navbar({ scope = 'app', links, actions }) {
  const { isAuthenticated, user, logout } = useAuth()
  const { notify } = useNotifications()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)
  const toggle = () => setOpen((value) => !value)

  const resolvedLinks =
    links ?? (isAuthenticated ? (scope === 'marketing' ? ACCOUNT_LINKS : NAV_LINKS) : GUEST_LINKS)
  const resolvedActions = actions ?? (isAuthenticated ? [] : GUEST_ACTIONS)
  const firstName = user?.name?.split(' ')[0] ?? ''

  function handleLogout() {
    logout()
    close()
    navigate('/')
    notify({
      tone: 'info',
      title: 'Signed out',
      message: 'Your account and training data stay saved in this browser.',
    })
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" aria-label="BeFit home" onClick={close}>
          <Logo size={32} />
        </NavLink>

        <nav className="navbar__nav" aria-label="Primary">
          <ul className="navbar__links">
            {resolvedLinks.map((link) => (
              <li key={link.label}>
                <NavbarLink link={link} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          {isAuthenticated ? (
            <div className="navbar__account">
              <span className="navbar__user" title={user?.email}>
                <span className="navbar__user-dot" aria-hidden="true" />
                {firstName}
              </span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            resolvedActions.map((action) => (
              <Button
                key={action.label}
                to={action.to}
                variant={action.variant}
                size="sm"
              >
                {action.label}
              </Button>
            ))
          )}
        </div>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="navbar-panel"
          onClick={toggle}
        >
          <span className="visually-hidden">
            {open ? 'Close menu' : 'Open menu'}
          </span>
          <span className="navbar__toggle-icon" aria-hidden="true" />
        </button>
      </div>

      <div
        id="navbar-panel"
        className={`navbar__panel${open ? ' navbar__panel--open' : ''}`}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile">
          <ul className="navbar__mobile-links">
            {resolvedLinks.map((link) => (
              <li key={link.label}>
                <NavbarLink link={link} onNavigate={close} />
              </li>
            ))}
          </ul>
          <div className="navbar__panel-actions">
            {isAuthenticated ? (
              <>
                <span className="navbar__panel-user">
                  <span className="navbar__user-dot" aria-hidden="true" />
                  {user?.name}
                </span>
                <Button
                  variant="secondary"
                  className="navbar__panel-action"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              resolvedActions.map((action) => (
                <Button
                  key={action.label}
                  to={action.to}
                  variant={action.variant}
                  className="navbar__panel-action"
                  onClick={close}
                >
                  {action.label}
                </Button>
              ))
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
