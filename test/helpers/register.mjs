/**
 * ESM resolve hook that adds the missing file extension.
 *
 * BeFit's application source imports its own modules without an extension
 * (`from './storageKeys'`), which Vite resolves happily but native Node ESM
 * does not. Rather than rewrite every import in the app — a large, unrelated
 * diff — the test runner maps the bare specifier to the real file here.
 *
 * Loaded via `--import ./test/helpers/register.mjs` in the `test` script.
 */

import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('./extension-resolver.mjs', import.meta.url)

export const sourceRoot = pathToFileURL(new URL('../../src/', import.meta.url).pathname).href
