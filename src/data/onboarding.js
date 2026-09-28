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
