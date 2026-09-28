import { createContext } from 'react'

/**
 * Shared auth context. Kept in its own module so the provider file exports
 * components only.
 */
const AuthContext = createContext(null)

export default AuthContext
