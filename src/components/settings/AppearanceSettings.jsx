import SettingsSection from './SettingsSection'
import ChoiceGroup from '../auth/ChoiceGroup'
import Toggle from './Toggle'
import { useSettings } from '../../hooks/useSettings'
import { useNotifications } from '../../hooks/useNotifications'
import { THEME_OPTIONS } from '../../utils/settings'

/**
 * Appearance settings: theme and motion.
 *
 * Both changes apply instantly through the settings context (the root
 * `data-theme` / `data-reduced-motion` attributes update on the next render),
 * so there is no Save button to forget. The choices persist to the account's
 * settings and survive refresh and sign-in.
 */
function AppearanceSettings() {
  const { settings, updateSettings } = useSettings()
  const { notify } = useNotifications()

  function changeTheme(theme) {
    updateSettings({ theme })
    notify({ tone: 'success', title: 'Appearance updated', message: 'Settings updated.' })
  }

  function changeReducedMotion(reducedMotion) {
    updateSettings({ reducedMotion })
  }

  return (
    <SettingsSection
      id="appearance"
      eyebrow="Appearance"
      title="Appearance"
      description="Choose how BeFit looks and moves on this device."
    >
      <ChoiceGroup
        name="theme"
        legend="Theme"
        hint="System follows your device's light or dark setting."
        options={THEME_OPTIONS}
        value={settings.theme}
        onChange={changeTheme}
      />

      <div className="settings-controls">
        <Toggle
          id="reduced-motion"
          label="Reduce motion"
          description="Limit animations, transitions and floating effects across BeFit."
          checked={settings.reducedMotion}
          onChange={changeReducedMotion}
        />
      </div>
    </SettingsSection>
  )
}

export default AppearanceSettings
