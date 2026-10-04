import Button from '../ui/Button'
import { useWorkoutSelection } from '../../hooks/useWorkoutSelection'

/**
 * Add / remove toggle for an exercise.
 *
 * `aria-pressed` carries the on/off state, so the button reads as a toggle to
 * assistive tech instead of a link whose label happens to change.
 *
 * @param {{exercise: import('../../data/exercises.js').Exercise}} props
 */
function AddToWorkoutButton({ exercise, size = 'medium', className = '' }) {
  const { isSelected, toggle } = useWorkoutSelection()
  const selected = isSelected(exercise.id)

  return (
    <Button
      variant={selected ? 'secondary' : 'primary'}
      size={size}
      className={className}
      aria-pressed={selected}
      onClick={() => toggle(exercise)}
    >
      {selected ? (
        <>
          <span aria-hidden="true">✓</span> Added to workout
        </>
      ) : (
        <>
          <span aria-hidden="true">+</span> Add to workout
        </>
      )}
    </Button>
  )
}

export default AddToWorkoutButton