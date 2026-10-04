import { EXERCISE_DIFFICULTIES } from '../../data/exercises'

/**
 * Difficulty indicator.
 *
 * Difficulty is never signalled by colour alone: three bars show the level at
 * a glance and the word itself is always spelled out, so the meaning survives
 * greyscale, colour-blindness and screen readers.
 */

const LEVELS = EXERCISE_DIFFICULTIES.length

function levelOf(difficulty) {
  const index = EXERCISE_DIFFICULTIES.indexOf(difficulty)
  return index === -1 ? 1 : index + 1
}

function DifficultyBadge({ difficulty, className = '' }) {
  const level = levelOf(difficulty)

  const classes = ['difficulty', className].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      <span className="difficulty__bars" aria-hidden="true">
        {Array.from({ length: LEVELS }, (_, index) => (
          <span
            key={index}
            className={index < level ? 'difficulty__bar is-filled' : 'difficulty__bar'}
          />
        ))}
      </span>
      <span className="difficulty__label">{difficulty}</span>
    </span>
  )
}

export default DifficultyBadge