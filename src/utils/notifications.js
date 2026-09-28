/**
 * Notification queue helpers.
 *
 * Kept pure and separate from the provider so the "do not spam" rules can be
 * reasoned about (and tested) without React.
 */

export const MAX_VISIBLE = 3

/** Lower number = more important, so a success/info toast is dropped first. */
export const TONE_PRIORITY = { error: 0, success: 1, info: 2 }

export function tonePriority(tone) {
  return TONE_PRIORITY[tone] ?? TONE_PRIORITY.info
}

/**
 * Add a toast to the queue.
 *
 * - An identical title re-uses the existing toast (dedupe) and returns
 *   `replacedId` so its dismissal timer can be restarted.
 * - When the queue is full the least important toast is dropped.
 */
export function queueToast(current, toast) {
  const duplicate = current.find((item) => item.title === toast.title)

  if (duplicate) {
    return {
      toasts: current.map((item) =>
        item.id === duplicate.id ? { ...item, tone: toast.tone, message: toast.message } : item,
      ),
      replacedId: duplicate.id,
      addedId: null,
      droppedId: null,
    }
  }

  const next = [...current, toast]

  if (next.length <= MAX_VISIBLE) {
    return { toasts: next, replacedId: null, addedId: toast.id, droppedId: null }
  }

  const weakest = next.reduce((worst, item) =>
    tonePriority(item.tone) > tonePriority(worst.tone) ? item : worst,
  )

  return {
    toasts: next.filter((item) => item.id !== weakest.id),
    replacedId: null,
    addedId: toast.id,
    droppedId: weakest.id,
  }
}
