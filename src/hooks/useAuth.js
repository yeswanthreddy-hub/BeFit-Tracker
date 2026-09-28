import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

/**
 * Read the local BeFit session.
 *
 * Throws when used outside <AuthProvider> so a mis-wired tree fails loudly
 * during development instead of silently rendering logged-out UI.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }
  return context
}
