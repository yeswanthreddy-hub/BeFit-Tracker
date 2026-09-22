import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Logo from '../Logo'
import Button from '../ui/Button'
import { NAV_LINKS } from './navigation'

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

function Navbar({ links = NAV_LINKS, actions = [] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const toggle = () => setOpen((value) => !value)

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" aria-label="BeFit home" onClick={close}>
          <Logo size={32} />
        </NavLink>

        <nav className="navbar__nav" aria-label="Primary">
          <ul className="navbar__links">
            {links.map((link) => (
              <li key={link.label}>
                <NavbarLink link={link} />
              </li>
            ))}
          </ul>
        </nav>

        {actions.length > 0 && (
          <div className="navbar__actions">
            {actions.map((action) => (
              <Button
                key={action.label}
                to={action.to}
                variant={action.variant}
                size="sm"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

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
            {links.map((link) => (
              <li key={link.label}>
                <NavbarLink link={link} onNavigate={close} />
              </li>
            ))}
          </ul>
          {actions.length > 0 && (
            <div className="navbar__panel-actions">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  to={action.to}
                  variant={action.variant}
                  className="navbar__panel-action"
                  onClick={close}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar