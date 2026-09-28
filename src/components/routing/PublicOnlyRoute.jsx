import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const AUTH_ROUTES = ['/login', '/register']

/**
 * Guard for pages that only make sense while logged out.
 *
 * A signed-in visitor who opens /login or /register is sent to their
 * dashboard, or back to the page that originally required a session.
 */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return children

  const from = location.state?.from?.pathname
  const target = from && !AUTH_ROUTES.includes(from) ? from : '/dashboard'

  return <Navigate to={target} replace />
}

export default PublicOnlyRoute
