function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="state__spinner" aria-hidden="true" />
      <p className="state__label">{label}</p>
    </div>
  )
}

export default LoadingState