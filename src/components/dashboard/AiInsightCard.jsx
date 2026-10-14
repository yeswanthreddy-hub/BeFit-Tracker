import Button from '../ui/Button'
import { useAiInsights } from '../../hooks/useAiInsights'
import { getAiAction } from '../../data/aiActions'
import { formatInsightTime } from '../../utils/aiHistory'

/** Keep the dashboard teaser to a readable couple of lines. */
function clamp(text, max = 180) {
  const value = typeof text === 'string' ? text.trim() : ''
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trimEnd()}…`
}

/**
 * AI Fitness Insight on the dashboard.
 *
 * Surfaces the newest saved insight without ever generating one on load — a
 * request only happens when the athlete asks for it on the AI page, so opening
 * the dashboard never spends an API call. Before the first insight it invites
 * the athlete in instead of showing an empty panel.
 */
function AiInsightCard() {
  const { latest } = useAiInsights()
  const action = latest ? getAiAction(latest.action) : null

  return (
    <section className="ai-insight-card card" aria-labelledby="dashboard-ai-title">
      <div className="ai-insight-card__glow" aria-hidden="true" />

      <div className="ai-insight-card__head">
        <div>
          <p className="ai-insight-card__eyebrow">BeFit AI</p>
          <h2 className="ai-insight-card__heading" id="dashboard-ai-title">
            AI Fitness Insight
          </h2>
        </div>
        <Button to="/ai-tracker" variant="secondary" size="sm">
          Open AI Fitness Tracker
        </Button>
      </div>

      {latest ? (
        <div className="ai-insight-card__body">
          <p className="ai-insight-card__meta">
            <span className="ai-insight-card__badge">{action?.icon ?? '✦'}</span>
            {action?.title ?? 'AI insight'}
            {formatInsightTime(latest.createdAt) && (
              <time dateTime={latest.createdAt}> · {formatInsightTime(latest.createdAt)}</time>
            )}
          </p>
          <p className="ai-insight-card__title">{latest.result.title}</p>
          {latest.result.summary && (
            <p className="ai-insight-card__summary">{clamp(latest.result.summary)}</p>
          )}
        </div>
      ) : (
        <p className="ai-insight-card__empty">Get your first AI fitness insight.</p>
      )}

      <p className="ai-insight-card__note">
        Generated from your BeFit workouts, nutrition and progress — never your account credentials.
      </p>
    </section>
  )
}

export default AiInsightCard
