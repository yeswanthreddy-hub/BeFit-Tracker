import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * Client-side guard for app pages that need a local BeFit session.
 *
 * This is application access control only. BeFit has no backend, so anyone
 * can edit localStorage and bypass it — it keeps honest visitors on the right
 * screen, it is not a security boundary.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
