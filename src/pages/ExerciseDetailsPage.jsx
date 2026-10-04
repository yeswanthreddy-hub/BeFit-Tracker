import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ExerciseVisual from '../components/exercises/ExerciseVisual'
import DifficultyBadge from '../components/exercises/DifficultyBadge'
import InstructionSteps from '../components/exercises/InstructionSteps'
import RelatedExercises from '../components/exercises/RelatedExercises'
import { getExerciseById, getExerciseCategoryRecord, getRelatedExercises } from '../utils/exercises'

/**
 * Exercise details at /exercises/:exerciseId.
 *
 * Every value on this page comes from the exercise record — instructions, form
 * tips and the metadata list are read, never hardcoded here. An unknown id
 * resolves to `null` and renders a proper not-found state instead of throwing,
 * so a stale or mistyped link can never crash the app.
 */
function ExerciseDetailsPage() {
  const { exerciseId } = useParams()
  const exercise = getExerciseById(exerciseId)

  // Arriving from a scrolled grid should land at the top of the new page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [exerciseId])

  const related = useMemo(() => getRelatedExercises(exercise, 4), [exercise])

  if (!exercise) {
    return (
      <div className="page exercise-detail">
        <Link to="/exercises" className="exercise-detail__back">
          <span aria-hidden="true">←</span> Back to Exercises
        </Link>
        <EmptyState
          title="Exercise not found"
          note={`There is no exercise with the id "${exerciseId}". It may have been renamed — the full library is still there.`}
          action={
            <Button to="/exercises" variant="primary">
              Back to Exercises
            </Button>
          }
        />
      </div>
    )
  }

  const category = getExerciseCategoryRecord(exercise)

  return (
    <div className="page exercise-detail" style={{ '--exercise-accent': category.accent }}>
      <Link to="/exercises" className="exercise-detail__back">
        <span aria-hidden="true">←</span> Back to Exercises
      </Link>

      <article className="exercise-detail__hero">
        <div className="exercise-detail__panel">
          <ExerciseVisual category={exercise.category} size="detail" decorative={false} />
          <span className="chip chip--primary">{category.name}</span>
          <p className="exercise-detail__panel-note">
            {category.description}
          </p>
        </div>

        <div className="exercise-detail__intro">
          <p className="section-header__eyebrow">{exercise.type}</p>
          <h1 className="exercise-detail__title">{exercise.name}</h1>
          <p className="exercise-detail__description">{exercise.description}</p>

          <dl className="exercise-detail__meta">
            <div className="exercise-detail__meta-item">
              <dt>Difficulty</dt>
              <dd>
                <DifficultyBadge difficulty={exercise.difficulty} />
              </dd>
            </div>
            <div className="exercise-detail__meta-item">
              <dt>Equipment</dt>
              <dd>{exercise.equipment}</dd>
            </div>
            <div className="exercise-detail__meta-item">
              <dt>Exercise type</dt>
              <dd>{exercise.type}</dd>
            </div>
            <div className="exercise-detail__meta-item">
              <dt>Typical time</dt>
              <dd>{exercise.durationMinutes} min</dd>
            </div>
          </dl>

          <div className="exercise-detail__muscles">
            <div className="exercise-detail__muscle-group">
              <h2 className="exercise-detail__muscle-title">Target muscles</h2>
              <ul className="exercise-detail__chips">
                {exercise.targetMuscles.map((muscle) => (
                  <li key={muscle} className="chip chip--primary">
                    {muscle}
                  </li>
                ))}
              </ul>
            </div>

            {exercise.secondaryMuscles.length > 0 && (
              <div className="exercise-detail__muscle-group">
                <h2 className="exercise-detail__muscle-title">Secondary muscles</h2>
                <ul className="exercise-detail__chips">
                  {exercise.secondaryMuscles.map((muscle) => (
                    <li key={muscle} className="chip chip--accent">
                      {muscle}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="exercise-detail__cta">
            <Button to="/workouts" variant="primary" size="lg">
              Start a workout
            </Button>
            <p className="exercise-detail__cta-note">
              Add it to a session from the workout library.
            </p>
          </div>
        </div>
      </article>

      <div className="exercise-detail__body">
        <section className="card exercise-detail__section" aria-labelledby="instructions-heading">
          <p className="section-header__eyebrow">How to perform</p>
          <h2 className="exercise-detail__section-title" id="instructions-heading">
            Step by step
          </h2>
          <InstructionSteps instructions={exercise.instructions} />
        </section>

        <section className="card exercise-detail__section" aria-labelledby="tips-heading">
          <p className="section-header__eyebrow">Form tips</p>
          <h2 className="exercise-detail__section-title" id="tips-heading">
            Make every rep count
          </h2>
          <ul className="exercise-detail__tips">
            {exercise.tips.map((tip) => (
              <li key={tip} className="exercise-detail__tip">
                {tip}
              </li>
            ))}
          </ul>
          <p className="exercise-detail__disclaimer">
            Training guidance, not medical advice. Stop the movement if it causes pain.
          </p>
        </section>
      </div>

      <RelatedExercises exercises={related} />
    </div>
  )
}

export default ExerciseDetailsPage