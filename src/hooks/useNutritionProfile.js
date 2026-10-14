import { useCallback, useMemo } from 'react'

import { useUserStorage } from './useUserStorage'
import { STORAGE_KEYS } from '../utils/storageKeys'
import { normalizeNutritionProfile } from '../utils/nutrition'

/**
 * The athlete's daily nutrition targets.
 *
 * Stored under `befit_nutrition_profile` (scoped per account by
 * `useUserStorage`) as `{ dailyCalorieTarget, dailyProteinTarget, updatedAt }`.
 * Targets are optional and set by hand: an unset target is 0, which the diet
 * page reads as "no target yet" rather than "0 kcal allowed".
 *
 * These are the athlete's own numbers, not a prescription. Where a suggested
 * value is offered elsewhere it is clearly labelled as a general estimate.
 */
export function useNutritionProfile() {
  const [stored, setStored] = useUserStorage(STORAGE_KEYS.nutritionProfile, null)

  const profile = useMemo(() => normalizeNutritionProfile(stored), [stored])

  const hasTargets = profile.dailyCalorieTarget > 0 || profile.dailyProteinTarget > 0

  /** Save the daily targets. */
  const save = useCallback(
    (updates = {}) => {
      const next = normalizeNutritionProfile({
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      setStored(next)
      return next
    },
    [profile, setStored],
  )

  return { profile, hasTargets, save }
}

export default useNutritionProfile
