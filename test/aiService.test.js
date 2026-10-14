import assert from 'node:assert/strict'
import { describe, it, afterEach } from 'node:test'

import {
  AI_ENDPOINT,
  AiError,
  generateFitnessAdvice,
  normaliseAiResult,
} from '../src/services/aiService.js'

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

function mockFetch(impl) {
  globalThis.fetch = impl
}

describe('normaliseAiResult', () => {
  it('coerces a full object into the render shape', () => {
    const result = normaliseAiResult({
      title: 'Hello',
      summary: 'A summary',
      highlights: ['a', 2, ''],
      focusAreas: ['b'],
      recommendations: ['c'],
      nextStep: 'Do it',
    })
    assert.deepEqual(result, {
      title: 'Hello',
      summary: 'A summary',
      highlights: ['a'],
      focusAreas: ['b'],
      recommendations: ['c'],
      nextStep: 'Do it',
    })
  })

  it('wraps a bare string as the summary', () => {
    const result = normaliseAiResult('Just prose')
    assert.equal(result.summary, 'Just prose')
    assert.deepEqual(result.highlights, [])
  })

  it('always returns every field for junk input', () => {
    const result = normaliseAiResult(null)
    assert.deepEqual(Object.keys(result).sort(), [
      'focusAreas',
      'highlights',
      'nextStep',
      'recommendations',
      'summary',
      'title',
    ])
  })
})

describe('generateFitnessAdvice', () => {
  it('posts to the BeFit endpoint and returns the normalised result', async () => {
    let seenUrl = ''
    let seenBody = null
    mockFetch(async (url, options) => {
      seenUrl = url
      seenBody = JSON.parse(options.body)
      return {
        ok: true,
        status: 200,
        json: async () => ({ result: { title: 'T', summary: 'S', highlights: ['h'] } }),
      }
    })

    const result = await generateFitnessAdvice({ action: 'daily-insight' })
    assert.equal(seenUrl, AI_ENDPOINT)
    assert.equal(seenUrl, '/api/ai/fitness')
    assert.deepEqual(seenBody, { action: 'daily-insight', context: {} })
    assert.equal(result.title, 'T')
    assert.deepEqual(result.highlights, ['h'])
  })

  it('rejects an action that is not in the allow-list', async () => {
    await assert.rejects(() => generateFitnessAdvice({ action: 'nope' }), (error) => {
      assert.ok(error instanceof AiError)
      assert.equal(error.code, 'invalid_action')
      return true
    })
  })

  it('maps a 503 to a not_configured error with the server message', async () => {
    mockFetch(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ error: 'not_configured', message: 'Configure the key.' }),
    }))

    await assert.rejects(() => generateFitnessAdvice({ action: 'daily-insight' }), (error) => {
      assert.equal(error.code, 'not_configured')
      assert.equal(error.message, 'Configure the key.')
      return true
    })
  })

  it('maps a 429 to a rate_limit error', async () => {
    mockFetch(async () => ({ ok: false, status: 429, json: async () => ({}) }))
    await assert.rejects(() => generateFitnessAdvice({ action: 'progress-review' }), (error) => {
      assert.equal(error.code, 'rate_limit')
      return true
    })
  })

  it('maps a network failure to a network error', async () => {
    mockFetch(async () => {
      throw new Error('offline')
    })
    await assert.rejects(() => generateFitnessAdvice({ action: 'daily-insight' }), (error) => {
      assert.equal(error.code, 'network')
      return true
    })
  })

  it('maps an abort to a timeout error', async () => {
    mockFetch(async () => {
      const error = new Error('aborted')
      error.name = 'AbortError'
      throw error
    })
    await assert.rejects(() => generateFitnessAdvice({ action: 'daily-insight' }), (error) => {
      assert.equal(error.code, 'timeout')
      return true
    })
  })
})
