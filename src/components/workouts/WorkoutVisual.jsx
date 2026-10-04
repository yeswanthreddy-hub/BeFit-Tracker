import { getWorkoutCategoryOrFallback } from '../../data/workoutCategories'

/**
 * Category artwork for the workout library.
 *
 * BeFit has no workout photography either, so every card and detail panel gets a
 * generated mark instead of a broken image link. Each workout category has its
 * own simple glyph, tinted with the category accent, so a grid of fifteen
 * workouts reads as fifteen different sessions rather than fifteen identical
 * boxes.
 *
 * The mark is decorative by default: the category name is always spelled out in
 * text next to it.
 *
 * @param {object} props
 * @param {string} props.category  category name from the workout record
 * @param {'card'|'detail'} [props.size]
 * @param {boolean} [props.decorative] hide from assistive tech when the
 *   surrounding card already names the category
 */

const GLYPHS = {
  'full-body': (
    <>
      <circle className="workout-visual__part" cx="60" cy="26" r="11" />
      <path className="workout-visual__part" d="M60 40v34M38 54h44M60 74 46 104M60 74l14 30" />
    </>
  ),
  'upper-body': (
    <>
      <path className="workout-visual__stroke" d="M24 78h72" />
      <rect className="workout-visual__part" x="30" y="54" width="12" height="48" rx="5" />
      <rect className="workout-visual__part" x="78" y="54" width="12" height="48" rx="5" />
    </>
  ),
  'lower-body': (
    <>
      <circle className="workout-visual__part" cx="60" cy="24" r="11" />
      <path className="workout-visual__part" d="M60 38v30M60 68l-14 26M60 68l14 26M46 68h28" />
    </>
  ),
  chest: (
    <>
      <circle className="workout-visual__part" cx="60" cy="24" r="11" />
      <path className="workout-visual__part" d="M60 38v32M40 56h40M60 70l-12 24M60 70l12 24" />
    </>
  ),
  back: (
    <>
      <path className="workout-visual__stroke" d="M22 78h76" />
      <path className="workout-visual__part" d="M60 34v58M60 50 38 62M60 50l22 12" />
    </>
  ),
  core: (
    <>
      <path className="workout-visual__part" d="M28 92h64" />
      <path className="workout-visual__part" d="M40 92l34-22 20 6" />
      <circle className="workout-visual__part" cx="86" cy="76" r="9" />
    </>
  ),
  cardio: (
    <>
      <circle className="workout-visual__part" cx="60" cy="78" r="42" />
      <path className="workout-visual__stroke" d="M26 78h18l8-16 10 30 8-20 8 6h16" />
    </>
  ),
  home: (
    <>
      <path className="workout-visual__stroke" d="M30 80 60 44l30 36" />
      <path className="workout-visual__part" d="M42 74v28h36V74" />
    </>
  ),
  strength: (
    <>
      <path className="workout-visual__part" d="M44 78h32" />
      <rect className="workout-visual__part" x="36" y="60" width="14" height="36" rx="6" />
      <rect className="workout-visual__part" x="70" y="60" width="14" height="36" rx="6" />
      <circle className="workout-visual__part" cx="60" cy="78" r="6" />
    </>
  ),
  quick: (
    <>
      <path className="workout-visual__part" d="M66 34 40 84h20l-6 34 30-52H64z" />
      <circle className="workout-visual__stroke" cx="60" cy="76" r="48" />
    </>
  ),
}

function WorkoutVisual({ category, size = 'card', decorative = true, className = '' }) {
  const record = getWorkoutCategoryOrFallback(category)

  const classes = ['workout-visual', `workout-visual--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={classes}
      style={{ '--workout-accent': record.accent }}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <svg
        className="workout-visual__figure"
        viewBox="0 0 120 120"
        focusable="false"
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : `${record.name} workout`}
      >
        {GLYPHS[record.icon] ?? GLYPHS['full-body']}
      </svg>
    </span>
  )
}

export default WorkoutVisual