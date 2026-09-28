import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormAlert from '../components/auth/FormAlert'
import TextField from '../components/auth/TextField'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { firstInvalidField } from '../utils/validation'

const EMPTY_VALUES = { email: '', password: '' }

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [recoveryOpen, setRecoveryOpen] = useState(false)

  const intended = location.state?.from?.pathname ?? '/dashboard'

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    const result = login(values)

    if (!result.ok) {
      setBusy(false)
      if (result.errors) {
        setErrors(result.errors)
        const field = firstInvalidField(result.errors)
        if (field) document.getElementById(`login-${field}`)?.focus()
      } else {
        setFormError(result.error)
      }
      return
    }

    setErrors({})
    setFormError('')
    navigate(intended, { replace: true })
  }

  return (
    <div className="auth-form">
      <p className="auth-form__eyebrow">Sign in</p>
      <h1 className="auth-form__title">Welcome back</h1>
      <p className="auth-form__sub">
        Your BeFit account lives in this browser, so signing in just unlocks
        the training data you already saved.
      </p>

      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        {formError && <FormAlert>{formError}</FormAlert>}

        <TextField
          id="login-email"
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

        <TextField
          id="login-password"
          name="password"
          type="password"
          label="Password"
          value={values.password}
          onChange={handleChange}
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password}
          labelAction={
            <button
              type="button"
              className="auth-form__link-button"
              aria-expanded={recoveryOpen}
              aria-controls="login-recovery-note"
              onClick={() => setRecoveryOpen((open) => !open)}
            >
              Forgot password?
            </button>
          }
          disabled={busy}
          required
        />

        {recoveryOpen && (
          <FormAlert tone="info" title="Password recovery is not available">
            <p id="login-recovery-note">
              BeFit has no server and no email service, so there is nothing to
              send a reset link to. Accounts exist only in this browser's local
              storage — clearing site data removes them for good. If you cannot
              remember the password, create a new account.
            </p>
          </FormAlert>
        )}

        <Button type="submit" variant="primary" size="lg" className="btn--block" disabled={busy}>
          {busy ? 'Logging In…' : 'Login'}
        </Button>

        <p className="auth-form__legal">
          Local demo only — credentials are compared in the browser against
          plain-text local storage. This is not secure authentication.
        </p>
      </form>

      <p className="auth-form__switch">
        New to BeFit?{' '}
        <Link to="/register">Create an account</Link>
      </p>
    </div>
  )
}

export default LoginPage
