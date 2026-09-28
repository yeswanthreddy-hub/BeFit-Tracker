import { useCallback, useMemo, useState } from 'react'
import AuthContext from './AuthContext'
import {
  clearSession,
  ensureProfileForUser,
  getUserById,
  readSession,
  registerUser,
  signIn,
  signOut,
} from '../services/authService'

const EMPTY = { session: null, user: null, profile: null }

/**
 * Build the auth state from localStorage.
 *
 * A session that points at a missing user (cleared users list, corrupt data)
 * is discarded so the app falls back to the logged-out state instead of
 * rendering a broken account.
 */
function readAuthState() {
  const session = readSession()
  if (!session) return EMPTY

  const user = getUserById(session.userId)
  if (!user) {
    clearSession()
    return EMPTY
  }

  return { session, user, profile: ensureProfileForUser(user) }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(readAuthState)

  const refresh = useCallback(() => {
    setState(readAuthState())
  }, [])

  const register = useCallback((values) => {
    const result = registerUser(values)
    if (result.ok) setState(readAuthState())
    return result
  }, [])

  /** Opens a session for a returning user. */
  const login = useCallback((credentials) => {
    const result = signIn(credentials)
    if (result.ok) setState(readAuthState())
    return result
  }, [])

  /**
   * Ends the session. The account and its profile are intentionally left in
   * localStorage so signing back in restores the same user.
   */
  const logout = useCallback(() => {
    signOut()
    setState(EMPTY)
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.user),
      register,
      login,
      logout,
      refresh,
    }),
    [state, register, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
