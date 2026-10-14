import { useNavigate } from 'react-router-dom'

import SettingsSection from './SettingsSection'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { getUserInitials } from '../../utils/user'

/**
 * Account settings: who is signed in and how to sign out.
 *
 * Uses the existing session/logout system — no second auth path. Because BeFit
 * has no server database, signing out only ends the session; the local account
 * and its data stay in this browser until they are deleted from Data Management.
 */
function AccountSettings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <SettingsSection
      id="account"
      eyebrow="Account"
      title="Account"
      description="Your local BeFit account on this device."
    >
      <div className="settings-account">
        <span className="settings-account__avatar" aria-hidden="true">
          {getUserInitials(user?.name)}
        </span>
        <div className="settings-account__meta">
          <p className="settings-account__label">Logged in as</p>
          <p className="settings-account__name">{user?.name || 'Athlete'}</p>
          <p className="settings-account__email">{user?.email}</p>
        </div>
      </div>

      <p className="settings-note">
        BeFit stores your account and data in this browser only. Signing out ends
        your session but keeps your data here until you delete it.
      </p>

      <div className="settings-form__actions">
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </SettingsSection>
  )
}

export default AccountSettings
