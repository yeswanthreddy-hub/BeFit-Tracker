/**
 * Accessible radio group used by the onboarding form.
 *
 * Each option is a real <input type="radio"> inside its <label>, so keyboard
 * navigation, screen-reader grouping and the fieldset/legend semantics all
 * come from the platform instead of custom key handling.
 */
function ChoiceGroup({ name, legend, hint, options, value, onChange, error = '' }) {
  return (
    <fieldset className="onboarding__group">
      <legend className="onboarding__legend">
        {legend}
        {hint && <span>{hint}</span>}
      </legend>

      <div className="onboarding__options">
        {options.map((option) => {
          const inputValue = String(option.value)
          return (
            <label
              key={inputValue}
              className="onboarding__option"
            >
              <input
                type="radio"
                name={name}
                value={inputValue}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
              />
              <span className="onboarding__option-title">{option.label}</span>
              {option.description && (
                <span className="onboarding__option-meta">{option.description}</span>
              )}
            </label>
          )
        })}
      </div>

      {error && (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default ChoiceGroup
