import { useState, useCallback, useEffect, useRef } from 'react'
import { getValue, setItem, removeItem } from '../utils/storage'

/**
 * React hook backed by BeFit's storage utilities.
 * Reads a namespaced localStorage value once and keeps it in sync.
 *
 * Returns [value, set, remove]:
 *  - `set` accepts a value or an updater function
 *  - `remove` resets to the initial value and deletes the key
 *
 * When `key` changes the value is re-read from the new key. That matters for
 * user-scoped keys, where signing in as somebody else must swap the data
 * rather than keep showing the previous account's copy.
 */
export function useLocalStorage(key, initialValue = null) {
  const [value, setValue] = useState(() => getValue(key, initialValue))

  // Keep the latest value in a ref so the `set`/`remove` callbacks can stay
  // referentially stable instead of being rebuilt on every keystroke.
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    setValue(getValue(key, initialValue))
    // `initialValue` is intentionally excluded: callers commonly pass a fresh
    // object or array literal, and depending on it would re-read on every
    // render. The key is the only thing that should trigger a re-read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = useCallback((next) => {
    const resolved = typeof next === 'function' ? next(valueRef.current) : next
    valueRef.current = resolved
    setValue(resolved)
    setItem(key, resolved)
  }, [key])

  const remove = useCallback(() => {
    const reset = typeof initialValue === 'function' ? initialValue() : initialValue
    valueRef.current = reset
    setValue(reset)
    removeItem(key)
  }, [key, initialValue])

  return [value, set, remove]
}
