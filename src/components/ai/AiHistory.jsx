import Button from '../ui/Button'
import { getAiAction } from '../../data/aiActions'
import { formatInsightTime } from '../../utils/aiHistory'

/**
 * Previous AI insights.
 *
 * Read-only list of the newest saved insights with a "Clear AI History"
 * action. It renders nothing when there is no history, so the page does not
 * show an empty section on a first visit.
 */
function AiHistory({ insights, onClear }) {
  if (!Array.isArray(insights) || insights.length === 0) return null

  return (
    <section className="ai-history card" aria-labelledby="ai-history-title">
      <div className="ai-history__head">
        <div>
          <p className="ai-history__eyebrow">Saved locally</p>
          <h2 className="ai-history__title" id="ai-history-title">
            Recent AI insights
          </h2>
        </div>
        {onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear AI History
          </Button>
        )}
      </div>

      <ul className="ai-history__list">
        {insights.map((item) => {
          const action = getAiAction(item.action)
          return (
            <li key={item.id} className="ai-history__item">
              <span className="ai-history__icon" aria-hidden="true">
                {action?.icon ?? '✦'}
              </span>
              <div className="ai-history__body">
                <p className="ai-history__label">{action?.title ?? 'AI insight'}</p>
                <p className="ai-history__text">
                  {item.result.title}
                  {item.result.summary ? ` — ${item.result.summary}` : ''}
                </p>
              </div>
              <time className="ai-history__time" dateTime={item.createdAt}>
                {formatInsightTime(item.createdAt)}
              </time>
            </li>
          )
        })}
      </ul>

      <p className="ai-history__note">
        Your last {insights.length} insight{insights.length === 1 ? '' : 's'} are kept on this device only.
      </p>
    </section>
  )
}

export default AiHistory
