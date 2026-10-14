import { useMemo, useState } from 'react'

import PageContainer from '../../components/ui/PageContainer'
import SectionHeader from '../../components/ui/SectionHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import ProgressStatCard from '../../components/progress/ProgressStatCard'
import ActivityChart from '../../components/progress/ActivityChart'
import TrendChart from '../../components/progress/TrendChart'
import WorkoutConsistency from '../../components/progress/WorkoutConsistency'
import StatBars from '../../components/progress/StatBars'
import NutritionProgress from '../../components/progress/NutritionProgress'
import PersonalBests from '../../components/progress/PersonalBests'

import { useAuth } from '../../hooks/useAuth'
import { useUserStorage } from '../../hooks/useUserStorage'
import { useCustomWorkouts } from '../../hooks/useCustomWorkouts'
import { STORAGE_KEYS } from '../../utils/storageKeys'
import { getDisplayName } from '../../utils/user'
import { calculateStreak } from '../../utils/streak'
import { parseCompletedWorkouts } from '../../utils/workoutHistory'
import { parseFoodLog, normalizeNutritionProfile } from '../../utils/nutrition'
import { EXERCISES } from '../../data/exercises'
import { WORKOUTS } from '../../data/workouts'
import {
  ALL_TIME,
  RANGE_OPTIONS,
  filterCompletedByRange,
  getConsistencyStats,
  getCurrentWeekConsistency,
  getMuscleGroupStats,
  getNutritionProgress,
  getNutritionTrend,
  getPersonalBests,
  getProgressInsights,
  getWorkoutActivity,
  getWorkoutCategoryStats,
  getWorkoutDurationStats,
  getWorkoutProgress,
} from '../../utils/progress'
import './Progress.css'

/**
 * Progress & analytics.
 *
 * Turns the athlete's real completed workouts into a readable picture of how
 * they are doing. Every number comes from stored data through pure helpers in
 * `utils/progress.js`; nothing is seeded, faked or assumed, and a fresh account
 * gets an explicit empty state instead of decorative charts.
 */
function Progress() {
  const { user } = useAuth()

  const [completed] = useUserStorage(STORAGE_KEYS.completedWorkouts, [])
  const [foodLog] = useUserStorage(STORAGE_KEYS.foodLog, [])
  const [nutritionProfile] = useUserStorage(STORAGE_KEYS.nutritionProfile, {})
  const { workouts: customWorkouts } = useCustomWorkouts()

  const [range, setRange] = useState(30)

  // One "now" per render so every range calculation agrees on today.
  const now = useMemo(() => new Date(), [])

  const data = useMemo(() => {
    const records = parseCompletedWorkouts(completed)
    const logs = parseFoodLog(foodLog)
    const allWorkouts = [...customWorkouts, ...WORKOUTS]

    const rangedRecords = filterCompletedByRange(records, range, now)
    const streak = calculateStreak(records)

    return {
      hasWorkouts: records.length > 0,
      hasNutrition: logs.length > 0,
      streak,
      allTime: getWorkoutProgress(records),
      activity: getWorkoutActivity(records, range, now),
      week: getCurrentWeekConsistency(records, now),
      consistency: getConsistencyStats(records, range, now),
      categoryStats: getWorkoutCategoryStats(rangedRecords),
      muscleStats: getMuscleGroupStats(rangedRecords, allWorkouts, EXERCISES),
      duration: getWorkoutDurationStats(records, range, now),
      nutrition: getNutritionProgress(logs, nutritionProfile, range, now),
      calorieTrend: getNutritionTrendPoints(logs, range, now, 'calories'),
      proteinTrend: getNutritionTrendPoints(logs, range, now, 'protein'),
      proteinTarget: normalizeNutritionProfile(nutritionProfile).dailyProteinTarget,
      bests: getPersonalBests({
        completed: records,
        nutritionProgress: getNutritionProgress(logs, nutritionProfile, ALL_TIME, now),
        streak,
      }),
    }
  }, [completed, foodLog, nutritionProfile, customWorkouts, range, now])

  const insights = useMemo(
    () =>
      getProgressInsights({
        workoutProgress: data.allTime,
        nutritionProgress: data.nutrition,
        categoryStats: data.categoryStats,
        muscleStats: data.muscleStats,
        consistency: data.consistency,
        hasWorkouts: data.hasWorkouts,
        hasNutrition: data.hasNutrition,
      }),
    [data],
  )

  const firstName = getDisplayName(user)
  const hasAnyData = data.hasWorkouts || data.hasNutrition

  return (
    <PageContainer className="progress-page">
      <SectionHeader
        eyebrow="Analytics"
        title="Your Progress"
        sub={`Keep showing up, ${firstName}. Your consistency tells the real story.`}
      />

      {!hasAnyData ? (
        <EmptyState
          title="Your progress story starts here."
          note="Complete your first workout and log your meals to unlock detailed analytics."
          action={
            <div className="progress__empty-actions">
              <Button to="/workouts" variant="primary">
                Start Workout
              </Button>
              <Button to="/diet" variant="secondary">
                Track Food
              </Button>
            </div>
          }
        />
      ) : (
        <>
          {!data.hasWorkouts ? (
            <EmptyState
              title="No workout data yet."
              note="Complete a workout and your activity, categories and training time will appear here."
              action={
                <Button to="/workouts" variant="primary">
                  Start Workout
                </Button>
              }
            />
          ) : (
            <>
              <div className="progress__overview">
            <ProgressStatCard
              title="Total Workouts"
              value={data.allTime.total}
              label="all time"
              icon="🏋️"
              tone="primary"
            />
            <ProgressStatCard
              title="Active Days"
              value={data.allTime.activeDays}
              label="days trained"
              icon="📅"
              tone="accent"
            />
            <ProgressStatCard
              title="Current Streak"
              value={`${data.streak.current}`}
              label={`${data.streak.current === 1 ? 'day' : 'days'} in a row`}
              icon="🔥"
              tone="warn"
            />
            <ProgressStatCard
              title="Total Workout Time"
              value={data.allTime.totalLabel}
              label="accumulated"
              icon="⏱️"
            />
          </div>

          <div className="progress__range" role="group" aria-label="Select a time range">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`progress__range-btn${range === option.value ? ' is-active' : ''}`}
                onClick={() => setRange(option.value)}
                aria-pressed={range === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>

          <section className="progress__section card" aria-labelledby="progress-activity-heading">
            <h2 className="progress__section-title" id="progress-activity-heading">
              Workout activity
            </h2>
            <p className="progress__section-note">Completed workouts per {data.activity.bucketSize}.</p>
            <ActivityChart buckets={data.activity.buckets} />
          </section>

          <div className="progress__split">
            <WorkoutConsistency days={data.week} />

            <section className="progress__section card" aria-labelledby="progress-duration-heading">
              <h2 className="progress__section-title" id="progress-duration-heading">
                Training time
              </h2>
              <p className="progress__section-note">In the selected range.</p>
              <dl className="progress__duration">
                <div>
                  <dt>Total</dt>
                  <dd>{data.duration.totalLabel}</dd>
                </div>
                <div>
                  <dt>Average</dt>
                  <dd>{data.duration.averageLabel}</dd>
                </div>
                <div>
                  <dt>Longest</dt>
                  <dd>{data.duration.longestLabel}</dd>
                </div>
                <div>
                  <dt>Shortest</dt>
                  <dd>{data.duration.shortestLabel}</dd>
                </div>
              </dl>
            </section>
          </div>

          <div className="progress__split">
            <section className="progress__section card" aria-labelledby="progress-category-heading">
              <h2 className="progress__section-title" id="progress-category-heading">
                Workout categories
              </h2>
              <p className="progress__section-note">Where your sessions come from.</p>
              {data.categoryStats.length === 0 ? (
                <p className="progress__section-empty">No workouts in this range.</p>
              ) : (
                <StatBars items={data.categoryStats} unit="workouts" />
              )}
            </section>

            <section className="progress__section card" aria-labelledby="progress-muscle-heading">
              <h2 className="progress__section-title" id="progress-muscle-heading">
                Muscle groups
              </h2>
              <p className="progress__section-note">Muscles trained across your sessions.</p>
              {data.muscleStats.length === 0 ? (
                <p className="progress__section-empty">
                  Muscle data appears once your sessions use exercises from the library.
                </p>
              ) : (
                <StatBars items={data.muscleStats} unit="sessions" />
              )}
            </section>
          </div>

          <section className="progress__section card" aria-labelledby="progress-consistency-heading">
            <h2 className="progress__section-title" id="progress-consistency-heading">
              Consistency
            </h2>
            <p className="progress__section-note">
              {data.consistency.activeDays} active of {data.consistency.totalDays} days ({data.consistency.percent}%) in this range.
            </p>
            <div
              className="progress progress__consistency"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={data.consistency.percent}
              aria-label={`Workout consistency ${data.consistency.percent} percent`}
            >
              <div className="progress__fill" style={{ width: `${data.consistency.percent}%` }} />
            </div>
          </section>
            </>
          )}

          {!data.hasNutrition ? (
            <EmptyState
              title="No nutrition data yet."
              note="Log your meals on the diet page to see calories, protein and trends here."
              action={
                <Button to="/diet" variant="primary">
                  Track Food
                </Button>
              }
            />
          ) : (
            <>
              <NutritionProgress progress={data.nutrition} />

              <div className="progress__split">
                <section className="progress__section card" aria-labelledby="progress-calories-heading">
                  <h2 className="progress__section-title" id="progress-calories-heading">
                    Calories over time
                  </h2>
                  <p className="progress__section-note">Daily logged calories.</p>
                  <TrendChart
                    points={data.calorieTrend}
                    unit="kcal"
                    accent="primary"
                    title="Calories over time"
                    emptyNote="No food logged in this range."
                  />
                </section>

                <section className="progress__section card" aria-labelledby="progress-protein-heading">
                  <h2 className="progress__section-title" id="progress-protein-heading">
                    Protein intake
                  </h2>
                  <p className="progress__section-note">
                    {data.proteinTarget > 0
                      ? `Daily protein against your ${data.proteinTarget} g target.`
                      : 'Daily protein logged.'}
                  </p>
                  <TrendChart
                    points={data.proteinTrend}
                    target={data.proteinTarget}
                    unit="g"
                    accent="accent"
                    title="Protein intake"
                    emptyNote="No food logged in this range."
                  />
                </section>
              </div>
            </>
          )}

          <PersonalBests earned={data.bests.earned} locked={data.bests.locked} />

          <section className="progress__insights card" aria-labelledby="progress-insights-heading">
            <h2 className="progress__section-title" id="progress-insights-heading">
              Your insights
            </h2>
            <ul className="progress__insights-list">
              {insights.map((line, index) => (
                <li key={index} className="progress__insight">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </PageContainer>
  )
}

/** Map trend points to the {label, value} shape the chart expects. */
function getNutritionTrendPoints(logs, range, now, key) {
  return getNutritionTrend(logs, range, now).map((point) => ({
    label: point.label,
    value: point[key],
  }))
}

export default Progress
