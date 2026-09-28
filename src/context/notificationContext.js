import { createContext } from 'react'

/**
 * Shared notification context, kept in its own module so the provider file
 * exports components only.
 */
const NotificationContext = createContext(null)

export default NotificationContext
