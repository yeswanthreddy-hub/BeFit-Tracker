import { useState } from 'react'

import SettingsSection from './SettingsSection'
import TextField from '../auth/TextField'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { validateEmail, validateName } from '../../utils/validation'
import { getUserInitials } from '../../utils/user'
import { isProfileComplete } from '../../data/onboarding'

/**
 * Identity settings: the account name and email.
 *
 * The fitness answers (goal, experience, duration) live in the Fitness Goals
 * and Workout sections so each screen stays focused. Saving here only touches
 * the local account record — never the password.
 */
function ProfileSettings() {
  const { user, profile, updateAccount } = useAuth()
  const { notify } = useNotifications()

  const [values, setValues] = useState(() => ({
    name: user?.name ?? '',
    email: user?.email ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const initials = getUserInitials(values.name || user?.name)

  function setValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (busy) return

    const nextErrors = {}
    const nameError = validateName(values.name)
    if (nameError) nextErrors.name = nameError
    if (String(values.name).trim().length > 60) {
      nextErrors.name = 'Please keep your name under 60 characters.'
    }
    const emailError = validateEmail(values.email)
    if (emailError) nextErrors.email = emailError

    setErrors(nextErrors)
    setFormError('')

    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0]
      const field = document.querySelector(`#profile-${firstKey}`)
      field?.focus()
      return
    }

    setBusy(true)
    const result = updateAccount({
      name: String(values.name).trim(),
      email: String(values.email).trim(),
    })
    setBusy(false)

    if (!result.ok) {
      if (result.errors?.name || result.errors?.email) setErrors(result.errors)
      else setFormError(result.errors?.form ?? 'Unable to save settings.')
      return
    }

    notify({ tone: 'success', title: 'Profile updated', message: 'Profile updated successfully.' })
  }

  return (
    <SettingsSection
      id="profile"
      eyebrow="Profile"
      title="Your profile"
      description="How BeFit greets you and where your account is stored."
    >
      <div className="settings-profile">
        <span className="settings-profile__avatar" aria-hidden="true">
          {initials}
        </span>
        <div className="settings-profile__meta">
          <p className="settings-profile__name">{values.name || 'Athlete'}</p>
          <p className="settings-profile__status">
            {isProfileComplete(profile) ? 'Fitness profile complete' : 'Fitness profile incomplete'}
          </p>
        </div>
      </div>

      <form className="settings-form" onSubmit={handleSubmit} noValidate aria-busy={busy}>
        {formError && (
          <p className="form-field__error" role="alert">
            {formError}
          </p>
        )}

        <TextField
          id="profile-name"
          name="name"
          label="Name"
          value={values.name}
          onChange={(event) => setValue('name', event.target.value)}
          error={errors.name}
          hint="Shown on your dashboard and to your AI coach."
          autoComplete="name"
          required
        />

        <TextField
          id="profile-email"
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={(event) => setValue('email', event.target.value)}
          error={errors.email}
          hint="Your login email. Changing it updates how you sign in on this device."
          autoComplete="email"
          required
        />

        <div className="settings-form__actions">
          <Button type="submit" variant="primary" disabled={busy} aria-busy={busy}>
            {busy ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}

export default ProfileSettings
