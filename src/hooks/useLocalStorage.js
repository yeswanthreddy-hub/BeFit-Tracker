import { useState, useCallback } from 'react'
import { getValue, setItem, removeItem } from '../utils/storage'

/**
 * React hook backed by BeFit's storage utilities.
 * Reads a namespaced localStorage value once and keeps it in sync.
 *
 * Returns [value, set, remove]:
 *  - `set` accepts a value or an updater function
 *  - `remove` resets to the initial value and deletes the key
 */
export function useLocalStorage(key, initialValue = null) {
  const [value, setValue] = useState(() => getValue(key, initialValue))

  const set = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(value) : next
      setValue(resolved)
      setItem(key, resolved)
    },
    [key, value],
  )

  const remove = useCallback(() => {
    setValue(initialValue)
    removeItem(key)
  }, [key, initialValue])

  return [value, set, remove]
}