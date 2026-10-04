/**
 * Labelled multi-line input, matching `TextField`.
 *
 * Used wherever an athlete writes a sentence rather than a value: the workout
 * builder's description, and any future meal or note field. Validation messages
 * are wired to the textarea through `aria-describedby`, and `aria-invalid`
 * flips as soon as the field is in an error state.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.name
 * @param {string} props.label
 * @param {string} props.value
 * @param {(event: {target: {value: string}}) => void} props.onChange
 * @param {string} [props.error]   validation message shown under the field
 * @param {string} [props.hint]    helper text shown while there is no error
 * @param {string} [props.placeholder]
 * @param {number} [props.maxLength]
 * @param {number} [props.rows]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
function TextAreaField({
  id,
  name,
  label,
  value,
  onChange,
  error = '',
  hint = '',
  placeholder = '',
  maxLength,
  rows = 3,
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
      <textarea
        id={id}
        name={name}
        className="field"
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
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

export default TextAreaField