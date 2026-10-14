import { useState } from 'react'

import PageContainer from '../../components/ui/PageContainer'
import ProfileSettings from '../../components/settings/ProfileSettings'
import GoalSettings from '../../components/settings/GoalSettings'
import WorkoutPreferences from '../../components/settings/WorkoutPreferences'
import AppearanceSettings from '../../components/settings/AppearanceSettings'
import PreferencesSettings from '../../components/settings/PreferencesSettings'
import AIPreferences from '../../components/settings/AIPreferences'
import DataManagement from '../../components/settings/DataManagement'
import AccountSettings from '../../components/settings/AccountSettings'

import './Settings.css'

/**
 * Section registry.
 *
 * One `activeSection` drives both the desktop sidebar and the mobile tab strip,
 * and exactly one section panel is mounted at a time. The registry keeps the
 * navigation and the rendered component in sync from a single source.
 */
const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: '◎', Component: ProfileSettings },
  { id: 'goals', label: 'Goals', icon: '⌁', Component: GoalSettings },
  { id: 'workout', label: 'Workout', icon: '⚡', Component: WorkoutPreferences },
  { id: 'appearance', label: 'Appearance', icon: '◐', Component: AppearanceSettings },
  { id: 'preferences', label: 'Preferences', icon: '☑', Component: PreferencesSettings },
  { id: 'ai', label: 'AI Fitness', icon: '✦', Component: AIPreferences },
  { id: 'data', label: 'Data', icon: '⤓', Component: DataManagement },
  { id: 'account', label: 'Account', icon: '◉', Component: AccountSettings },
]

/**
 * Settings.
 *
 * The control centre for profile, goals, workout preferences, appearance,
 * reminders, AI preferences, local data and the account. Everything saves to
 * the signed-in athlete's own localStorage records, and the route is protected
 * so it is only reachable with a session.
 */
function Settings() {
  const [activeSection, setActiveSection] = useState('profile')

  const current = SECTIONS.find((section) => section.id === activeSection) ?? SECTIONS[0]
  const ActivePanel = current.Component

  return (
    <PageContainer className="settings animate-fade-up">
      <header className="settings__header">
        <p className="settings__eyebrow">Settings</p>
        <h1 className="settings__title">Make BeFit yours</h1>
        <p className="settings__sub">
          Manage your profile, goals, preferences and the data BeFit keeps in this browser.
        </p>
      </header>

      <div className="settings__layout">
        <nav className="settings__nav" aria-label="Settings sections">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`settings__nav-item${section.id === activeSection ? ' is-active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              aria-current={section.id === activeSection ? 'true' : undefined}
            >
              <span className="settings__nav-icon" aria-hidden="true">
                {section.icon}
              </span>
              <span className="settings__nav-label">{section.label}</span>
            </button>
          ))}
        </nav>

        <div className="settings__content" key={current.id}>
          <ActivePanel />
        </div>
      </div>
    </PageContainer>
  )
}

export default Settings
