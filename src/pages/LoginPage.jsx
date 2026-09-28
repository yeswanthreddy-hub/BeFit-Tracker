import Button from '../components/ui/Button'

function LoginPage() {
  return (
    <div className="auth-form">
      <p className="auth-form__eyebrow">Sign in</p>
      <h1 className="auth-form__title">Welcome back</h1>
      <p className="auth-form__sub">
        Local sign-in is the next BeFit milestone. Create your account first —
        everything stays in this browser.
      </p>
      <div className="auth-form__body">
        <Button to="/register" variant="primary" size="lg" className="btn--block">
          Create Account
        </Button>
      </div>
    </div>
  )
}

export default LoginPage
