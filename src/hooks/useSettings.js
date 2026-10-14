import { useContext } from 'react'
import SettingsContext from '../context/settingsContext'

/**
 * Read the app-wide BeFit settings.
 *
 * Throws when used outside <SettingsProvider> so a mis-wired tree fails loudly
 * instead of silently falling back to defaults.
 */
export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within <SettingsProvider>')
  }
  return context
}
