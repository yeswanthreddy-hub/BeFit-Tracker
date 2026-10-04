import { WORKOUT_CATEGORY_NAMES } from './workoutCategories'

/**
 * BeFit workout library.
 *
 * These are the ready-made plans an athlete can browse, open and prepare to
 * train. They ship in code (like the exercise catalog) so a signed-out visitor
 * sees the same library before any data exists, and so a template can never be
 * half-written or duplicated.
 *
 * A workout never duplicates exercise information. Every entry references an
 * exercise by id from `src/data/exercises.js` and stores only the plan:
 *
 * ```js
 * { exerciseId: 'push-up', sets: 3, reps: 10, restSeconds: 45 }
 * ```
 *
 * The workout builder in Prompt 6 resolves those ids back into exercise
 * records, so renaming a movement updates every workout at once.
 *
 * @typedef {Object} WorkoutExercise
 * @property {string} exerciseId      id from src/data/exercises.js
 * @property {number} sets            working sets, minimum 1
 * @property {number} reps            repetitions per set, minimum 1
 * @property {number} restSeconds     rest after each set, minimum 0
 * @property {number} [durationSeconds] hold time for isometric work (planks);
 *   when set, the reps field is treated as unused and the row is timed
 *
 * @typedef {Object} Workout
 * @property {string} id              unique slug, e.g. "full-body-beginner"
 * @property {string} name
 * @property {string} description     what the session does and who it suits
 * @property {string} category        one of WORKOUT_CATEGORY_NAMES
 * @property {string} goal            one of WORKOUT_GOALS
 * @property {string} difficulty      one of EXERCISE_DIFFICULTIES
 * @property {number} durationMinutes realistic estimate including rest
 * @property {string} equipment       one of WORKOUT_EQUIPMENT
 * @property {string[]} targetMuscles muscles the plan emphasises
 * @property {WorkoutExercise[]} exercises
 */

/**
 * Fill in a complete workout record.
 *
 * Defaults keep a half-written template visible in development rather than
 * crashing the library: the safest useful plan is a short, bodyweight,
 * beginner-friendly session with one exercise.
 *
 * @param {Partial<Workout>} partial
 * @returns {Workout}
 */
export function defineWorkout(partial = {}) {
  return {
    id: '',
    name: '',
    description: '',
    category: 'Full Body',
    goal: 'General Fitness',
    difficulty: 'Beginner',
    durationMinutes: 20,
    equipment: 'No Equipment',
    targetMuscles: [],
    exercises: [{ exerciseId: '', sets: 3, reps: 10, restSeconds: 45 }],
    ...partial,
  }
}

/* ---------- beginner foundations ---------- */

const BEGINNER_WORKOUTS = [
  defineWorkout({
    id: 'full-body-beginner',
    name: 'Full Body Beginner',
    description:
      'The starter session. Four simple movements train your whole body in three rounds, so you learn the patterns before adding load.',
    category: 'Full Body',
    goal: 'General Fitness',
    difficulty: 'Beginner',
    durationMinutes: 20,
    equipment: 'No Equipment',
    targetMuscles: ['Chest', 'Quads', 'Glutes', 'Core'],
    exercises: [
      { exerciseId: 'incline-push-up', sets: 3, reps: 10, restSeconds: 45 },
      { exerciseId: 'bodyweight-squat', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'glute-bridge', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'plank', sets: 3, reps: 1, restSeconds: 30, durationSeconds: 30 },
    ],
  }),
  defineWorkout({
    id: 'strength-starter',
    name: 'Strength Starter',
    description:
      'A first step into loaded training: two compound dumbbell moves, an arm finisher and a plank, with rest long enough to learn good reps.',
    category: 'Strength',
    goal: 'Improve Strength',
    difficulty: 'Beginner',
    durationMinutes: 30,
    equipment: 'Dumbbells',
    targetMuscles: ['Quads', 'Chest', 'Biceps', 'Core'],
    exercises: [
      { exerciseId: 'dumbbell-thruster', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'dumbbell-lunge', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'dumbbell-bicep-curl', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'glute-bridge', sets: 3, reps: 15, restSeconds: 45 },
      { exerciseId: 'plank', sets: 3, reps: 1, restSeconds: 30, durationSeconds: 30 },
    ],
  }),
  defineWorkout({
    id: 'beginner-home-workout',
    name: 'Beginner Home Workout',
    description:
      'No equipment, small room, twenty-five minutes. Each movement has a scaled version, so it works in a bedroom as well as a gym.',
    category: 'Home',
    goal: 'General Fitness',
    difficulty: 'Beginner',
    durationMinutes: 25,
    equipment: 'No Equipment',
    targetMuscles: ['Chest', 'Quads', 'Glutes', 'Core', 'Upper Back'],
    exercises: [
      { exerciseId: 'incline-push-up', sets: 3, reps: 10, restSeconds: 45 },
      { exerciseId: 'bodyweight-squat', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'superman', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'glute-bridge', sets: 3, reps: 15, restSeconds: 45 },
      { exerciseId: 'cat-cow', sets: 2, reps: 10, restSeconds: 20 },
    ],
  }),
]

/* ---------- full body ---------- */

const FULL_BODY_WORKOUTS = [
  defineWorkout({
    id: 'full-body-intermediate',
    name: 'Full Body Intermediate',
    description:
      'Four compound movements, two rep ranges and real rest. Add weight each week and this becomes your default session.',
    category: 'Full Body',
    goal: 'Build Muscle',
    difficulty: 'Intermediate',
    durationMinutes: 35,
    equipment: 'Dumbbells',
    targetMuscles: ['Chest', 'Mid Back', 'Quads', 'Core'],
    exercises: [
      { exerciseId: 'dumbbell-thruster', sets: 4, reps: 10, restSeconds: 75 },
      { exerciseId: 'dumbbell-bent-over-row', sets: 4, reps: 10, restSeconds: 75 },
      { exerciseId: 'reverse-lunge', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'dumbbell-front-raise', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'plank', sets: 3, reps: 1, restSeconds: 30, durationSeconds: 45 },
    ],
  }),
  defineWorkout({
    id: 'full-body-20-minute',
    name: '20 Minute Full Body',
    description:
      'A brisk bodyweight session that keeps the rest short and the pace up, so a full-body signal still fits inside a lunch break.',
    category: 'Full Body',
    goal: 'Lose Weight',
    difficulty: 'Intermediate',
    durationMinutes: 20,
    equipment: 'No Equipment',
    targetMuscles: ['Chest', 'Quads', 'Glutes', 'Core'],
    exercises: [
      { exerciseId: 'burpee', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'jump-squat', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'incline-push-up', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'mountain-climber', sets: 3, reps: 1, restSeconds: 40, durationSeconds: 30 },
      { exerciseId: 'plank', sets: 3, reps: 1, restSeconds: 30, durationSeconds: 30 },
    ],
  }),
  defineWorkout({
    id: 'fat-loss-circuit',
    name: 'Fat Loss Circuit',
    description:
      'Loaded work at a pace you can hold. Keep the rest honest and the circuit drops from four rounds to three as you get fitter.',
    category: 'Cardio',
    goal: 'Lose Weight',
    difficulty: 'Advanced',
    durationMinutes: 35,
    equipment: 'Dumbbells',
    targetMuscles: ['Cardiovascular System', 'Chest', 'Quads', 'Core'],
    exercises: [
      { exerciseId: 'dumbbell-thruster', sets: 4, reps: 12, restSeconds: 45 },
      { exerciseId: 'dumbbell-lunge', sets: 4, reps: 12, restSeconds: 45 },
      { exerciseId: 'jump-squat', sets: 4, reps: 12, restSeconds: 45 },
      { exerciseId: 'dumbbell-front-raise', sets: 3, reps: 15, restSeconds: 30 },
      { exerciseId: 'plank', sets: 3, reps: 1, restSeconds: 30, durationSeconds: 45 },
    ],
  }),
]

/* ---------- split sessions ---------- */

const SPLIT_WORKOUTS = [
  defineWorkout({
    id: 'upper-body-strength',
    name: 'Upper Body Strength',
    description:
      'Press, pull and carry volume for the top half, ordered so the heaviest work happens while you are fresh.',
    category: 'Upper Body',
    goal: 'Improve Strength',
    difficulty: 'Intermediate',
    durationMinutes: 40,
    equipment: 'Gym Equipment',
    targetMuscles: ['Chest', 'Lats', 'Shoulders'],
    exercises: [
      { exerciseId: 'barbell-shoulder-press', sets: 4, reps: 6, restSeconds: 90 },
      { exerciseId: 'pull-up', sets: 4, reps: 6, restSeconds: 90 },
      { exerciseId: 'dumbbell-bent-over-row', sets: 4, reps: 8, restSeconds: 75 },
      { exerciseId: 'dumbbell-lateral-raise', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'hammer-curl', sets: 3, reps: 10, restSeconds: 45 },
    ],
  }),
  defineWorkout({
    id: 'lower-body-strength',
    name: 'Lower Body Strength',
    description:
      'Squat, lunge, hinge and calf work with full rest between sets. The session that builds real legs.',
    category: 'Lower Body',
    goal: 'Build Muscle',
    difficulty: 'Intermediate',
    durationMinutes: 40,
    equipment: 'Dumbbells',
    targetMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Calves'],
    exercises: [
      { exerciseId: 'bodyweight-squat', sets: 4, reps: 12, restSeconds: 75 },
      { exerciseId: 'dumbbell-lunge', sets: 4, reps: 10, restSeconds: 75 },
      { exerciseId: 'glute-bridge', sets: 3, reps: 15, restSeconds: 60 },
      { exerciseId: 'calf-raise', sets: 3, reps: 15, restSeconds: 45 },
      { exerciseId: 'kneeling-hip-flexor-stretch', sets: 2, reps: 1, restSeconds: 20, durationSeconds: 30 },
    ],
  }),
  defineWorkout({
    id: 'chest-focus',
    name: 'Chest Focus',
    description:
      'Four pressing angles in one session, from a push-up to a pike push-up, so the chest gets hit from more than one direction.',
    category: 'Chest',
    goal: 'Build Muscle',
    difficulty: 'Beginner',
    durationMinutes: 25,
    equipment: 'No Equipment',
    targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
    exercises: [
      { exerciseId: 'push-up', sets: 4, reps: 10, restSeconds: 60 },
      { exerciseId: 'wide-push-up', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'incline-push-up', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'pike-push-up', sets: 3, reps: 8, restSeconds: 60 },
    ],
  }),
  defineWorkout({
    id: 'back-and-biceps',
    name: 'Back & Biceps',
    description:
      'Pulling volume first, then curls while the biceps are already warm. Add a band pull if you cannot do a full pull-up yet.',
    category: 'Back',
    goal: 'Build Muscle',
    difficulty: 'Intermediate',
    durationMinutes: 35,
    equipment: 'Dumbbells',
    targetMuscles: ['Lats', 'Mid Back', 'Biceps', 'Upper Back'],
    exercises: [
      { exerciseId: 'pull-up', sets: 4, reps: 6, restSeconds: 90 },
      { exerciseId: 'dumbbell-bent-over-row', sets: 4, reps: 10, restSeconds: 75 },
      { exerciseId: 'assisted-pull-up', sets: 3, reps: 8, restSeconds: 60 },
      { exerciseId: 'dumbbell-bicep-curl', sets: 3, reps: 12, restSeconds: 45 },
      { exerciseId: 'superman', sets: 3, reps: 12, restSeconds: 45 },
    ],
  }),
  defineWorkout({
    id: 'legs-and-glutes',
    name: 'Legs & Glutes',
    description:
      'Bodyweight lower-body work that finishes with a hip stretch, so the session builds strength without wrecking your range of motion.',
    category: 'Lower Body',
    goal: 'Improve Strength',
    difficulty: 'Beginner',
    durationMinutes: 30,
    equipment: 'No Equipment',
    targetMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Hips'],
    exercises: [
      { exerciseId: 'bodyweight-squat', sets: 4, reps: 15, restSeconds: 60 },
      { exerciseId: 'reverse-lunge', sets: 3, reps: 12, restSeconds: 60 },
      { exerciseId: 'glute-bridge', sets: 3, reps: 15, restSeconds: 45 },
      { exerciseId: 'calf-raise', sets: 3, reps: 20, restSeconds: 30 },
      { exerciseId: 'worlds-greatest-stretch', sets: 2, reps: 1, restSeconds: 20, durationSeconds: 30 },
    ],
  }),
  defineWorkout({
    id: 'core-blast',
    name: 'Core Blast',
    description:
      'Anti-rotation, anti-extension and lateral work. Fifteen focused minutes that make every other lift in the app more stable.',
    category: 'Core',
    goal: 'Improve Strength',
    difficulty: 'Beginner',
    durationMinutes: 20,
    equipment: 'No Equipment',
    targetMuscles: ['Core', 'Abdominals', 'Obliques'],
    exercises: [
      { exerciseId: 'plank', sets: 3, reps: 1, restSeconds: 30, durationSeconds: 45 },
      { exerciseId: 'bicycle-crunch', sets: 3, reps: 20, restSeconds: 45 },
      { exerciseId: 'leg-raise', sets: 3, reps: 15, restSeconds: 45 },
      { exerciseId: 'mountain-climber', sets: 3, reps: 1, restSeconds: 40, durationSeconds: 30 },
      { exerciseId: 'superman', sets: 3, reps: 15, restSeconds: 30 },
    ],
  }),
]

/* ---------- conditioning & short sessions ---------- */

const CARDIO_WORKOUTS = [
  defineWorkout({
    id: 'no-equipment-cardio',
    name: 'No Equipment Cardio',
    description:
      'Four rounds of jumping, running and crawling patterns that raise your engine without a single machine or jump rope.',
    category: 'Cardio',
    goal: 'Improve Endurance',
    difficulty: 'Intermediate',
    durationMinutes: 25,
    equipment: 'No Equipment',
    targetMuscles: ['Cardiovascular System', 'Calves', 'Core'],
    exercises: [
      { exerciseId: 'jumping-jacks', sets: 4, reps: 1, restSeconds: 45, durationSeconds: 45 },
      { exerciseId: 'high-knees', sets: 4, reps: 1, restSeconds: 45, durationSeconds: 45 },
      { exerciseId: 'mountain-climber', sets: 4, reps: 1, restSeconds: 45, durationSeconds: 45 },
      { exerciseId: 'burpee', sets: 4, reps: 10, restSeconds: 60 },
      { exerciseId: 'bear-crawl', sets: 3, reps: 1, restSeconds: 45, durationSeconds: 30 },
    ],
  }),
  defineWorkout({
    id: 'quick-10-minute',
    name: 'Quick 10 Minute Workout',
    description:
      'Ten honest minutes of full-body work. Nothing fancy, just four movements, short rests and no excuses about the weather.',
    category: 'Quick Workouts',
    goal: 'Improve Endurance',
    difficulty: 'Beginner',
    durationMinutes: 10,
    equipment: 'No Equipment',
    targetMuscles: ['Core', 'Glutes', 'Cardiovascular System'],
    exercises: [
      { exerciseId: 'jumping-jacks', sets: 2, reps: 1, restSeconds: 30, durationSeconds: 40 },
      { exerciseId: 'bodyweight-squat', sets: 2, reps: 15, restSeconds: 30 },
      { exerciseId: 'incline-push-up', sets: 2, reps: 10, restSeconds: 30 },
      { exerciseId: 'bear-crawl', sets: 2, reps: 1, restSeconds: 30, durationSeconds: 30 },
    ],
  }),
  defineWorkout({
    id: 'home-15-minute',
    name: '15 Minute Home Workout',
    description:
      'A fast bodyweight circuit sized for a small room. Ideal on days when the plan is a plan and the walk to the gym is an excuse.',
    category: 'Home',
    goal: 'Lose Weight',
    difficulty: 'Beginner',
    durationMinutes: 15,
    equipment: 'No Equipment',
    targetMuscles: ['Cardiovascular System', 'Quads', 'Core'],
    exercises: [
      { exerciseId: 'mountain-climber', sets: 3, reps: 1, restSeconds: 30, durationSeconds: 30 },
      { exerciseId: 'jump-squat', sets: 3, reps: 10, restSeconds: 45 },
      { exerciseId: 'high-knees', sets: 3, reps: 1, restSeconds: 30, durationSeconds: 30 },
      { exerciseId: 'cat-cow', sets: 2, reps: 10, restSeconds: 20 },
    ],
  }),
]

/**
 * Freeze a value and everything nested inside it.
 *
 * The library is code, not user data: a filter that accidentally pushed onto
 * `exercises` would corrupt every card for the rest of the session, so the
 * whole tree is frozen like the exercise catalog.
 *
 * @template T
 * @param {T} value
 * @returns {Readonly<T>}
 */
function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value

  Object.freeze(value)
  Object.values(value).forEach(deepFreeze)
  return value
}

/**
 * Every built-in workout template.
 *
 * @type {readonly Workout[]}
 */
export const WORKOUTS = deepFreeze([
  ...BEGINNER_WORKOUTS,
  ...FULL_BODY_WORKOUTS,
  ...SPLIT_WORKOUTS,
  ...CARDIO_WORKOUTS,
])

/** Total number of built-in templates. */
export const WORKOUT_COUNT = WORKOUTS.length

/**
 * Every category is guaranteed to appear in the library.
 *
 * A category with no workouts means the library is missing content, which is
 * worth catching in a test rather than showing an empty filter chip.
 */
export const WORKOUT_CATEGORIES_WITHOUT_WORKOUTS = Object.freeze(
  WORKOUT_CATEGORY_NAMES.filter((name) => !WORKOUTS.some((workout) => workout.category === name)),
)