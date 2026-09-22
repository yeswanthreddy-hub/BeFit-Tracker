import { getItem, setItem } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/storageKeys'
import {
  sampleCompletedWorkouts,
  sampleFoodLog,
  sampleProfile,
  sampleProgress,
  sampleSettings,
  sampleStreak,
  sampleWorkouts,
} from './sampleData'

/**
 * Write the sample dataset into localStorage the first time the app
 * runs. Existing keys are never overwritten.
 *
 * The exercise catalog stays in code (src/data/sampleData.js) because it
 * ships with the app; user-owned data — workouts, results, food, progress —
 * is what lives in localStorage.
 */
export function seedBeFitData() {
  const seeds = [
    { key: STORAGE_KEYS.profile, value: sampleProfile },
    { key: STORAGE_KEYS.settings, value: sampleSettings },
    { key: STORAGE_KEYS.streak, value: sampleStreak },
    { key: STORAGE_KEYS.workouts, value: sampleWorkouts },
    { key: STORAGE_KEYS.completedWorkouts, value: sampleCompletedWorkouts },
    { key: STORAGE_KEYS.foodLog, value: sampleFoodLog },
    { key: STORAGE_KEYS.progress, value: sampleProgress },
  ]

  seeds.forEach(({ key, value }) => {
    if (getItem(key) === null) setItem(key, value)
  })
}