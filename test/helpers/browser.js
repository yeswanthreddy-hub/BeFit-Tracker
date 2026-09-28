/**
 * In-memory localStorage stub for the Node test runner.
 *
 * BeFit's storage utilities read `window.localStorage` lazily, so exposing a
 * fake window before the first call is enough to exercise the real code paths
 * without a browser or jsdom.
 */

class MemoryStorage {
  constructor() {
    this.map = new Map()
  }

  get length() {
    return this.map.size
  }

  key(index) {
    return [...this.map.keys()][index] ?? null
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null
  }

  setItem(key, value) {
    this.map.set(key, String(value))
  }

  removeItem(key) {
    this.map.delete(key)
  }

  clear() {
    this.map.clear()
  }
}

/**
 * Install a fresh fake window.
 *
 * @param {Record<string, string>} [seed] raw string values keyed as stored
 * @returns {MemoryStorage} the storage backing the new window
 */
export function installBrowser(seed = {}) {
  const storage = new MemoryStorage()
  for (const [key, value] of Object.entries(seed)) {
    storage.setItem(key, value)
  }
  globalThis.window = { localStorage: storage }
  return storage
}

/** Remove the fake window so modules fall back to their no-storage path. */
export function uninstallBrowser() {
  delete globalThis.window
}
