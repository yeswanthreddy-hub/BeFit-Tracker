import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import ChoiceGroup from '../components/auth/ChoiceGroup'
import FormAlert from '../components/auth/FormAlert'
import { useAuth } from '../hooks/useAuth'
import { DEFAULT_WORKOUT_DURATION } from '../services/authService'
import {
  DURATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  ONBOARDING_MESSAGES,
  isProfileComplete,
} from '../data/onboarding'

const DURATION_CHOICES = DURATION_OPTIONS.map((minutes) => ({
  value: minutes,
  label: `${minutes} minutes`,
  description: minutes <= 20 ? 'Express session' : minutes >= 60 ? 'Full training block' : 'Balanced session',
}))

function OnboardingPage() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState(() => ({
    fitnessGoal: profile?.fitnessGoal || '',
    experienceLevel: profile?.experienceLevel || '',
    preferredWorkoutDuration: Number(profile?.preferredWorkoutDuration) || DEFAULT_WORKOUT_DURATION,
  }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const firstName = user?.name?.split(' ')[0] ?? 'athlete'
  const editing = isProfileComplete(profile)

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
      const first = document.querySelector('.onboarding__group input')
      first?.focus()
      return
    }

    setBusy(true)
    updateProfile({
      fitnessGoal: values.fitnessGoal,
      experienceLevel: values.experienceLevel,
      preferredWorkoutDuration: Number(values.preferredWorkoutDuration),
    })
    navigate('/dashboard', { replace: true })
  }

  function handleSkip() {
    navigate('/dashboard')
  }

  return (
    <div className="onboarding">
      <p className="auth-form__eyebrow">{editing ? 'Profile settings' : 'Step 1 of 1'}</p>
      <h1 className="auth-form__title">
        {editing ? 'Tune your profile' : `Welcome, ${firstName}`}
      </h1>
      <p className="auth-form__sub">
        Three quick answers and BeFit can shape plans, recommendations and
        reminders around you. You can change any of this later in settings.
      </p>

      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        {formError && <FormAlert>{formError}</FormAlert>}

        <ChoiceGroup
          name="fitnessGoal"
          legend="Fitness goal"
          hint="What are you training for right now?"
          options={FITNESS_GOAL_OPTIONS}
          value={values.fitnessGoal}
          onChange={(value) => setValue('fitnessGoal', value)}
          error={errors.fitnessGoal}
        />

        <ChoiceGroup
          name="experienceLevel"
          legend="Experience level"
          hint="This sets the intensity BeFit suggests."
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

        <Button type="submit" variant="primary" size="lg" className="btn--block" disabled={busy}>
          {busy ? 'Saving…' : 'Complete Setup'}
        </Button>

        <Button type="button" variant="ghost" className="btn--block" onClick={handleSkip} disabled={busy}>
          Skip for now
        </Button>
      </form>

      <p className="auth-form__note">
        <strong>Stored locally:</strong> these answers are saved to this
        browser's <code>befit_profile</code> and stay on this device.
      </p>
    </div>
  )
}

export default OnboardingPage
