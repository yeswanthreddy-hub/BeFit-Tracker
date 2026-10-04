import { useEffect } from 'react'

import Button from './Button'

/**
 * A yes/no dialog for actions that destroy something.
 *
 * Deleting a saved workout cannot be undone from anywhere else in BeFit, so it
 * asks first instead of firing immediately from a card button.
 *
 * Accessibility notes: the panel is a labelled `aria-modal` dialog, the
 * destructive button takes focus on open so a keyboard user can confirm or
 * escape without hunting for it, Escape cancels, and clicking the backdrop
 * cancels. Renders nothing while closed, which keeps it out of the tab order.
 *
 * @param {{open: boolean, title: string, description: string,
 *   confirmLabel?: string, cancelLabel?: string, busyLabel?: string,
 *   onConfirm: () => void, onCancel: () => void}} props
 */
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  busyLabel,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="confirm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        className="confirm__panel card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-text"
      >
        <h2 className="confirm__title" id="confirm-dialog-title">
          {title}
        </h2>
        <p className="confirm__text" id="confirm-dialog-text">
          {description}
        </p>

        <div className="confirm__actions">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} autoFocus>
            {busyLabel ?? confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog