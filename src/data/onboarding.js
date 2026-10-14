/**
 * Onboarding options shown right after a local account is created.
 *
 * The lists are intentionally short — the goal is to establish a starting
 * profile, not to interrogate the user.
 */

export const FITNESS_GOAL_OPTIONS = [
  { value: 'Build Muscle', label: 'Build Muscle', description: 'Add size and strength' },
  { value: 'Lose Weight', label: 'Lose Weight', description: 'Steady fat loss' },
  { value: 'Improve Strength', label: 'Improve Strength', description: 'Heavier, cleaner lifts' },
  { value: 'Improve Endurance', label: 'Improve Endurance', description: 'Longer, easier sessions' },
  { value: 'General Fitness', label: 'General Fitness', description: 'Stay active and consistent' },
]

export const EXPERIENCE_OPTIONS = [
  { value: 'Beginner', label: 'Beginner', description: 'New to structured training' },
  { value: 'Intermediate', label: 'Intermediate', description: 'Training regularly already' },
  { value: 'Advanced', label: 'Advanced', description: 'Years of serious training' },
]

export const DURATION_OPTIONS = [15, 30, 45, 60]

/**
 * A short, non-medical line shown when a goal is selected in Settings.
 * Kept general on purpose — BeFit gives training guidance, not medical advice.
 */
export const GOAL_DETAILS = {
  'Build Muscle':
    'Focus your training around progressive strength and muscle development.',
  'Lose Weight':
    'Keep sessions moving with steady conditioning and consistent activity.',
  'Improve Strength':
    'Prioritise the main lifts and add load gradually over time.',
  'Improve Endurance':
    'Build your aerobic base with longer, lower-intensity work.',
  'General Fitness':
    'Stay active and consistent with balanced, well-rounded sessions.',
}

/** Description for a goal, with a safe fallback for unknown values. */
export function getGoalDetail(goal) {
  return GOAL_DETAILS[goal] ?? 'Choose the goal that matters most right now.'
}

export const ONBOARDING_MESSAGES = {
  goalRequired: 'Choose the goal that matters most right now.',
  experienceRequired: 'Choose your current experience level.',
}

/** True once the profile holds the values needed for personalised content. */
export function isProfileComplete(profile) {
  return Boolean(
    profile &&
      profile.fitnessGoal &&
      profile.experienceLevel &&
      Number(profile.preferredWorkoutDuration) > 0,
  )
}
