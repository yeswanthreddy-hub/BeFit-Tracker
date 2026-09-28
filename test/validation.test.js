import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  AUTH_MESSAGES,
  MIN_PASSWORD_LENGTH,
  firstInvalidField,
  validateConfirmPassword,
  validateEmail,
  validateLoginForm,
  validateName,
  validatePassword,
  validateRegisterForm,
} from '../src/utils/validation.js'

const valid = {
  name: 'Alex Carter',
  email: 'alex@example.com',
  password: 'strongpass',
  confirmPassword: 'strongpass',
}

describe('validateName', () => {
  it('requires a value', () => {
    assert.equal(validateName(''), AUTH_MESSAGES.nameRequired)
    assert.equal(validateName('   '), AUTH_MESSAGES.nameRequired)
  })

  it('accepts a name', () => {
    assert.equal(validateName('Alex Carter'), '')
  })
})

describe('validateEmail', () => {
  it('reports a missing email', () => {
    assert.equal(validateEmail(''), AUTH_MESSAGES.emailRequired)
    assert.equal(validateEmail('  '), AUTH_MESSAGES.emailRequired)
  })

  it('rejects implausible formats', () => {
    for (const bad of ['plain', 'no-at-sign.com', '@example.com', 'a@b', 'a b@example.com', 'a@ex ample.com']) {
      assert.equal(validateEmail(bad), AUTH_MESSAGES.emailInvalid, `expected rejection for ${bad}`)
    }
  })

  it('accepts reasonable addresses', () => {
    for (const good of ['a@b.co', 'first.last@example.com', 'user+tag@sub.domain.org']) {
      assert.equal(validateEmail(good), '', `expected acceptance for ${good}`)
    }
  })
})

describe('validatePassword', () => {
  it('reports a missing password', () => {
    assert.equal(validatePassword(''), AUTH_MESSAGES.passwordRequired)
  })

  it('enforces the minimum length', () => {
    assert.equal(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH - 1)), AUTH_MESSAGES.passwordTooShort)
    assert.equal(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH)), '')
  })
})

describe('validateConfirmPassword', () => {
  it('requires a confirmation', () => {
    assert.equal(validateConfirmPassword('strongpass', ''), AUTH_MESSAGES.confirmRequired)
  })

  it('requires a match', () => {
    assert.equal(validateConfirmPassword('strongpass', 'different1'), AUTH_MESSAGES.passwordMismatch)
  })

  it('accepts a match', () => {
    assert.equal(validateConfirmPassword('strongpass', 'strongpass'), '')
  })
})

describe('validateRegisterForm', () => {
  it('passes a complete form', () => {
    assert.deepEqual(validateRegisterForm(valid), {})
  })

  it('collects every failing field at once', () => {
    const errors = validateRegisterForm({ name: '', email: 'nope', password: '1', confirmPassword: '2' })
    assert.deepEqual(Object.keys(errors).sort(), ['email', 'name', 'password'])
  })

  it('reports the mismatch once the password itself is long enough', () => {
    const errors = validateRegisterForm({
      name: '',
      email: 'nope',
      password: 'longenough',
      confirmPassword: 'different',
    })
    assert.deepEqual(Object.keys(errors).sort(), ['confirmPassword', 'email', 'name'])
  })

  it('rejects a duplicate email when the hook says so', () => {
    const errors = validateRegisterForm(valid, { isEmailTaken: () => true })
    assert.equal(errors.email, AUTH_MESSAGES.emailTaken)
  })

  it('does not flag duplicates without the hook', () => {
    assert.equal(validateRegisterForm(valid).email, undefined)
  })

  it('does not report a mismatch when the password itself is too short', () => {
    const errors = validateRegisterForm({ ...valid, password: '1', confirmPassword: '2' })
    assert.equal(errors.confirmPassword, undefined)
  })

  it('tolerates missing input', () => {
    assert.equal(typeof validateRegisterForm().name, 'string')
  })
})

describe('validateLoginForm', () => {
  it('passes a complete form', () => {
    assert.deepEqual(validateLoginForm({ email: 'a@b.co', password: 'x' }), {})
  })

  it('requires both fields', () => {
    assert.deepEqual(validateLoginForm({ email: '', password: '' }), {
      email: AUTH_MESSAGES.emailRequired,
      password: AUTH_MESSAGES.passwordRequired,
    })
  })

  it('does not impose a minimum length on an existing password', () => {
    assert.deepEqual(validateLoginForm({ email: 'a@b.co', password: 'x' }), {})
  })
})

describe('firstInvalidField', () => {
  it('returns the first key in insertion order', () => {
    assert.equal(firstInvalidField({ name: 'a', email: 'b' }), 'name')
  })

  it('returns an empty string when nothing is invalid', () => {
    assert.equal(firstInvalidField({}), '')
  })
})
