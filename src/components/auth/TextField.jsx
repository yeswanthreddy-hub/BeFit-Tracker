/**
 * Labelled text input used by the BeFit auth forms.
 *
 * Validation messages are wired to the input through `aria-describedby`, and
 * `aria-invalid` flips as soon as the field is in an error state.
 */
function TextField({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  error = '',
  hint = '',
  placeholder = '',
  autoComplete,
  required = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`form-field${error ? ' form-field--error' : ''} ${className}`.trim()}>
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>

      <input
        id={id}
        name={name}
        className="field"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...rest}
      />

      {hint && !error && (
        <p className="form-field__hint" id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <p className="form-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

export default TextField
