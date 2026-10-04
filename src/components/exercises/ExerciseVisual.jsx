import { getExerciseCategoryOrFallback } from '../../data/exerciseCategories'

/**
 * Category artwork for the exercise library.
 *
 * BeFit has no exercise photography yet, so every card and detail panel gets a
 * generated figure instead of a broken image link: a simple body silhouette
 * with the category's muscles highlighted in that category's accent colour.
 * It is deterministic, weighs nothing, scales to any size and always looks
 * intentional.
 *
 * Region shapes are keyed by the `icon` field of `src/data/exerciseCategories.js`,
 * and every key is unique across groups so the combined full-body figure
 * reconciles without React complaining about duplicates.
 */

const FIGURE = (
  <>
    <circle className="exercise-visual__part" cx="60" cy="20" r="12" />
    <rect className="exercise-visual__part" x="44" y="34" width="32" height="48" rx="15" />
    <rect className="exercise-visual__part" x="46" y="78" width="28" height="18" rx="8" />
    <rect className="exercise-visual__part" x="27" y="38" width="12" height="48" rx="6" />
    <rect className="exercise-visual__part" x="81" y="38" width="12" height="48" rx="6" />
    <rect className="exercise-visual__part" x="47" y="92" width="12" height="44" rx="6" />
    <rect className="exercise-visual__part" x="61" y="92" width="12" height="44" rx="6" />
  </>
)

const CHEST = [
  <ellipse key="chest-l" cx="52" cy="50" rx="8" ry="7" />,
  <ellipse key="chest-r" cx="68" cy="50" rx="8" ry="7" />,
]

const BACK = [
  <rect key="back-spine" x="57" y="36" width="6" height="50" rx="3" />,
  <ellipse key="back-l" cx="51" cy="42" rx="7" ry="5" />,
  <ellipse key="back-r" cx="69" cy="42" rx="7" ry="5" />,
]

const SHOULDERS = [
  <circle key="shoulders-l" cx="38" cy="42" r="9" />,
  <circle key="shoulders-r" cx="82" cy="42" r="9" />,
]

const ARMS = [
  <rect key="arms-l" x="27" y="44" width="12" height="38" rx="6" />,
  <rect key="arms-r" x="81" y="44" width="12" height="38" rx="6" />,
]

const LEGS = [
  <rect key="legs-l" x="47" y="96" width="12" height="36" rx="6" />,
  <rect key="legs-r" x="61" y="96" width="12" height="36" rx="6" />,
]

const CORE = [
  <rect key="core-abs" x="51" y="56" width="18" height="26" rx="9" />,
]

const FULL_BODY = [...CHEST, ...SHOULDERS, ...ARMS, ...CORE, ...LEGS]

const CARDIO = [
  <path
    key="cardio-pulse"
    className="exercise-visual__stroke"
    d="M14 78h14l6-13 8 26 7-19 6 6h41"
  />,
  <circle key="cardio-inner" className="exercise-visual__stroke" cx="60" cy="76" r="58" />,
  <circle key="cardio-outer" className="exercise-visual__stroke" cx="60" cy="76" r="68" />
]

const REGIONS = {
  chest: CHEST,
  back: BACK,
  shoulders: SHOULDERS,
  arms: ARMS,
  legs: LEGS,
  core: CORE,
  'full-body': FULL_BODY,
  cardio: CARDIO,
}

/**
 * @param {object} props
 * @param {string} props.category  category name from the exercise record
 * @param {'card'|'detail'} [props.size]
 * @param {boolean} [props.decorative] hide from assistive tech when the
 *   surrounding card already names the category
 */
function ExerciseVisual({ category, size = 'card', decorative = true, className = '' }) {
  const record = getExerciseCategoryOrFallback(category)
  const regions = REGIONS[record.icon] ?? FULL_BODY

  const classes = ['exercise-visual', `exercise-visual--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={classes}
      style={{ '--exercise-accent': record.accent }}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <svg
        className="exercise-visual__figure"
        viewBox="0 0 120 150"
        focusable="false"
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : `${record.name} muscle group`}
      >
        <g className="exercise-visual__body">{FIGURE}</g>
        <g className="exercise-visual__regions">{regions}</g>
      </svg>
      {!decorative && <span className="visually-hidden">{record.name} muscle group</span>}
    </span>
  )
}

export default ExerciseVisual