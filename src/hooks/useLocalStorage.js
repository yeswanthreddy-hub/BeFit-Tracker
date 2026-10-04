import { useState, useCallback, useEffect, useRef } from 'react'
import { getValue, setItem, removeItem } from '../utils/storage'

/**
 * Same-document listeners, one set per key.
 *
 * The browser's `storage` event only reaches *other* tabs, so two components
 * reading the same key inside one page would each keep their own copy and go
 * stale as soon as one of them wrote. Announcing writes here keeps every
 * mounted reader of that key in step.
 */
const listeners = new Map()

function subscribe(key, listener) {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key).add(listener)

  return () => {
    const forKey = listeners.get(key)
    if (!forKey) return
    forKey.delete(listener)
    if (forKey.size === 0) listeners.delete(key)
  }
}

function announce(key) {
  listeners.get(key)?.forEach((listener) => listener())
}

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

  // Refs mirror the latest value so the `set`/`remove` callbacks can stay
  // referentially stable instead of being rebuilt on every keystroke. They are
  // updated after render rather than during it, and `set` also writes them
  // directly so two updates in the same tick still build on each other.
  const valueRef = useRef(value)
  const initialRef = useRef(initialValue)

  useEffect(() => {
    valueRef.current = value
    initialRef.current = initialValue
  })

  useEffect(() => {
    setValue(getValue(key, initialRef.current))

    return subscribe(key, () => setValue(getValue(key, initialRef.current)))
  }, [key])

  const set = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(valueRef.current) : next
      valueRef.current = resolved
      setValue(resolved)
      setItem(key, resolved)
      announce(key)
    },
    [key],
  )

  const remove = useCallback(() => {
    const reset = typeof initialRef.current === 'function' ? initialRef.current() : initialRef.current
    valueRef.current = reset
    setValue(reset)
    removeItem(key)
    announce(key)
  }, [key])

  return [value, set, remove]
}
