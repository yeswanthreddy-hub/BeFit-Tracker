import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import SectionHeader from '../../components/ui/SectionHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import TextAreaField from '../../components/ui/TextAreaField'
import TextField from '../../components/auth/TextField'
import FormAlert from '../../components/auth/FormAlert'
import ExercisePicker from '../../components/workouts/ExercisePicker'
import BuilderExerciseRow from '../../components/workouts/BuilderExerciseRow'
import { useCustomWorkouts } from '../../hooks/useCustomWorkouts'
import { useWorkoutSelection } from '../../hooks/useWorkoutSelection'
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  createWorkoutDraft,
  createWorkoutEntry,
  normalizeWorkoutExercises,
  validateWorkoutDraft,
} from '../../utils/customWorkouts'
import { deriveWorkoutPlan } from '../../utils/workouts'
import {
  WORKOUT_CATEGORY_NAMES,
  WORKOUT_DIFFICULTIES,
  WORKOUT_GOALS,
} from '../../data/workoutCategories'
import './WorkoutBuilder.css'

/**
 * Create or edit a workout plan.
 *
 * One component serves `/workouts/create` and `/workouts/edit/:workoutId`:
 * both edit the same form, and only the initial values differ.
 *
 * Three deliberate choices keep the saved record honest:
 *
 * 1. Duration, equipment and target muscles are *derived* from the exercises in
 *    the plan (`deriveWorkoutPlan`) and shown read-only, so a workout can never
 *    claim to be a 20 minute dumbbell plan while holding three bodyweights.
 * 2. The temporary exercise selection from Prompt 5 is imported once when the
 *    form opens empty, so the "add to workout" buttons on the exercise pages
 *    lead somewhere useful, and the selection is consumed on save.
 * 3. Saving writes a plan only. Nothing here marks a workout complete or counts
 *    anything, because no session runner exists yet.
 *
 * Saving requires an account, so the route is wrapped in `ProtectedRoute` and
 * the workouts land in this account's `befit_u_<id>_workouts`.
 */
function WorkoutBuilder() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const isEditing = typeof workoutId === 'string' && workoutId !== ''

  const { find, create, update } = useCustomWorkouts()
  const { selectedExercises, clear: clearSelection } = useWorkoutSelection()

  const existing = useMemo(
    () => (isEditing ? find(workoutId) : null),
    [isEditing, find, workoutId],
  )

  // Create and edit both start from a known draft: a blank plan, or the saved
  // workout being edited. The temporary exercise selection is imported once,
  // here, so the "Add to workout" buttons on the exercise pages land here with
  // their work already done.
  const [initial] = useState(() => {
    const starting =
      isEditing && existing ? { ...createWorkoutDraft(), ...existing } : createWorkoutDraft()

    return importSelection(starting, selectedExercises, !isEditing)
  })
  const [draft, setDraft] = useState(initial.draft)
  const [errors, setErrors] = useState({})

  const derived = useMemo(() => deriveWorkoutPlan(draft.exercises), [draft.exercises])
  const selectedIds = useMemo(
    () => draft.exercises.map((entry) => entry.exerciseId),
    [draft.exercises],
  )
  const problemCount = Object.keys(errors).length

  const updateField = (name, value) =>
    setDraft((current) => ({ ...current, [name]: value }))

  const changeEntry = (index, patch) =>
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((entry, position) =>
        position === index ? { ...entry, ...patch } : entry,
      ),
    }))

  const moveEntry = (index, direction) =>
    setDraft((current) => {
      const next = [...current.exercises]
      const target = index + direction
      if (target < 0 || target >= next.length) return current

      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return { ...current, exercises: next }
    })

  const addExercise = (exercise) =>
    setDraft((current) =>
      current.exercises.some((entry) => entry.exerciseId === exercise.id)
        ? current
        : { ...current, exercises: [...current.exercises, createWorkoutEntry(exercise.id)] },
    )

  const removeEntry = (index) =>
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.filter((_, position) => position !== index),
    }))

  const handleSubmit = (event) => {
    event.preventDefault()

    const found = validateWorkoutDraft(draft)
    setErrors(found)

    if (Object.keys(found).length > 0) return

    // Duration, equipment and muscles are calculated, never typed, so they
    // cannot drift away from the exercises in the plan.
    const payload = {
      ...draft,
      durationMinutes: derived.durationMinutes > 0 ? derived.durationMinutes : draft.durationMinutes,
      equipment: derived.equipment,
      targetMuscles: derived.targetMuscles,
    }

    const saved = isEditing ? update(workoutId, payload) : create(payload)
    if (!saved) return

    if (initial.seeded) clearSelection()

    navigate('/workouts')
  }

  if (isEditing && !existing) {
    return (
      <div className="page workout-builder">
        <SectionHeader
          eyebrow="Workout builder"
          title="Workout not found"
          titleAs="h1"
          sub="That saved workout is not stored on this device any more."
        />
        <EmptyState
          title="Nothing to edit"
          note="Saved workouts live in this browser only. If you cleared site data, the plan is gone."
          action={
            <Button to="/workouts" variant="secondary">
              Back to the library
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="page workout-builder">
      <SectionHeader
        eyebrow="Workout builder"
        title={isEditing ? 'Edit your workout' : 'Build your workout'}
        titleAs="h1"
        sub="Pick the exercises first, then set the numbers. Duration, equipment and muscles are worked out for you."
        action={
          <Button to="/workouts" variant="ghost" size="sm">
            Back to library
          </Button>
        }
      />

      {problemCount > 0 && (
        <FormAlert tone="error" title="This workout is not ready to save yet">
          <ul className="workout-builder__problems">
            {Object.entries(errors).map(([key, value]) => (
              <li key={key}>
                {Array.isArray(value) ? value.flat().join(' ') : value}
              </li>
            ))}
          </ul>
        </FormAlert>
      )}

      <form className="workout-builder__form" onSubmit={handleSubmit} noValidate>
        <section className="workout-builder__details card" aria-labelledby="builder-details-heading">
          <h2 className="workout-builder__heading" id="builder-details-heading">
            Workout details
          </h2>

          <TextField
            id="builder-name"
            name="name"
            label="Workout name"
            value={draft.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Saturday Upper Body"
            maxLength={MAX_NAME_LENGTH}
            error={errors.name ?? ''}
            hint={`${draft.name.length}/${MAX_NAME_LENGTH} characters`}
            autoComplete="off"
            required
          />

          <TextAreaField
            id="builder-description"
            name="description"
            label="What is this session for?"
            value={draft.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="One or two lines: pushing volume, then a heavy carry."
            maxLength={MAX_DESCRIPTION_LENGTH}
            error={errors.description ?? ''}
            hint="Optional, but a reason makes a plan easier to stick to."
          />

          <div className="workout-builder__selects">
            <SelectField
              id="builder-category"
              label="Category"
              value={draft.category}
              options={WORKOUT_CATEGORY_NAMES}
              onChange={(value) => updateField('category', value)}
            />
            <SelectField
              id="builder-goal"
              label="Goal"
              value={draft.goal}
              options={WORKOUT_GOALS}
              onChange={(value) => updateField('goal', value)}
            />
            <SelectField
              id="builder-difficulty"
              label="Difficulty"
              value={draft.difficulty}
              options={WORKOUT_DIFFICULTIES}
              onChange={(value) => updateField('difficulty', value)}
            />
          </div>

          <dl className="workout-builder__derived">
            <div className="workout-builder__derived-row">
              <dt>Estimated duration</dt>
              <dd>
                {derived.durationMinutes > 0 ? `${derived.durationMinutes} min` : 'Add exercises'}
              </dd>
            </div>
            <div className="workout-builder__derived-row">
              <dt>Equipment needed</dt>
              <dd>{derived.equipment}</dd>
            </div>
            <div className="workout-builder__derived-row">
              <dt>Target muscles</dt>
              <dd>
                {derived.targetMuscles.length > 0 ? (
                  <ul className="chip-group">
                    {derived.targetMuscles.map((muscle) => (
                      <li key={muscle} className="chip">
                        {muscle}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'Add exercises'
                )}
              </dd>
            </div>
          </dl>
          <p className="workout-builder__derived-note">
            These three come from the exercises you choose, so a saved workout always matches its
            plan.
          </p>
        </section>

        <div className="workout-builder__plan">
          <ExercisePicker selectedIds={selectedIds} onAdd={addExercise} />

          <section className="workout-builder__plan-list" aria-labelledby="builder-plan-heading">
            <div className="workout-builder__plan-head">
              <h2 className="workout-builder__heading" id="builder-plan-heading">
                Your plan
              </h2>
              <p className="workout-builder__plan-count" role="status">
                {draft.exercises.length}{' '}
                {draft.exercises.length === 1 ? 'exercise' : 'exercises'}
                {derived.durationMinutes > 0 && ` · about ${derived.durationMinutes} min`}
              </p>
            </div>

            {draft.exercises.length > 0 ? (
              <ul className="builder-list">
                {draft.exercises.map((entry, index) => (
                  <BuilderExerciseRow
                    key={entry.exerciseId}
                    entry={entry}
                    index={index}
                    total={draft.exercises.length}
                    onChange={changeEntry}
                    onMove={moveEntry}
                    onRemove={removeEntry}
                    problems={errors.fields?.[`entry-${index}`] ?? []}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No exercises yet"
                note="Add at least one exercise. Without it there is no plan to save, and no duration to estimate."
              />
            )}

            {errors.exercises && <p className="form-field__error">{errors.exercises}</p>}

            <div className="workout-builder__actions">
              <Button type="submit" variant="primary" size="lg">
                {isEditing ? 'Save changes' : 'Save workout'}
              </Button>
              <Button to="/workouts" variant="ghost">
                Cancel
              </Button>
              <p className="workout-builder__actions-note">
                Saving stores the plan on this device. It does not mark anything as completed.
              </p>
            </div>
          </section>
        </div>
      </form>
    </div>
  )
}

/**
 * Start the form from the temporary exercise selection.
 *
 * Only fills an empty plan in create mode. An edit keeps the saved workout's
 * own exercises, because that plan is the one being changed, and a form the
 * athlete already typed into is never overwritten by an import.
 *
 * @param {object} base           the draft the form would otherwise start from
 * @param {object[]} selection    exercises from `useWorkoutSelection`
 * @param {boolean} allowed       whether importing is appropriate at all
 * @returns {{draft: object, seeded: boolean}}
 */
function importSelection(base, selection, allowed) {
  if (!allowed || base.exercises.length > 0 || selection.length === 0) {
    return { draft: base, seeded: false }
  }

  return {
    draft: {
      ...base,
      exercises: normalizeWorkoutExercises(
        selection.map((exercise) => createWorkoutEntry(exercise.id)),
      ),
    },
    seeded: true,
  }
}

/** One labelled select for the builder's controlled vocabularies. */
function SelectField({ id, label, value, options, onChange }) {
  return (
    <div className="workout-builder__select">
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default WorkoutBuilder