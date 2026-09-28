import { useCallback, useMemo, useRef, useState } from 'react'
import NotificationContext from './notificationContext'
import { queueToast } from '../utils/notifications'

const DEFAULT_DURATION = 4000

/**
 * Lightweight notification queue.
 *
 * Deliberately restrained: identical messages re-use their toast, the stack
 * is capped, and the least important toast is dropped first. Validation
 * errors stay inline in the forms — this channel is for outcomes (signed in,
 * profile saved, signed out).
 */
export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())
  const counterRef = useRef(0)

  const clearTimer = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) clearTimeout(timer)
    timersRef.current.delete(id)
  }, [])

  const dismiss = useCallback(
    (id) => {
      clearTimer(id)
      setToasts((current) => current.filter((toast) => toast.id !== id))
    },
    [clearTimer],
  )

  const schedule = useCallback(
    (id, duration) => {
      clearTimer(id)
      timersRef.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      )
    },
    [clearTimer, dismiss],
  )

  const notify = useCallback(
    ({ tone = 'info', title, message = '', duration = DEFAULT_DURATION } = {}) => {
      counterRef.current += 1
      const id = `toast-${counterRef.current}`
      const toast = { id, tone, title, message }

      setToasts((current) => {
        const result = queueToast(current, toast)
        if (result.droppedId) clearTimer(result.droppedId)
        if (result.replacedId) schedule(result.replacedId, duration)
        if (result.addedId) schedule(result.addedId, duration)
        return result.toasts
      })

      return id
    },
    [clearTimer, schedule],
  )

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
