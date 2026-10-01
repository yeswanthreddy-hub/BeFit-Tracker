/**
 * Quick workout templates.
 *
 * These are *templates* offered as immediate actions — they are not completed
 * workouts and nothing here is ever written to `befit_completed_workouts`.
 * Starting one simply routes into the workout experience.
 *
 * Lives in code (rather than JSX) so the same list can be reused elsewhere and
 * so adding a template never means editing a component.
 */
export const QUICK_WORKOUTS = [
  {
    id: 'qw-10-full-body',
    name: '10 Min Full Body',
    durationMinutes: 10,
    difficulty: 'Beginner',
    target: 'Full Body',
    description: 'Squats, push-ups, hinges and a plank. No rest, no equipment.',
    focus: ['Full Body'],
  },
  {
    id: 'qw-15-core',
    name: '15 Min Core',
    durationMinutes: 15,
    difficulty: 'Beginner',
    target: 'Core',
    description: 'Dead bugs, planks and side work to build trunk stability.',
    focus: ['Abs/Core'],
  },
  {
    id: 'qw-20-upper',
    name: '20 Min Upper Body',
    durationMinutes: 20,
    difficulty: 'Intermediate',
    target: 'Chest, Back, Shoulders',
    description: 'Push and pull supersets covering the whole upper body.',
    focus: ['Chest', 'Back', 'Shoulders'],
  },
  {
    id: 'qw-20-lower',
    name: '20 Min Lower Body',
    durationMinutes: 20,
    difficulty: 'Intermediate',
    target: 'Legs, Glutes',
    description: 'Squat, hinge and lunge patterns with steady tempo.',
    focus: ['Legs'],
  },
]

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