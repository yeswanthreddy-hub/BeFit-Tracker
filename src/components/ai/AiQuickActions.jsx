import { AI_ACTIONS } from '../../data/aiActions'

/**
 * The four AI actions as a grid of cards.
 *
 * Plain buttons rather than links because each one starts an async request.
 * Every card is disabled while a request runs, which is the page's only
 * duplicate-request guard.
 */
function AiQuickActions({ onAction, disabled = false, activeAction = null }) {
  return (
    <ul className="ai-actions">
      {AI_ACTIONS.map((action) => {
        const isActive = activeAction === action.id
        return (
          <li key={action.id} className="ai-actions__item">
            <button
              type="button"
              className={`ai-action${isActive ? ' is-active' : ''}`}
              onClick={() => onAction(action.id)}
              disabled={disabled}
              aria-label={action.cta}
            >
              <span className="ai-action__icon" aria-hidden="true">
                {action.icon}
              </span>
              <span className="ai-action__body">
                <span className="ai-action__label">{action.label}</span>
                <span className="ai-action__desc">{action.description}</span>
              </span>
              <span className="ai-action__arrow" aria-hidden="true">
                →
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default AiQuickActions
