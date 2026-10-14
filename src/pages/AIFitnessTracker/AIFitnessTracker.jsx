import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import PageContainer from '../../components/ui/PageContainer'
import EmptyState from '../../components/ui/EmptyState'
import AiHero from '../../components/ai/AiHero'
import AiStatusCard from '../../components/ai/AiStatusCard'
import AiQuickActions from '../../components/ai/AiQuickActions'
import AiInsight from '../../components/ai/AiInsight'
import AiLoading from '../../components/ai/AiLoading'
import AiError from '../../components/ai/AiError'

import { useAuth } from '../../hooks/useAuth'
import { useUserStorage } from '../../hooks/useUserStorage'
import { useCustomWorkouts } from '../../hooks/useCustomWorkouts'
import { AiError as AiServiceError, generateFitnessAdvice } from '../../services/aiService'
import { getAiAction } from '../../data/aiActions'
import { STORAGE_KEYS } from '../../utils/storageKeys'
import { getDisplayName } from '../../utils/user'
import { EXERCISES } from '../../data/exercises'
import { WORKOUTS } from '../../data/workouts'
import { buildAiContext, buildStatusSnapshot } from '../../utils/aiSummary'

import './AIFitnessTracker.css'

/** Abort a request that has not answered in time. */
const REQUEST_TIMEOUT_MS = 30000

/**
 * AI Fitness Tracker.
 *
 * The signed-in athlete's personal AI coach. Four actions — daily insight,
 * workout recommendation, nutrition insight and progress review — each send a
 * small, sanitized summary to BeFit's own AI endpoint and render the returned
 * structured insight.
 *
 * The browser never holds the Groq key: everything goes through
 * `services/aiService`, which only knows the local `/api/ai/fitness` route.
 *
 * Request handling is deliberately simple: one request at a time, the controls
 * disabled while it runs, a timeout so a hung request cannot wedge the page,
 * and the latest result kept in state.
 */
function AIFitnessTracker() {
  const { user, profile } = useAuth()

  const [completed] = useUserStorage(STORAGE_KEYS.completedWorkouts, [])
  const [foodLog] = useUserStorage(STORAGE_KEYS.foodLog, [])
  const [nutritionProfile] = useUserStorage(STORAGE_KEYS.nutritionProfile, {})
  const { workouts: customWorkouts } = useCustomWorkouts()

  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [activeAction, setActiveAction] = useState(null)
  const [result, setResult] = useState(null)
  const [resultAction, setResultAction] = useState(null)
  const [error, setError] = useState(null)

  const controllerRef = useRef(null)
  const timeoutRef = useRef(null)
  const requestIdRef = useRef(0)

  // One "now" per mount so the snapshot and payload agree on today.
  const now = useMemo(() => new Date(), [])
  const allWorkouts = useMemo(() => [...customWorkouts, ...WORKOUTS], [customWorkouts])

  // The safe, minimal summary that leaves the browser — rebuilt only when the
  // underlying data changes.
  const context = useMemo(
    () =>
      buildAiContext({
        name: getDisplayName(user),
        profile,
        completed,
        foodLog,
        nutritionProfile,
        workouts: allWorkouts,
        exercises: EXERCISES,
        now,
      }),
    [user, profile, completed, foodLog, nutritionProfile, allWorkouts, now],
  )

  const snapshot = useMemo(
    () => buildStatusSnapshot({ completed, foodLog, nutritionProfile, now }),
    [completed, foodLog, nutritionProfile, now],
  )

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Cancel any in-flight request when the page unmounts, and ignore its result.
  useEffect(
    () => () => {
      requestIdRef.current += 1
      controllerRef.current?.abort()
      clearTimeoutRef()
    },
    [clearTimeoutRef],
  )

  const runAction = useCallback(
    async (actionId) => {
      if (!actionId || status === 'loading') return

      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId

      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      clearTimeoutRef()
      timeoutRef.current = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      setActiveAction(actionId)
      setStatus('loading')
      setError(null)

      try {
        const next = await generateFitnessAdvice({ action: actionId, context, signal: controller.signal })
        if (requestId !== requestIdRef.current) return
        setResult(next)
        setResultAction(actionId)
        setStatus('success')
      } catch (caught) {
        if (requestId !== requestIdRef.current) return
        const aiError = caught instanceof AiServiceError ? caught : new AiServiceError('server')
        setError({ code: aiError.code, message: aiError.message })
        setStatus('error')
      } finally {
        if (requestId === requestIdRef.current) clearTimeoutRef()
      }
    },
    [status, context, clearTimeoutRef],
  )

  const isLoading = status === 'loading'
  const shownAction = getAiAction(isLoading ? activeAction : resultAction ?? activeAction)

  return (
    <PageContainer className="ai-tracker">
      <AiHero onStart={runAction} isLoading={isLoading} />

      <AiStatusCard user={user} profile={profile} snapshot={snapshot} />

      <section className="ai-tracker__section" aria-labelledby="ai-actions-heading">
        <h2 className="ai-tracker__heading" id="ai-actions-heading">
          Quick AI Actions
        </h2>
        <AiQuickActions onAction={runAction} disabled={isLoading} activeAction={activeAction} />
      </section>

      <section
        className="ai-tracker__section"
        aria-labelledby="ai-result-heading"
        aria-live="polite"
        aria-busy={isLoading}
      >
        <h2 className="ai-tracker__heading" id="ai-result-heading">
          {shownAction ? shownAction.title : 'AI Insight'}
        </h2>

        {status === 'idle' && (
          <EmptyState
            title="Your coach is standing by."
            note="Choose a quick action above and your AI coach will turn your own BeFit data into a clear, personal insight."
          />
        )}

        {isLoading && <AiLoading />}

        {status === 'error' && (
          <AiError error={error} onRetry={activeAction ? () => runAction(activeAction) : undefined} />
        )}

        {status === 'success' && result && <AiInsight action={shownAction} result={result} />}
      </section>
    </PageContainer>
  )
}

export default AIFitnessTracker
