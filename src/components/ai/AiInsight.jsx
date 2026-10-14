/**
 * One titled list of strings inside a result.
 *
 * Renders nothing when the list is empty, so a short answer does not leave
 * empty headings behind.
 */
function InsightList({ title, items, tone = 'default', ordered = false }) {
  if (!Array.isArray(items) || items.length === 0) return null

  const ListTag = ordered ? 'ol' : 'ul'

  return (
    <div className={`ai-result__group ai-result__group--${tone}`}>
      <h3 className="ai-result__group-title">{title}</h3>
      <ListTag className="ai-result__list">
        {items.map((item, index) => (
          <li key={index} className="ai-result__item">
            {item}
          </li>
        ))}
      </ListTag>
    </div>
  )
}

/**
 * The rendered AI insight.
 *
 * Takes the normalised result the service guarantees: a title, summary and up
 * to four lists plus a next step. Every field is optional, so a partial answer
 * still renders cleanly instead of showing blanks.
 */
function AiInsight({ action, result }) {
  return (
    <article className="ai-result card" aria-labelledby="ai-result-title">
      <div className="ai-result__glow" aria-hidden="true" />

      <header className="ai-result__head">
        {action?.icon && (
          <span className="ai-result__icon" aria-hidden="true">
            {action.icon}
          </span>
        )}
        <div>
          {action?.title && <p className="ai-result__eyebrow">{action.title}</p>}
          <h2 className="ai-result__title" id="ai-result-title">
            {result.title}
          </h2>
        </div>
      </header>

      {result.summary && <p className="ai-result__summary">{result.summary}</p>}

      <div className="ai-result__grid">
        <InsightList title="Highlights" items={result.highlights} tone="primary" />
        <InsightList title="Focus areas" items={result.focusAreas} tone="accent" />
      </div>

      <InsightList title="Recommendations" items={result.recommendations} ordered />

      {result.nextStep && (
        <div className="ai-result__next">
          <span className="ai-result__next-label">Next step</span>
          <p className="ai-result__next-text">{result.nextStep}</p>
        </div>
      )}

      <p className="ai-result__note">
        AI-generated guidance based on your logged data — not medical advice.
      </p>
    </article>
  )
}

export default AiInsight
