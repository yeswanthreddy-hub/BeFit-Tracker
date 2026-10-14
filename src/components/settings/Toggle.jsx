/**
 * Accessible on/off switch.
 *
 * A real <button role="switch"> keeps keyboard focus and Space/Enter handling
 * from the platform, and `aria-checked` tells screen readers the state. The
 * visible label is a <label> tied to the button id so clicking the text also
 * works while keeping proper labelling.
 */
function Toggle({ id, label, description = '', checked, onChange, disabled = false }) {
  const descId = description ? `${id}-desc` : undefined

  return (
    <div className="settings-toggle">
      <div className="settings-toggle__text">
        <label className="settings-toggle__label" htmlFor={id}>
          {label}
        </label>
        {description && (
          <p className="settings-toggle__desc" id={descId}>
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-describedby={descId}
        className={`toggle${checked ? ' toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
        disabled={disabled}
      >
        <span className="toggle__knob" aria-hidden="true" />
      </button>
    </div>
  )
}

export default Toggle
