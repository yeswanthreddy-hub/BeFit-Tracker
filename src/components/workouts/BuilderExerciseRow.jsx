import { useId } from 'react'

import Button from '../ui/Button'
import DifficultyBadge from '../exercises/DifficultyBadge'
import { exerciseSubtitle, getExerciseById } from '../../utils/exercises'
import { workoutVolumeLabel } from '../../utils/workouts'

/**
 * One editable exercise in the builder's plan.
 *
 * The plan stores only an exercise id plus numbers, exactly like a built-in
 * template, so the name, category, muscles and difficulty all come from the
 * exercise catalog and there is never a second copy to keep in sync.
 *
 * Counted work and timed holds share one row: "Timed hold" swaps the reps input
 * for a seconds input, because "3 × 1 reps" of a plank is meaningless.
 *
 * @param {object} props
 * @param {{exerciseId: string, sets: number, reps: number, restSeconds: number, durationSeconds: number}} props.entry
 * @param {number} props.index    0-based position in the plan
 * @param {number} props.total    how many exercises the plan holds
 * @param {(index: number, patch: object) => void} props.onChange
 * @param {(index: number, direction: -1|1) => void} props.onMove
 * @param {(index: number) => void} props.onRemove
 * @param {string[]} [props.problems] validation messages for this row
 */
function BuilderExerciseRow({ entry, index, total, onChange, onMove, onRemove, problems = [] }) {
  const baseId = useId()
  const exercise = getExerciseById(entry.exerciseId)
  const isHold = Number(entry.durationSeconds) > 0

  if (!exercise) return null

  return (
    <li className={problems.length > 0 ? 'builder-row has-error' : 'builder-row'}>
      <div className="builder-row__head">
        <span className="builder-row__position" aria-hidden="true">
          {index + 1}
        </span>
        <div className="builder-row__identity">
          <p className="builder-row__name">{exercise.name}</p>
          <p className="builder-row__meta">
            {exerciseSubtitle(exercise)} &middot;{' '}
            {workoutVolumeLabel(entry)}
          </p>
        </div>
        <DifficultyBadge difficulty={exercise.difficulty} className="builder-row__difficulty" />
      </div>

      <div className="builder-row__fields">
        <NumberField
          id={`${baseId}-sets`}
          label="Sets"
          value={entry.sets}
          min={1}
          max={20}
          onChange={(value) => onChange(index, { sets: value })}
        />
        <NumberField
          id={`${baseId}-volume`}
          label={isHold ? 'Hold (seconds)' : 'Reps'}
          value={isHold ? entry.durationSeconds : entry.reps}
          min={isHold ? 5 : 1}
          max={isHold ? 600 : 200}
          step={isHold ? 5 : 1}
          onChange={(value) =>
            onChange(index, { [isHold ? 'durationSeconds' : 'reps']: value })
          }
        />
        <NumberField
          id={`${baseId}-rest`}
          label="Rest (seconds)"
          value={entry.restSeconds}
          min={0}
          max={600}
          step={5}
          onChange={(value) => onChange(index, { restSeconds: value })}
        />

        <div className="builder-row__field builder-row__field--check">
          <input
            id={`${baseId}-hold`}
            type="checkbox"
            checked={isHold}
            onChange={(event) =>
              onChange(index, {
                durationSeconds: event.target.checked ? 30 : 0,
                reps: event.target.checked ? 0 : 10,
              })
            }
          />
          <label className="builder-row__label" htmlFor={`${baseId}-hold`}>
            Timed hold
          </label>
        </div>
      </div>

      <div className="builder-row__actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          aria-label={`Move ${exercise.name} earlier in the plan`}
        >
          Move up
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
          aria-label={`Move ${exercise.name} later in the plan`}
        >
          Move down
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${exercise.name} from this workout`}
        >
          Remove
        </Button>
      </div>

      {problems.length > 0 && (
        <ul className="builder-row__problems">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
    </li>
  )
}

/** One labelled number input. Values stay as typed so an empty box stays empty. */
function NumberField({ id, label, value, min, max, step = 1, onChange }) {
  return (
    <div className="builder-row__field">
      <label className="builder-row__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="field builder-row__input"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export default BuilderExerciseRow