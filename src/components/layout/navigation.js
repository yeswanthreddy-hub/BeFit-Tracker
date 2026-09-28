/**
 * Navigation link sets.
 *
 * The Navbar picks between them based on the local session, so the same
 * component works on the marketing site and inside the app shell.
 */

/** Full app navigation shown inside the signed-in app shell. */
export const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/completed', label: 'Completed' },
  { to: '/diet', label: 'Diet' },
  { to: '/progress', label: 'Progress' },
  { to: '/ai-tracker', label: 'AI Tracker' },
  { to: '/settings', label: 'Settings' },
]

/** Landing-page navigation for a signed-in athlete. */
export const ACCOUNT_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Profile / Settings' },
]

/** Signed-out navigation, shared by the landing page and the app shell. */
export const GUEST_LINKS = [
  { to: '/exercises', label: 'Explore' },
  { to: '/#about', label: 'About', hash: true },
]

export const GUEST_ACTIONS = [
  { to: '/login', label: 'Login', variant: 'secondary' },
  { to: '/register', label: 'Get Started', variant: 'primary' },
]
