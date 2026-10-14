import Button from '../ui/Button'

/**
 * The AI Fitness Coach hero.
 *
 * This is the page's headline element: a glowing, layered card that frames the
 * coach as part of BeFit rather than a generic chat box. The single call to
 * action asks for the day's insight; the button is disabled and relabelled
 * while a request is in flight so it can never be double-fired.
 */
function AiHero({ onStart, isLoading, disabled = false }) {
  return (
    <section className="ai-hero card" aria-labelledby="ai-hero-title">
      <div className="ai-hero__bg" aria-hidden="true" />
      <div className="ai-hero__glow" aria-hidden="true" />

      <div className="ai-hero__content">
        <p className="ai-hero__eyebrow">
          <span className="ai-hero__spark" aria-hidden="true">
            ✦
          </span>
          BeFit AI Coach
        </p>

        <h1 className="ai-hero__title" id="ai-hero-title">
          Your AI Fitness Coach
        </h1>

        <p className="ai-hero__sub">
          Personalized insights based on your workouts, nutrition and progress.
        </p>

        <div className="ai-hero__actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onStart('daily-insight')}
            disabled={isLoading || disabled}
            aria-busy={isLoading}
          >
            {isLoading ? 'Analyzing…' : "Get Today's Insight"}
          </Button>
          <span className="ai-hero__hint">Grounded in your own BeFit data</span>
        </div>
      </div>
    </section>
  )
}

export default AiHero
