/**
 * Resolve hook implementation for `register.mjs`.
 *
 * For relative specifiers that carry no extension, try `<path>.js` and
 * `<path>/index.js` before giving up. Anything else falls through to the
 * default resolver untouched, so dependencies and Node builtins behave
 * exactly as they normally would.
 */

import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const CANDIDATE_SUFFIXES = ['.js', '.jsx', '/index.js', '/index.jsx']

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
    const candidate = new URL(specifier, context.parentURL)

    for (const suffix of CANDIDATE_SUFFIXES) {
      const target = new URL(candidate.href + suffix)
      if (existsSync(fileURLToPath(target))) {
        return { url: target.href, shortCircuit: true, format: 'module' }
      }
    }
  }

  return nextResolve(specifier, context)
}
