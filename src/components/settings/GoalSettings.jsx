import { useState } from 'react'

import SettingsSection from './SettingsSection'
import ChoiceGroup from '../auth/ChoiceGroup'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { DEFAULT_WORKOUT_DURATION } from '../../services/authService'
import {
  DURATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  ONBOARDING_MESSAGES,
  getGoalDetail,
} from '../../data/onboarding'

const DURATION_CHOICES = DURATION_OPTIONS.map((minutes) => ({
  value: minutes,
  label: `${minutes} minutes`,
  description:
    minutes <= 20 ? 'Express session' : minutes >= 60 ? 'Full training block' : 'Balanced session',
}))

/**
 * Fitness goals: the three onboarding answers that shape recommendations.
 *
 * These are the same fields the onboarding flow writes, saved through the same
 * `updateProfile` path, so the dashboard, deterministic recommendation and AI
 * context all pick up the change immediately.
 */
function GoalSettings() {
  const { profile, updateProfile } = useAuth()
  const { notify } = useNotifications()

  const [values, setValues] = useState(() => ({
    fitnessGoal: profile?.fitnessGoal || '',
    experienceLevel: profile?.experienceLevel || '',
    preferredWorkoutDuration:
      Number(profile?.preferredWorkoutDuration) || DEFAULT_WORKOUT_DURATION,
  }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  function setValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (busy) return

    const nextErrors = {}
    if (!values.fitnessGoal) nextErrors.fitnessGoal = ONBOARDING_MESSAGES.goalRequired
    if (!values.experienceLevel) {
      nextErrors.experienceLevel = ONBOARDING_MESSAGES.experienceRequired
    }

    setErrors(nextErrors)
    setFormError('')

    if (Object.keys(nextErrors).length > 0) {
      document.querySelector('.settings-form .onboarding__group input')?.focus()
      return
    }

    setBusy(true)
    const saved = updateProfile({
      fitnessGoal: values.fitnessGoal,
      experienceLevel: values.experienceLevel,
      preferredWorkoutDuration: Number(values.preferredWorkoutDuration),
    })
    setBusy(false)

    if (!saved) {
      setFormError('We could not save your goals in this browser. Please try again.')
      return
    }

    notify({
      tone: 'success',
      title: 'Goals updated',
      message: `${values.fitnessGoal} · ${values.experienceLevel}.`,
    })
  }

  return (
    <SettingsSection
      id="goals"
      eyebrow="Fitness Goals"
      title="Fitness Goals"
      description="Your goal sets the tone of every recommendation BeFit makes."
    >
      <div className="goal-highlight" role="note">
        <p className="goal-highlight__title">
          {values.fitnessGoal || 'No goal selected yet'}
        </p>
        <p className="goal-highlight__text">{getGoalDetail(values.fitnessGoal)}</p>
      </div>

      <form className="settings-form settings-form--compact" onSubmit={handleSubmit} noValidate aria-busy={busy}>
        {formError && (
          <p className="form-field__error" role="alert">
            {formError}
          </p>
        )}

        <ChoiceGroup
          name="fitnessGoal"
          legend="Primary goal"
          hint="What are you training for right now?"
          options={FITNESS_GOAL_OPTIONS}
          value={values.fitnessGoal}
          onChange={(value) => setValue('fitnessGoal', value)}
          error={errors.fitnessGoal}
        />

        <ChoiceGroup
          name="experienceLevel"
          legend="Experience level"
          hint="Sets the intensity BeFit suggests."
          options={EXPERIENCE_OPTIONS}
          value={values.experienceLevel}
          onChange={(value) => setValue('experienceLevel', value)}
          error={errors.experienceLevel}
        />

        <ChoiceGroup
          name="preferredWorkoutDuration"
          legend="Preferred workout duration"
          hint="How long can you usually train?"
          options={DURATION_CHOICES}
          value={values.preferredWorkoutDuration}
          onChange={(value) => setValue('preferredWorkoutDuration', value)}
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

export default GoalSettings
