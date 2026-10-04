/**
 * Where each Explore tile leads. Every entry points at a real route so there
 * are no dead buttons; routes still marked "coming soon" land on their
 * placeholder page.
 */
export const EXPLORE_DESTINATIONS = [
  {
    to: '/exercises',
    title: 'Exercises',
    text: 'Browse the movement library by muscle group.',
  },
  {
    to: '/workouts',
    title: 'Workouts',
    text: 'Pick a plan and start a session.',
  },
  {
    to: '/diet',
    title: 'Diet',
    text: 'Log meals and keep fuel in step with training.',
  },
  {
    to: '/progress',
    title: 'Progress',
    text: 'Follow your weight and training trends over time.',
  },
  {
    to: '/ai-tracker',
    title: 'AI Fitness',
    text: 'Your smart fitness tracker — on the way.',
  },
  {
    to: '/settings',
    title: 'Settings',
    text: 'Update your profile, goal and preferences.',
  },
]