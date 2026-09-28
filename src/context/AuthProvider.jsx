import { useCallback, useMemo, useState } from 'react'
import AuthContext from './AuthContext'
import {
  clearSession,
  ensureProfileForUser,
  getUserById,
  readSession,
  registerUser,
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

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.user),
      register,
      refresh,
    }),
    [state, register, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
