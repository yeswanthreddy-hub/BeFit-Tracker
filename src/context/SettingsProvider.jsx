import { useCallback, useEffect, useMemo } from 'react'

import SettingsContext from './settingsContext'
import { useAuth } from '../hooks/useAuth'
import { useUserStorage } from '../hooks/useUserStorage'
import { STORAGE_KEYS } from '../utils/storageKeys'
import { DEFAULT_SETTINGS, mergeSettings, normalizeSettings } from '../utils/settings'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * Apply the resolved theme to the document root.
 *
 * A single `data-theme="light" | "dark"` attribute drives every colour token,
 * so no component needs to know about theming. `System` follows the OS and
 * keeps listening for changes while the app is open.
 */
function useThemeEffect(theme) {
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return undefined

    const root = document.documentElement
    const media = window.matchMedia ? window.matchMedia(DARK_QUERY) : null

    const apply = () => {
      const resolved = theme === 'system' ? (media?.matches ? 'dark' : 'light') : theme
      root.setAttribute('data-theme', resolved)
      root.style.colorScheme = resolved
    }

    apply()

    if (theme === 'system' && media?.addEventListener) {
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
    return undefined
  }, [theme])
}

/** Toggle the reduced-motion attribute the CSS rules watch for. */
function useReducedMotionEffect(reducedMotion) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (reducedMotion) root.setAttribute('data-reduced-motion', 'reduce')
    else root.removeAttribute('data-reduced-motion')
  }, [reducedMotion])
}

/**
 * Owns the signed-in athlete's settings and keeps them persisted.
 *
 * Backed by the account-scoped settings key, so switching accounts swaps every
 * preference and the selected theme along with them. Defaults are only applied
 * to missing fields — an existing preference is never overwritten on load.
 */
export function SettingsProvider({ children }) {
  const { user } = useAuth()
  const [stored, setStored] = useUserStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS)

  const settings = useMemo(() => normalizeSettings(stored), [stored])

  const updateSettings = useCallback(
    (updates) => {
      setStored((current) => mergeSettings(current, updates, user?.id))
    },
    [setStored, user?.id],
  )

  const resetSettings = useCallback(() => {
    setStored(normalizeSettings({ ...DEFAULT_SETTINGS, userId: user?.id }))
  }, [setStored, user?.id])

  useThemeEffect(settings.theme)
  useReducedMotionEffect(settings.reducedMotion)

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
