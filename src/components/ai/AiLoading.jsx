/**
 * The in-flight state for an AI request.
 *
 * A soft pulsing orb, an animated "Analyzing your progress…" line and a
 * skeleton of the result to come, so the wait reads as work happening rather
 * than a blank panel. Marked `role="status"` so assistive tech announces it.
 */
function AiLoading({ label = 'Analyzing your progress' }) {
  return (
    <div className="ai-loading card" role="status">
      <div className="ai-loading__orb" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <p className="ai-loading__label">
        {label}
        <span className="ai-loading__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </p>

      <div className="ai-loading__skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

export default AiLoading
