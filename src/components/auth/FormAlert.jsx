/**
 * Accessible message area for form-level feedback.
 *
 * Errors use `role="alert"` so they are announced immediately, while
 * success/info messages use a polite live region. No `alert()` dialogs.
 */
function FormAlert({ tone = 'error', title, children }) {
  if (!title && !children) return null

  return (
    <div
      className={`form-alert form-alert--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      {title && <p className="form-alert__title">{title}</p>}
      {children && <div className="form-alert__body">{children}</div>}
    </div>
  )
}

export default FormAlert
