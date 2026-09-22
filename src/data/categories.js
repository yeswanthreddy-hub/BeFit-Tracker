/**
 * Fitness categories shown on the landing page.
 * `category` matches the exercise catalog value (see src/data/models.js),
 * while `label` is the friendlier display name.
 * `code` is the short monogram used for the category tile.
 */
export const CATEGORIES = [
  { id: 'chest', label: 'Chest', category: 'Chest', code: 'CH', tagline: 'Press-day fundamental for upper-body strength and size.' },
  { id: 'back', label: 'Back', category: 'Back', code: 'BA', tagline: 'Pull strength that improves posture and every upper lift.' },
  { id: 'shoulders', label: 'Shoulders', category: 'Shoulders', code: 'SH', tagline: 'Build pressing power and stand tall under load.' },
  { id: 'arms', label: 'Arms', category: 'Arms', code: 'AR', tagline: 'Biceps and triceps work that finish your upper body.' },
  { id: 'legs', label: 'Legs', category: 'Legs', code: 'LG', tagline: 'Your largest muscle groups — the foundation of strength.' },
  { id: 'core', label: 'Core', category: 'Abs/Core', code: 'CO', tagline: 'A strong midline keeps every movement stable and safe.' },
  { id: 'full-body', label: 'Full Body', category: 'Full Body', code: 'FB', tagline: 'Efficient sessions that train everything in one go.' },
  { id: 'cardio', label: 'Cardio', category: 'Cardio', code: 'CA', tagline: 'Raise your engine and build endurance that lasts.' },
]