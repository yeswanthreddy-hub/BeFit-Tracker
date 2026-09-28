import { useState } from 'react'
import TextField from './TextField'

/**
 * Password input with a show/hide control.
 *
 * The toggle is a plain <button type="button"> so it never submits the form,
 * and it keeps a visible text label instead of pulling in an icon library.
 * Any extra `labelAction` (e.g. "Forgot password?") is rendered alongside it.
 */
function PasswordField({ id, label, labelAction = null, ...rest }) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      labelAction={
        <>
          {labelAction}
          <button
            type="button"
            className="auth-form__link-button"
            aria-controls={id}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? 'Hide' : 'Show'}
            <span className="visually-hidden"> {label.toLowerCase()}</span>
          </button>
        </>
      }
      {...rest}
    />
  )
}

export default PasswordField
