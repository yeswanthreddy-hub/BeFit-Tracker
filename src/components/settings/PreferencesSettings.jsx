import SettingsSection from './SettingsSection'
import Toggle from './Toggle'
import { useSettings } from '../../hooks/useSettings'

/**
 * Reminder preferences.
 *
 * These are honest preference flags only — BeFit has no push or browser
 * notification system, so nothing is "sent". They are stored so future
 * reminder features (and the dashboard's own guidance) can respect them.
 */
function PreferencesSettings() {
  const { settings, updateSettings } = useSettings()

  return (
    <SettingsSection
      id="preferences"
      eyebrow="Preferences"
      title="Preferences"
      description="Choose what you'd like BeFit to remind you about. These are saved preferences, not live notifications."
    >
      <div className="settings-controls">
        <Toggle
          id="workout-reminders"
          label="Workout reminders"
          description="Keep workout prompts enabled in your preferences."
          checked={settings.workoutReminders}
          onChange={(value) => updateSettings({ workoutReminders: value })}
        />
        <Toggle
          id="nutrition-reminders"
          label="Nutrition reminders"
          description="Keep food-logging prompts enabled in your preferences."
          checked={settings.nutritionReminders}
          onChange={(value) => updateSettings({ nutritionReminders: value })}
        />
      </div>
    </SettingsSection>
  )
}

export default PreferencesSettings
