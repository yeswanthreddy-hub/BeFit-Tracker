import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormAlert from '../components/auth/FormAlert'
import PasswordField from '../components/auth/PasswordField'
import TextField from '../components/auth/TextField'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { firstInvalidField, MIN_PASSWORD_LENGTH } from '../utils/validation'

const EMPTY_VALUES = { name: '', email: '', password: '', confirmPassword: '' }

function RegisterPage() {
  const { register } = useAuth()
  const { notify } = useNotifications()
  const navigate = useNavigate()
  const timerRef = useRef(null)

  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [formError, setFormError] = useState('')

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (status !== 'idle') return

    const result = register(values)

    if (!result.ok) {
      setErrors(result.errors)
      setFormError('')
      const field = firstInvalidField(result.errors)
      if (field) {
        document.getElementById(`register-${field}`)?.focus()
      } else {
        setFormError('Please review the details above and try again.')
      }
      return
    }

    setErrors({})
    setFormError('')
    setStatus('success')
    notify({
      tone: 'success',
      title: 'Welcome to BeFit',
      message: `Account created for ${result.user.name}.`,
    })
    timerRef.current = setTimeout(() => {
      navigate('/onboarding', { replace: true })
    }, 700)
  }

  const busy = status !== 'idle'

  return (
    <div className="auth-form">
      <p className="auth-form__eyebrow">Create account</p>
      <h1 className="auth-form__title">Join BeFit</h1>
      <p className="auth-form__sub">
        Set up your local profile in under a minute. No email confirmation, no
        waiting — your account is ready instantly.
      </p>

      {status === 'success' ? (
        <FormAlert tone="success" title="Account created">
          <p>Now a few quick questions so BeFit can tailor your training…</p>
        </FormAlert>
      ) : (
        <form
          className="auth-form__body"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={busy}
        >
          {formError && <FormAlert>{formError}</FormAlert>}

          <TextField
            id="register-name"
            name="name"
            label="Full name"
            value={values.name}
            onChange={handleChange}
            placeholder="Alex Carter"
            autoComplete="name"
            error={errors.name}
            disabled={busy}
            required
          />

          <TextField
            id="register-email"
            name="email"
            type="email"
            label="Email"
            value={values.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email}
            disabled={busy}
            required
          />

          <PasswordField
            id="register-password"
            name="password"
            label="Password"
            value={values.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
            error={errors.password}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            disabled={busy}
            required
          />

          <PasswordField
            id="register-confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            value={values.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            disabled={busy}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="btn--block"
            disabled={busy}
            aria-busy={busy}
          >
            {busy && <span className="btn__spinner" aria-hidden="true" />}
            {busy ? 'Creating Account…' : 'Create Account'}
          </Button>

          <Button to="/login" variant="ghost" className="btn--block" disabled={busy}>
            Back to Login
          </Button>
        </form>
      )}

      <p className="auth-form__note">
        <strong>Local demo:</strong> your details are stored only in this
        browser, and the password is kept as plain text — anyone with access to
        this browser can read it. Use a throwaway password, not a real one.
      </p>

      <p className="auth-form__switch">
        Already training with BeFit?{' '}
        <Link to="/login">Log in instead</Link>
      </p>
    </div>
  )
}

export default RegisterPage
