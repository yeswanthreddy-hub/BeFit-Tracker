import { useState } from 'react'

import SettingsSection from './SettingsSection'
import ChoiceGroup from '../auth/ChoiceGroup'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useSettings } from '../../hooks/useSettings'
import { useNotifications } from '../../hooks/useNotifications'
import { DEFAULT_WORKOUT_DURATION } from '../../services/authService'
import { DURATION_OPTIONS } from '../../data/onboarding'
import { WORKOUT_STYLE_OPTIONS } from '../../utils/settings'

const DURATION_CHOICES = DURATION_OPTIONS.map((minutes) => ({
  value: minutes,
  label: `${minutes} min`,
  description:
    minutes <= 20 ? 'Quick session' : minutes >= 60 ? 'Long session' : 'Standard session',
}))

/**
 * Workout preferences: how long the athlete likes to train and what style they
 * enjoy. The duration is stored on the profile (shared with onboarding); the
 * style is a Settings value that feeds the dashboard recommendation.
 */
function WorkoutPreferences() {
  const { profile, updateProfile } = useAuth()
  const { settings, updateSettings } = useSettings()
  const { notify } = useNotifications()

  const [duration, setDuration] = useState(
    () => Number(profile?.preferredWorkoutDuration) || DEFAULT_WORKOUT_DURATION,
  )
  const [style, setStyle] = useState(
    () => settings.preferredWorkoutStyle ?? 'Mixed',
  )
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    const saved = updateProfile({ preferredWorkoutDuration: Number(duration) })
    updateSettings({ preferredWorkoutStyle: style })
    setBusy(false)

    if (!saved) {
      setFormError('We could not save your workout preferences. Please try again.')
      return
    }

    notify({ tone: 'success', title: 'Workout preferences saved', message: 'Settings updated.' })
  }

  return (
    <SettingsSection
      id="workout"
      eyebrow="Workout Preferences"
      title="Workout Preferences"
      description="BeFit uses these to shape the sessions it recommends."
    >
      <form className="settings-form settings-form--compact" onSubmit={handleSubmit} noValidate aria-busy={busy}>
        {formError && (
          <p className="form-field__error" role="alert">
            {formError}
          </p>
        )}

        <ChoiceGroup
          name="workoutDuration"
          legend="Preferred workout duration"
          hint="How long is a typical session for you?"
          options={DURATION_CHOICES}
          value={duration}
          onChange={setDuration}
        />

        <ChoiceGroup
          name="workoutStyle"
          legend="Preferred workout style"
          hint="Used to tailor the focus of your recommended sessions."
          options={WORKOUT_STYLE_OPTIONS}
          value={style}
          onChange={setStyle}
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

export default WorkoutPreferences
