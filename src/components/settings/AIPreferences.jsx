import SettingsSection from './SettingsSection'
import Toggle from './Toggle'
import { useSettings } from '../../hooks/useSettings'

/**
 * AI preferences.
 *
 * These control the existing AI Fitness Tracker and the dashboard insight
 * card. The Groq API key is never involved here — it stays in the server
 * environment and is never entered, shown or stored in the browser.
 */
function AIPreferences() {
  const { settings, updateSettings } = useSettings()

  return (
    <SettingsSection
      id="ai"
      eyebrow="AI Fitness"
      title="AI Fitness Preferences"
      description="Control how BeFit's AI coach shows up in the app."
    >
      <div className="settings-controls">
        <Toggle
          id="ai-insights"
          label="AI insights"
          description="Let the AI Fitness Tracker analyse your workouts, nutrition and progress."
          checked={settings.aiInsights}
          onChange={(value) => updateSettings({ aiInsights: value })}
        />
        <Toggle
          id="ai-dashboard"
          label="Show AI insights on Dashboard"
          description="Display your latest AI insight card on the dashboard."
          checked={settings.showAiInsightsOnDashboard}
          onChange={(value) => updateSettings({ showAiInsightsOnDashboard: value })}
          disabled={!settings.aiInsights}
        />
      </div>

      <p className="settings-note">
        BeFit's AI runs securely through its own server route. You never need to
        enter an API key here — keys are never stored in this browser.
      </p>
    </SettingsSection>
  )
}

export default AIPreferences
