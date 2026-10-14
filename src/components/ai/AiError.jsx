import Button from '../ui/Button'

/**
 * The failed state for an AI request.
 *
 * Shows the human message the service produced, never a stack trace or key.
 * `not_configured` is a setup problem the athlete cannot fix by retrying, so
 * that case hides the retry button and explains what a maintainer must do.
 */
function AiError({ error, onRetry }) {
  const notConfigured = error?.code === 'not_configured'

  return (
    <div className="ai-error card" role="alert">
      <span className="ai-error__icon" aria-hidden="true">
        {notConfigured ? '🔒' : '⚠️'}
      </span>
      <p className="ai-error__title">
        {notConfigured ? 'AI Fitness needs setup' : "We couldn't generate your insight"}
      </p>
      <p className="ai-error__text">{error?.message}</p>

      {!notConfigured && onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export default AiError
