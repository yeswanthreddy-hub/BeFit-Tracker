import { useMemo } from 'react'

import { useCustomWorkouts } from './useCustomWorkouts'
import { getWorkoutById } from '../utils/workouts'

/**
 * One workout, wherever it lives.
 *
 * A route id can name a built-in template from `src/data/workouts.js` or a
 * workout the athlete saved in the builder. Both detail and preparation ask
 * this hook instead of looking in one place, so a custom workout is as
 * reachable as a template and an unknown id still returns `null` for the
 * not-found state.
 *
 * A signed-out visitor simply has no saved workouts, so the built-in templates
 * keep working on the public routes.
 *
 * @param {string} workoutId
 * @returns {object|null}
 */
export function useWorkout(workoutId) {
  const { find } = useCustomWorkouts()

  return useMemo(() => getWorkoutById(workoutId) ?? find(workoutId), [workoutId, find])
}

export default useWorkout