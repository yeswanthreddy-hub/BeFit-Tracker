import { getRecommendation } from '../../utils/dashboard'

/**
 * Recommended activity based on onboarding data.
 *
 * Pure presentation: the suggestion is produced by `getRecommendation` using
 * deterministic rules (fitness goal + experience level + preferred duration).
 * No AI, no network calls, and no randomness.
 */
function RecommendationCard({ profile }) {
  const rec = getRecommendation(profile)

  return (
    <section className="recommendation card" aria-labelledby="rec-title">
      <div className="recommendation__glow" aria-hidden="true" />
      <p className="recommendation__eyebrow">Recommended for you</p>
      <h2 className="recommendation__title" id="rec-title">
        {rec.title}
      </h2>
      <p className="recommendation__text">{rec.description}</p>
      <div className="recommendation__meta">
        <span className="chip chip--primary">
          <span className="chip__dot" aria-hidden="true" />
          {rec.focus}
        </span>
        {rec.durationMinutes > 0 && (
          <span className="chip">{rec.durationMinutes} min</span>
        )}
        {rec.level && <span className="chip chip--accent">{rec.level}</span>}
        {rec.goal && <span className="chip">{rec.goal}</span>}
      </div>
    </section>
  )
}

export default RecommendationCard