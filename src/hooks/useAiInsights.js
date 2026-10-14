import { useCallback, useMemo } from 'react'

import { useAuth } from './useAuth'
import { useUserStorage } from './useUserStorage'
import { STORAGE_KEYS } from '../utils/storageKeys'
import { addAiInsight, createAiInsight, latestAiInsight, parseAiInsights } from '../utils/aiHistory'

/**
 * The signed-in athlete's AI insight history.
 *
 * Backed by the user-scoped `befit_ai_insights` key, so switching accounts
 * swaps the history along with every other piece of training data. Exposes the
 * newest entry (for the dashboard), the full list (for the AI page) and the two
 * writes the UI needs: append a fresh result, or clear the lot.
 */
export function useAiInsights() {
  const { user } = useAuth()
  const [stored, setStored] = useUserStorage(STORAGE_KEYS.aiInsights, [])

  const insights = useMemo(() => parseAiInsights(stored), [stored])
  const latest = useMemo(() => latestAiInsight(insights), [insights])

  const addInsight = useCallback(
    (action, result) => {
      setStored((current) =>
        addAiInsight(parseAiInsights(current), createAiInsight({ action, result, userId: user?.id })),
      )
    },
    [setStored, user?.id],
  )

  const clearInsights = useCallback(() => setStored([]), [setStored])

  return { insights, latest, addInsight, clearInsights }
}
