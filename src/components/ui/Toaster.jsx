import { useNotifications } from '../../hooks/useNotifications'

const ICONS = {
  success: '✓',
  error: '!',
  info: 'i',
}

/**
 * App-wide notification stack.
 *
 * Messages are announced through a polite live region; errors are assertive
 * so a failure is never missed.
 */
function Toaster() {
  const { toasts, dismiss } = useNotifications()

  return (
    <div className="toaster" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.tone}`}
          role={toast.tone === 'error' ? 'alert' : 'status'}
        >
          <span className="toast__icon" aria-hidden="true">
            {ICONS[toast.tone] ?? ICONS.info}
          </span>
          <div className="toast__body">
            <p className="toast__title">{toast.title}</p>
            {toast.message && <p className="toast__message">{toast.message}</p>}
          </div>
          <button
            type="button"
            className="toast__close"
            onClick={() => dismiss(toast.id)}
          >
            <span aria-hidden="true">×</span>
            <span className="visually-hidden">Dismiss notification</span>
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toaster
