import { PREFIX } from './storageKeys'

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

/** Read a key and safely parse its JSON. Returns null when missing or corrupt. */
export function getItem(key) {
  if (!hasStorage()) return null

  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null || raw === '') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Write a value as JSON. Returns true on success. */
export function setItem(key, value) {
  if (!hasStorage()) return false

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/** Remove a single key. Returns true when removed or already absent. */
export function removeItem(key) {
  if (!hasStorage()) return false

  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * Read a key, falling back to `fallback` when the key is missing,
 * corrupt, or cannot be parsed.
 */
export function getValue(key, fallback = null) {
  const value = getItem(key)
  return value === null ? fallback : value
}

/** Check whether a key currently holds a value. */
export function hasItem(key) {
  return getItem(key) !== null
}

/**
 * Remove every BeFit-owned key. Only keys starting with the BeFit
 * prefix are touched, so unrelated app data is preserved.
 */
export function clearBeFitData() {
  if (!hasStorage()) return false

  try {
    const keys = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(PREFIX)) keys.push(key)
    }
    keys.forEach((key) => window.localStorage.removeItem(key))
    return true
  } catch {
    return false
  }
}

/** Convenience object with the most common operations. */
export const storage = {
  get: getItem,
  getValue,
  set: setItem,
  remove: removeItem,
  has: hasItem,
}