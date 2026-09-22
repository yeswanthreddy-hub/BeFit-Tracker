import { createExercise, defaultProfile, defaultSettings, emptyStreak } from './models'

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000).toISOString()

/* ---------- exercise catalog (code data, easy to expand) ---------- */

export const sampleExercises = [
  createExercise({
    id: 'ex-bench-press',
    name: 'Barbell Bench Press',
    category: 'Chest',
    muscleGroup: 'Chest, shoulders, triceps',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: [
      'Lie on the bench with your feet flat on the floor.',
      'Grip the bar slightly wider than shoulder-width and unrack.',
      'Lower the bar to mid-chest, then press to lockout.',
    ],
    formTips: ['Keep your shoulder blades squeezed together.'],
  }),
  createExercise({
    id: 'ex-incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    muscleGroup: 'Upper chest, shoulders',
    equipment: 'Dumbbells',
    difficulty: 'beginner',
    instructions: [
      'Set the bench to a 30-degree incline.',
      'Press the dumbbells up from the chest without locking out hard.',
    ],
    formTips: ['Lower until you feel a stretch in the upper chest.'],
  }),
  createExercise({
    id: 'ex-pull-up',
    name: 'Pull-Up',
    category: 'Back',
    muscleGroup: 'Lats, upper back, biceps',
    equipment: 'Pull-up bar',
    difficulty: 'intermediate',
    instructions: [
      'Hang from the bar with an overhand grip.',
      'Drive your elbows down and pull your chin over the bar.',
      'Lower under control to a full hang.',
    ],
    formTips: ['Avoid swinging — use a controlled tempo.'],
  }),
  createExercise({
    id: 'ex-barbell-row',
    name: 'Barbell Row',
    category: 'Back',
    muscleGroup: 'Mid back, lats, biceps',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: [
      'Hinge to a 45-degree angle with a flat back.',
      'Row the bar to your lower ribs.',
      'Lower to a full arm stretch.',
    ],
    formTips: ['Keep your core braced and bar path tight.'],
  }),
  createExercise({
    id: 'ex-overhead-press',
    name: 'Overhead Press',
    category: 'Shoulders',
    muscleGroup: 'Shoulders, triceps',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: [
      'Hold the bar at shoulder height.',
      'Press straight up until your arms are locked out.',
      'Lower back to the start under control.',
    ],
    formTips: ['Squeeze your glutes to protect your lower back.'],
  }),
  createExercise({
    id: 'ex-back-squat',
    name: 'Barbell Back Squat',
    category: 'Legs',
    muscleGroup: 'Quads, glutes, hamstrings',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: [
      'Rest the bar on your upper back.',
      'Brace and squat until your thighs reach parallel.',
      'Drive through your feet to stand back up.',
    ],
    formTips: ['Keep your knees tracking over your toes.'],
  }),
  createExercise({
    id: 'ex-romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'Legs',
    muscleGroup: 'Hamstrings, glutes',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    instructions: [
      'Stand with the bar at your hips.',
      'Hinge at the hips and slide the bar down your legs.',
      'Drive hips forward to return to standing.',
    ],
    formTips: ['Feel the stretch in your hamstrings at the bottom.'],
  }),
  createExercise({
    id: 'ex-walking-lunge',
    name: 'Walking Lunge',
    category: 'Legs',
    muscleGroup: 'Quads, glutes',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    instructions: [
      'Step forward into a deep lunge.',
      'Push off the front foot into the next step.',
    ],
    formTips: ['Keep your torso tall and core braced.'],
  }),
  createExercise({
    id: 'ex-plank',
    name: 'Plank',
    category: 'Abs/Core',
    muscleGroup: 'Whole core',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    instructions: [
      'Hold a forearm plank with a straight line from head to heels.',
      'Brace your abs and breathe steadily.',
    ],
    formTips: ['Squeeze your glutes to keep your hips level.'],
  }),
  createExercise({
    id: 'ex-burpee',
    name: 'Burpee',
    category: 'Full Body',
    muscleGroup: 'Full body',
    equipment: 'Bodyweight',
    difficulty: 'advanced',
    instructions: [
      'Squat down and place your hands on the floor.',
      'Jump your feet back into a plank.',
      'Return your feet, jump up, and clap overhead.',
    ],
    formTips: ['Land soft and keep your knees over your toes.'],
  }),
  createExercise({
    id: 'ex-running',
    name: 'Running Intervals',
    category: 'Cardio',
    muscleGroup: 'Cardiovascular system',
    equipment: 'No equipment',
    difficulty: 'beginner',
    instructions: [
      'Warm up with a light jog for 3 minutes.',
      'Sprint for 30 seconds, then walk for 60 seconds. Repeat 6 times.',
    ],
    formTips: ['Keep your breathing steady between efforts.'],
  }),
]

/* ---------- sample workouts (seed data) ---------- */

export const sampleWorkouts = [
  {
    id: 'wk-push-day',
    title: 'Push Day',
    focus: ['Chest', 'Shoulders', 'Arms'],
    durationMinutes: 55,
    difficulty: 'intermediate',
    exercises: [
      { exerciseId: 'ex-bench-press', sets: 4, reps: '8-10' },
      { exerciseId: 'ex-incline-dumbbell-press', sets: 3, reps: '10-12' },
      { exerciseId: 'ex-overhead-press', sets: 3, reps: '8-10' },
      { exerciseId: 'ex-plank', sets: 3, reps: '45 sec' },
    ],
  },
  {
    id: 'wk-pull-day',
    title: 'Pull Day',
    focus: ['Back', 'Arms'],
    durationMinutes: 50,
    difficulty: 'intermediate',
    exercises: [
      { exerciseId: 'ex-pull-up', sets: 4, reps: '6-8' },
      { exerciseId: 'ex-barbell-row', sets: 4, reps: '10-12' },
      { exerciseId: 'ex-plank', sets: 3, reps: '45 sec' },
    ],
  },
  {
    id: 'wk-lower-body',
    title: 'Lower Body Strength',
    focus: ['Legs'],
    durationMinutes: 60,
    difficulty: 'intermediate',
    exercises: [
      { exerciseId: 'ex-back-squat', sets: 4, reps: '8-10' },
      { exerciseId: 'ex-romanian-deadlift', sets: 3, reps: '10-12' },
      { exerciseId: 'ex-walking-lunge', sets: 3, reps: '12 each' },
    ],
  },
]

/* ---------- sample completed workouts ---------- */

export const sampleCompletedWorkouts = [
  {
    id: 'cw-1',
    workoutTitle: 'Push Day',
    date: daysAgo(1),
    durationMinutes: 52,
    totalSets: 13,
    exercises: [
      { exerciseId: 'ex-bench-press', sets: 4, reps: '8-10' },
      { exerciseId: 'ex-overhead-press', sets: 3, reps: '8-10' },
      { exerciseId: 'ex-plank', sets: 3, reps: '45 sec' },
    ],
  },
  {
    id: 'cw-2',
    workoutTitle: 'Lower Body Strength',
    date: daysAgo(3),
    durationMinutes: 58,
    totalSets: 10,
    exercises: [
      { exerciseId: 'ex-back-squat', sets: 4, reps: '8-10' },
      { exerciseId: 'ex-romanian-deadlift', sets: 3, reps: '10-12' },
    ],
  },
]

/* ---------- sample food log ---------- */

export const sampleFoodLog = [
  {
    id: 'f-1',
    date: daysAgo(0),
    meal: 'breakfast',
    name: 'Oats with berries',
    calories: 320,
    protein: 14,
    carbs: 52,
    fat: 7,
  },
  {
    id: 'f-2',
    date: daysAgo(0),
    meal: 'lunch',
    name: 'Chicken rice bowl',
    calories: 540,
    protein: 42,
    carbs: 58,
    fat: 14,
  },
  {
    id: 'f-3',
    date: daysAgo(0),
    meal: 'snack',
    name: 'Protein shake',
    calories: 180,
    protein: 25,
    carbs: 8,
    fat: 3,
  },
  {
    id: 'f-4',
    date: daysAgo(0),
    meal: 'dinner',
    name: 'Salmon & greens',
    calories: 460,
    protein: 36,
    carbs: 14,
    fat: 26,
  },
]

/* ---------- sample progress ---------- */

export const sampleProgress = [
  { id: 'p-1', date: daysAgo(21), bodyWeightKg: 78.4, note: 'Week start' },
  { id: 'p-2', date: daysAgo(14), bodyWeightKg: 78.0, note: 'Consistent training' },
  { id: 'p-3', date: daysAgo(7), bodyWeightKg: 77.3, note: 'PR on bench +2.5kg' },
  { id: 'p-4', date: daysAgo(0), bodyWeightKg: 77.0, note: 'Feeling strong' },
]

/* ---------- sample profile / settings / streak ---------- */

export const sampleProfile = defaultProfile()

export const sampleSettings = defaultSettings()

export const sampleStreak = {
  ...emptyStreak(),
  current: 6,
  best: 12,
  lastWorkoutDate: daysAgo(1),
}