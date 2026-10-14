import { createContext } from 'react'

/**
 * The app-wide personalisation settings (theme, motion, preferences, AI toggles).
 * Provided by <SettingsProvider /> and read through `useSettings()`.
 */
const SettingsContext = createContext(null)

export default SettingsContext
