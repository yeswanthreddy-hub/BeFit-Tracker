/**
 * Form validation for the BeFit authentication screens.
 *
 * The rules are pure so pages can re-run them on every submit and share the
 * exact same human-readable messages. Nothing here touches storage.
 */

export const MIN_PASSWORD_LENGTH = 6

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

export const AUTH_MESSAGES = {
  nameRequired: 'Please enter your name.',
  emailRequired: 'Please enter your email address.',
  emailInvalid: 'Please enter a valid email address.',
  passwordRequired: 'Please enter your password.',
  passwordTooShort: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  confirmRequired: 'Please confirm your password.',
  passwordMismatch: 'Passwords do not match.',
  emailTaken: 'An account with this email already exists.',
  invalidCredentials: 'Email or password is incorrect.',
}

export function validateName(value) {
  return String(value ?? '').trim() ? '' : AUTH_MESSAGES.nameRequired
}

export function validateEmail(value) {
  const email = String(value ?? '').trim()
  if (!email) return AUTH_MESSAGES.emailRequired
  if (!EMAIL_PATTERN.test(email)) return AUTH_MESSAGES.emailInvalid
  return ''
}

export function validatePassword(value) {
  const password = String(value ?? '')
  if (!password) return AUTH_MESSAGES.passwordRequired
  if (password.length < MIN_PASSWORD_LENGTH) return AUTH_MESSAGES.passwordTooShort
  return ''
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!String(confirmPassword ?? '')) return AUTH_MESSAGES.confirmRequired
  if (password !== confirmPassword) return AUTH_MESSAGES.passwordMismatch
  return ''
}

/**
 * Validate the register form.
 *
 * @param {{name: string, email: string, password: string, confirmPassword: string}} values
 * @param {{isEmailTaken?: (email: string) => boolean}} options
 * @returns {Object} map of field name -> message (only failing fields)
 */
export function validateRegisterForm(values = {}, { isEmailTaken } = {}) {
  const { name = '', email = '', password = '', confirmPassword = '' } = values
  const errors = {}

  const nameError = validateName(name)
  if (nameError) errors.name = nameError

  const emailError = validateEmail(email)
  if (emailError) {
    errors.email = emailError
  } else if (typeof isEmailTaken === 'function' && isEmailTaken(email)) {
    errors.email = AUTH_MESSAGES.emailTaken
  }

  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError

  const confirmError = validatePassword(password)
    ? ''
    : validateConfirmPassword(password, confirmPassword)
  if (confirmError) errors.confirmPassword = confirmError

  return errors
}

/** Validate the login form. Kept separate so it can be reused anywhere. */
export function validateLoginForm(values = {}) {
  const { email = '', password = '' } = values
  const errors = {}

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  if (!String(password ?? '')) errors.password = AUTH_MESSAGES.passwordRequired

  return errors
}

/** First field key present in an error map, used to move focus on submit. */
export function firstInvalidField(errors = {}) {
  return Object.keys(errors)[0] ?? ''
}
