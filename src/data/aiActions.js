/**
 * The four things the BeFit AI Coach can do.
 *
 * Kept in one place so the hero, the quick-action grid, the result headings and
 * the request payload all agree on the same ids. The ids mirror the server's
 * allow-list in `api/ai/fitness.js`; the labels are purely presentation.
 */
export const AI_ACTIONS = [
  {
    id: 'daily-insight',
    label: 'Daily Insight',
    cta: "Get Today's Insight",
    title: "Today's Insight",
    description: 'A quick read on how you are doing and what to focus on today.',
    icon: '✦',
  },
  {
    id: 'workout-recommendation',
    label: 'Next Workout',
    cta: 'Recommend My Next Workout',
    title: 'Workout Recommendation',
    description: 'A suggested session built around your goal, history and recovery.',
    icon: '🏋️',
  },
  {
    id: 'nutrition-insight',
    label: 'Nutrition Check',
    cta: 'Analyze My Nutrition',
    title: 'Nutrition Insight',
    description: 'Feedback on your logged meals and how to keep them balanced.',
    icon: '🥗',
  },
  {
    id: 'progress-review',
    label: 'Progress Review',
    cta: 'Review My Progress',
    title: 'Progress Review',
    description: 'Where your consistency, volume and nutrition are heading.',
    icon: '📈',
  },
]

/** The action metadata for an id, or `null` for an unknown id. */
export function getAiAction(id) {
  return AI_ACTIONS.find((action) => action.id === id) ?? null
}
