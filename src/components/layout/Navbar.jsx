import { NavLink } from 'react-router-dom'
import { NAV_LINKS } from './navigation'

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" aria-label="BeFit home">
          <span className="navbar__mark" aria-hidden="true">
            +b
          </span>
          <span className="navbar__wordmark">BeFit</span>
        </NavLink>

        <nav className="navbar__nav" aria-label="Primary">
          <ul className="navbar__links">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar