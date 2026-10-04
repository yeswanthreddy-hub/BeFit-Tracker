import { EXERCISE_CATEGORY_NAMES } from './exerciseCategories'

/**
 * BeFit exercise library.
 *
 * Every record has the same shape, so the library page, the detail page and
 * the future workout builder / progress features can all read one structure
 * without special cases:
 *
 * ```js
 * {
 *   id, name, category,
 *   targetMuscles, secondaryMuscles,
 *   difficulty, equipment, type,
 *   durationMinutes, description,
 *   instructions, tips
 * }
 * ```
 *
 * The catalog ships in code (not localStorage): it is product content, it is
 * small, and it must work for a signed-out visitor before any data exists.
 * Only user-owned data (the temporary workout selection) is persisted.
 */

/**
 * @typedef {Object} Exercise
 * @property {string} id                 unique slug, e.g. "push-up"
 * @property {string} name
 * @property {string} category           one of EXERCISE_CATEGORY_NAMES
 * @property {string[]} targetMuscles    primary muscles worked
 * @property {string[]} secondaryMuscles supporting muscles
 * @property {'Beginner'|'Intermediate'|'Advanced'} difficulty
 * @property {'Bodyweight'|'Dumbbell'|'Barbell'|'Machine'|'Resistance Band'} equipment
 * @property {'Strength'|'Cardio'|'Mobility'} type
 * @property {number} durationMinutes    typical time to perform the movement well
 * @property {string} description        one or two sentences on what it is
 * @property {string[]} instructions      numbered how-to steps, read straight from data
 * @property {string[]} tips             practical form cues
 */

/** Controlled vocabularies. Filters are generated from these lists. */
export const EXERCISE_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

export const EXERCISE_EQUIPMENT = [
  'Bodyweight',
  'Dumbbell',
  'Barbell',
  'Machine',
  'Resistance Band',
]

export const EXERCISE_TYPES = ['Strength', 'Cardio', 'Mobility']

/**
 * Fill in a complete exercise record.
 *
 * Every field is defaulted, so a new entry can never be missing a property
 * that the library, the detail page or the workout builder relies on. The
 * defaults are the safest useful movement (bodyweight strength work), which
 * keeps a half-written record visible in development instead of crashing a
 * screen.
 *
 * @param {Partial<Exercise>} partial
 * @returns {Exercise}
 */
export function defineExercise(partial = {}) {
  return {
    id: '',
    name: '',
    category: 'Full Body',
    targetMuscles: [],
    secondaryMuscles: [],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 10,
    description: '',
    instructions: [],
    tips: [],
    ...partial,
  }
}

/* ---------- chest ---------- */

const CHEST_EXERCISES = [
  defineExercise({
    id: 'push-up',
    name: 'Push-Up',
    category: 'Chest',
    targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
    secondaryMuscles: ['Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'The bodyweight pressing staple. It builds real pushing strength, chest definition and upper-body control using nothing but the floor.',
    instructions: [
      'Start in a high plank with your hands under your shoulders and your feet slightly wider than your hips.',
      'Brace your core and squeeze your glutes so your body forms one straight line.',
      'Bend your elbows to about 45 degrees and lower your chest until it is a fist’s distance from the floor.',
      'Press the floor away to return to the start without letting your hips drop.',
    ],
    tips: [
      'Keep your head neutral with eyes down rather than forward.',
      'Lower with control instead of dropping onto the floor.',
      'End the set when your form breaks, not when your arms simply feel empty.',
    ],
  }),
  defineExercise({
    id: 'incline-push-up',
    name: 'Incline Push-Up',
    category: 'Chest',
    targetMuscles: ['Chest', 'Shoulders'],
    secondaryMuscles: ['Core', 'Triceps'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 8,
    description:
      'The easiest way to learn the push-up pattern: the higher your hands sit, the less load your chest has to carry.',
    instructions: [
      'Place your hands on a bench, step or countertop at roughly waist height.',
      'Walk your feet back until your body forms one line from head to heels.',
      'Lower your chest toward the surface, keeping your elbows tucked beside you.',
      'Push the surface away to straighten your arms, then step in before standing.',
    ],
    tips: [
      'Walk your feet further away to make the movement harder as you get stronger.',
      'Your body should stay rigid from shoulders to heels throughout.',
    ],
  }),
  defineExercise({
    id: 'wide-push-up',
    name: 'Wide Push-Up',
    category: 'Chest',
    targetMuscles: ['Chest', 'Shoulders'],
    secondaryMuscles: ['Triceps', 'Core'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'A wider hand position shifts the work towards the outer chest and triceps while demanding more shoulder stability.',
    instructions: [
      'Set your hands noticeably wider than shoulder-width before settling into the plank.',
      'Pull your ribs down so your lower back does not arch.',
      'Lower until your chest passes the level of your hands.',
      'Press back up with your feet planted and your hips square.',
    ],
    tips: [
      'Keep the extra width in your hands, not in a splayed foot position.',
      'Reduce the width if your shoulders start to feel the reps more than your chest.',
    ],
  }),
  defineExercise({
    id: 'machine-chest-press',
    name: 'Chest Press',
    category: 'Chest',
    targetMuscles: ['Chest', 'Triceps'],
    secondaryMuscles: ['Shoulders'],
    difficulty: 'Intermediate',
    equipment: 'Machine',
    type: 'Strength',
    durationMinutes: 12,
    description:
      'Guided horizontal pressing on a fixed machine — the safest way to add chest load when free weights feel unstable.',
    instructions: [
      'Set the seat so the handles sit level with the middle of your chest.',
      'Place both hands on the handles and plant your feet flat on the platform.',
      'Press the handles forward until your arms are straight but not locked out.',
      'Return under control until the pads hover in front of your chest.',
    ],
    tips: [
      'Your upper back should stay against the pad rather than lifting off it.',
      'Use a weight you can press smoothly for the whole set without shrugging.',
    ],
  }),
]

/* ---------- back ---------- */

const BACK_EXERCISES = [
  defineExercise({
    id: 'pull-up',
    name: 'Pull-Up',
    category: 'Back',
    targetMuscles: ['Lats', 'Upper Back', 'Biceps'],
    secondaryMuscles: ['Core', 'Forearms'],
    difficulty: 'Advanced',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 12,
    description:
      'The classic vertical pull and one of the most demanding bodyweight movements for back strength and grip.',
    instructions: [
      'Hang from a bar with an overhand grip slightly wider than your shoulders.',
      'Start the pull by drawing your shoulder blades down toward your hips.',
      'Bend your elbows and lift your chest until your chin clears the bar.',
      'Lower to a full hang under control instead of dropping.',
    ],
    tips: [
      'Use a controlled tempo — kipping shortens the range and hides weaknesses.',
      'Breathe in at the bottom and exhale as you pull up.',
    ],
  }),
  defineExercise({
    id: 'assisted-pull-up',
    name: 'Assisted Pull-Up',
    category: 'Back',
    targetMuscles: ['Lats', 'Upper Back', 'Biceps'],
    secondaryMuscles: ['Core'],
    difficulty: 'Beginner',
    equipment: 'Resistance Band',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'A resistance band takes weight off the bar so you can practise a clean full-range pull before you can do an unassisted one.',
    instructions: [
      'Loop a resistance band around the bar and step one knee into it, choosing a band that leaves you with a few reps in reserve.',
      'Take an overhand grip and hang with straight arms.',
      'Pull your chest towards the bar while keeping your shoulders down.',
      'Lower slowly, then step out of the band before the next rep.',
    ],
    tips: [
      'Swap to a lighter band once reps feel easy on every single pull.',
      'Keep the band under tension before you start so it cannot snap you upward.',
    ],
  }),
  defineExercise({
    id: 'dumbbell-bent-over-row',
    name: 'Bent-Over Row',
    category: 'Back',
    targetMuscles: ['Upper Back', 'Lats', 'Biceps'],
    secondaryMuscles: ['Core', 'Rear Delts'],
    difficulty: 'Intermediate',
    equipment: 'Dumbbell',
    type: 'Strength',
    durationMinutes: 12,
    description:
      'A hip-hinged horizontal pull that loads the middle of the back while the torso stays braced and quiet.',
    instructions: [
      'Hold one dumbbell in each hand and hinge at the hips until your torso is around 45 degrees.',
      'Let the dumbbells hang directly under your shoulders with a neutral grip.',
      'Pull both elbows past your ribs, squeezing your shoulder blades together.',
      'Lower the weights to a full stretch without letting your back round.',
    ],
    tips: [
      'Brace hard before each pull — the torso should not bounce as the weights travel.',
      'Bracing is doing the work; the dumbbells are only along for the ride.',
    ],
  }),
  defineExercise({
    id: 'superman',
    name: 'Superman',
    category: 'Back',
    targetMuscles: ['Spinal Erectors', 'Glutes', 'Rear Delts'],
    secondaryMuscles: ['Core', 'Hamstrings'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Mobility',
    durationMinutes: 8,
    description:
      'A face-down hold that strengthens the spinal erectors and opens the front of the shoulders and hips.',
    instructions: [
      'Lie face down with your arms extended in front of you and your forehead hovering.',
      'Lift your arms, chest and legs a few inches off the floor at the same time.',
      'Reach long rather than high, keeping your neck long.',
      'Hold for a slow count, then lower everything under control.',
    ],
    tips: [
      'Lift until you feel the back working, not until you feel the floor leaving your toes.',
      'Squeeze your glutes at the top to stop the lower back from taking over.',
    ],
  }),
  defineExercise({
    id: 'thoracic-rotation',
    name: 'Thoracic Rotation',
    category: 'Back',
    targetMuscles: ['Mid Back', 'Thoracic Spine'],
    secondaryMuscles: ['Shoulders', 'Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Mobility',
    durationMinutes: 8,
    description:
      'An open-book style rotation that keeps the mid-back mobile — the base every pressing and pulling position rests on.',
    instructions: [
      'Lie on your side with your knees bent to 90 degrees and both arms straight out in front.',
      'Keep your hips and knees stacked and completely still.',
      'Rotate your top arm and chest towards the ceiling, following your hand with your eyes.',
      'Lower under control and repeat on the other side.',
    ],
    tips: [
      'If you feel this in your lower back, your knees need to travel forward.',
      'Move slowly — this is a range drill, not a stretch to force.',
    ],
  }),
]

/* ---------- shoulders ---------- */

const SHOULDER_EXERCISES = [
  defineExercise({
    id: 'pike-push-up',
    name: 'Pike Push-Up',
    category: 'Shoulders',
    targetMuscles: ['Shoulders', 'Triceps'],
    secondaryMuscles: ['Core', 'Chest'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'A shoulder press performed on your hands, with your hips high and your head travelling towards the floor.',
    instructions: [
      'Walk your feet in towards your hands and lift your hips into an inverted V.',
      'Set your hands just outside your shoulders and spread your fingers.',
      'Bend your elbows to lower the crown of your head between your hands.',
      'Press back to the start while keeping your hips elevated.',
    ],
    tips: [
      'Lowering your hips too early turns this into a regular push-up.',
      'Elevate your heels on a chair to reduce the load and practise the shape first.',
    ],
  }),
  defineExercise({
    id: 'barbell-shoulder-press',
    name: 'Shoulder Press',
    category: 'Shoulders',
    targetMuscles: ['Shoulders', 'Triceps'],
    secondaryMuscles: ['Core', 'Upper Back'],
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    type: 'Strength',
    durationMinutes: 12,
    description:
      'Seated or standing overhead pressing — a direct measure of shoulder strength and overhead stability.',
    instructions: [
      'Hold the bar at shoulder height with an overhand grip just outside your shoulders.',
      'Sit or stand tall, brace your ribs down and squeeze your glutes.',
      'Press the bar up and slightly back until your arms are straight.',
      'Lower the bar back to shoulder height under control.',
    ],
    tips: [
      'Let your ears disappear behind the bar at the top for a cleaner lockout.',
      'Stop the set if your lower back arches to buy extra range.',
    ],
  }),
  defineExercise({
    id: 'dumbbell-lateral-raise',
    name: 'Lateral Raise',
    category: 'Shoulders',
    targetMuscles: ['Side Delts'],
    secondaryMuscles: ['Traps', 'Upper Back'],
    difficulty: 'Beginner',
    equipment: 'Dumbbell',
    type: 'Strength',
    durationMinutes: 8,
    description:
      'A small isolation movement for the side deltoids — the muscles responsible for shoulder width.',
    instructions: [
      'Stand tall with a light dumbbell in each hand resting at your sides.',
      'Lean forward a few degrees without letting your upper back round.',
      'Raise both arms out to the side until they reach shoulder height.',
      'Lower slowly and all the way — the descent is where the work happens.',
    ],
    tips: [
      'Light weights and strict form beat heavy swinging every time.',
      'Stop the raise at shoulder height so the traps take over too early.',
    ],
  }),
  defineExercise({
    id: 'dumbbell-front-raise',
    name: 'Front Raise',
    category: 'Shoulders',
    targetMuscles: ['Front Delts'],
    secondaryMuscles: ['Core', 'Chest'],
    difficulty: 'Beginner',
    equipment: 'Dumbbell',
    type: 'Strength',
    durationMinutes: 8,
    description:
      'Raises a weight in front of the body to train the anterior deltoids and an upright posture.',
    instructions: [
      'Stand with a dumbbell in each hand resting in front of your thighs.',
      'Keep a soft bend in your elbows and your torso upright.',
      'Raise the weights to shoulder height in front of you.',
      'Lower under control without letting the weight swing forward.',
    ],
    tips: [
      'Alternate arms if holding both feels like it is taking over your lower back.',
      'Squeeze your glutes to stop the movement turning into a swing.',
    ],
  }),
]

/* ---------- arms ---------- */

const ARM_EXERCISES = [
  defineExercise({
    id: 'dumbbell-bicep-curl',
    name: 'Bicep Curl',
    category: 'Arms',
    targetMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    difficulty: 'Beginner',
    equipment: 'Dumbbell',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'The classic elbow hinge for the biceps, and one of the most direct ways to add visible arm size.',
    instructions: [
      'Stand tall with a dumbbell in each hand and your palms facing forward.',
      'Pin your upper arms beside your ribs.',
      'Curl both dumbbells up towards your shoulders without swinging from your back.',
      'Lower slowly until your arms are straight again.',
    ],
    tips: [
      'Keep your elbows still — a curl is an elbow movement, not a shoulder one.',
      'Squeeze at the top and resist on the way down to keep the tension on.',
    ],
  }),
  defineExercise({
    id: 'hammer-curl',
    name: 'Hammer Curl',
    category: 'Arms',
    targetMuscles: ['Biceps', 'Brachialis'],
    secondaryMuscles: ['Forearms'],
    difficulty: 'Beginner',
    equipment: 'Dumbbell',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'The same elbow hinge with a neutral grip, shifting the work onto the brachialis and building arm thickness.',
    instructions: [
      'Stand with a dumbbell in each hand and your palms facing your thighs.',
      'Keep your elbows close to your body.',
      'Curl the weights up while keeping your palms facing inward the whole time.',
      'Lower to a full extension, again slowly.',
    ],
    tips: [
      'Thumb-up grip is the cue to remember: fists like a hammer.',
      'Pausing for a beat at the top makes each rep noticeably harder.',
    ],
  }),
  defineExercise({
    id: 'tricep-dip',
    name: 'Tricep Dip',
    category: 'Arms',
    targetMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Shoulders'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'Bodyweight triceps work from a bench or dip bar, using only the arms to support your body.',
    instructions: [
      'Sit on the edge of a bench and place your hands beside your hips.',
      'Walk your feet forward and lean your shoulders slightly in front of your hands.',
      'Bend your elbows straight back and lower until you feel a stretch in the triceps.',
      'Press back up until your elbows are straight but not locked.',
    ],
    tips: [
      'Keep your hips close to the bench to reduce how much load lands on your shoulders.',
      'Bend your knees to make the movement easier when you are starting out.',
    ],
  }),
  defineExercise({
    id: 'dumbbell-tricep-extension',
    name: 'Tricep Extension',
    category: 'Arms',
    targetMuscles: ['Triceps'],
    secondaryMuscles: [],
    difficulty: 'Beginner',
    equipment: 'Dumbbell',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'An overhead elbow extension that takes the triceps through a long, satisfying stretch at the bottom.',
    instructions: [
      'Stand or sit and hold one dumbbell with both hands above your head.',
      'Keep your elbows pointing forward and close to your head.',
      'Lower the dumbbell behind your head until your elbows reach about 90 degrees.',
      'Extend back up to the start and squeeze the triceps at the top.',
    ],
    tips: [
      'Only your forearms should move — the elbows stay anchored in place.',
      'Use a lighter weight than you think you need to keep the elbows narrow.',
    ],
  }),
]

/* ---------- legs ---------- */

const LEG_EXERCISES = [
  defineExercise({
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    category: 'Legs',
    targetMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'The foundational lower-body pattern, and the best place to learn to brace and descend with control.',
    instructions: [
      'Stand with your feet shoulder-width apart and your toes turned out slightly.',
      'Send your hips back and bend your knees until your thighs are near parallel.',
      'Keep your chest tall and your whole foot in contact with the floor.',
      'Drive through your feet to stand up and squeeze your glutes at the top.',
    ],
    tips: [
      'Sit down between your heels rather than behind them.',
      'Put your hands on your hips if they drift forwards — that is your cue to brace.',
    ],
  }),
  defineExercise({
    id: 'dumbbell-lunge',
    name: 'Lunges',
    category: 'Legs',
    targetMuscles: ['Quads', 'Glutes', 'Hamstrings'],
    secondaryMuscles: ['Core'],
    difficulty: 'Intermediate',
    equipment: 'Dumbbell',
    type: 'Strength',
    durationMinutes: 12,
    description:
      'A single-leg split squat that builds leg strength and quietly reveals side-to-side imbalances.',
    instructions: [
      'Hold a dumbbell in each hand at your sides and step forward with one foot.',
      'Lower until both knees are bent to about 90 degrees with the back knee close to the floor.',
      'Keep your weight over the front heel and your torso upright.',
      'Push through the front foot to return to standing, then repeat on the other side.',
    ],
    tips: [
      'Use a shorter step if your back knee is being pushed forwards by the front heel.',
      'Hold the dumbbells at your sides rather than your shoulders to keep the core working.',
    ],
  }),
  defineExercise({
    id: 'reverse-lunge',
    name: 'Reverse Lunges',
    category: 'Legs',
    targetMuscles: ['Glutes', 'Hamstrings', 'Quads'],
    secondaryMuscles: ['Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'A friendlier lunge variation: stepping backwards keeps the front knee easier to track and is kinder to most knees.',
    instructions: [
      'Stand tall with your feet together and your hands on your hips or at your chest.',
      'Step one foot straight back and lower until the back knee hovers just above the floor.',
      'Keep most of your weight on the front leg with the front shin vertical.',
      'Drive through the front heel to step back to the start.',
    ],
    tips: [
      'This version is easier on the knees than a forward lunge, so start here.',
      'Add a pause at the bottom to make it harder without more load.',
    ],
  }),
  defineExercise({
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'Legs',
    targetMuscles: ['Glutes', 'Hamstrings'],
    secondaryMuscles: ['Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 8,
    description:
      'A floor-based hip extension that wakes up the glutes and offsets a long day of sitting.',
    instructions: [
      'Lie on your back with your knees bent and your heels close to your hips.',
      'Press your lower back gently into the floor.',
      'Drive through your heels and lift your hips until your body forms one straight line.',
      'Squeeze your glutes at the top, then lower one vertebra at a time.',
    ],
    tips: [
      'Push through your heels, not your toes, to keep the load on the glutes.',
      'Add a pause of one second at the top to turn this into a real strength set.',
    ],
  }),
  defineExercise({
    id: 'calf-raise',
    name: 'Calf Raise',
    category: 'Legs',
    targetMuscles: ['Calves'],
    secondaryMuscles: [],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 8,
    description:
      'Simple calf work for ankle strength — the quiet foundation under running, jumping and balance.',
    instructions: [
      'Stand tall with your feet hip-width apart and your weight over the balls of your feet.',
      'Press up onto your toes as high as you can.',
      'Pause for a beat at the top with your knees straight.',
      'Lower your heels slowly until they touch the floor.',
    ],
    tips: [
      'Full-range reps beat fast partial ones every time.',
      'Stand with your back toes on a step for a harder version once this feels easy.',
    ],
  }),
  defineExercise({
    id: 'worlds-greatest-stretch',
    name: 'World’s Greatest Stretch',
    category: 'Legs',
    targetMuscles: ['Hips', 'Glutes', 'Thoracic Spine'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Mobility',
    durationMinutes: 8,
    description:
      'A standing flow that opens the hips, hamstrings and mid-back in one short sequence — ideal before leg day.',
    instructions: [
      'Step your right foot forward and drop the back knee towards the floor.',
      'Place your right hand on the floor and rotate your left arm towards the ceiling.',
      'Sink your hips forward to feel the front of the right thigh open up.',
      'Place the back hand down, step forward and repeat on the other side.',
    ],
    tips: [
      'Move slowly and breathe out as you sink the hips forward.',
      'Hold each side for around 20 seconds if you have time before training.',
    ],
  }),
  defineExercise({
    id: 'kneeling-hip-flexor-stretch',
    name: 'Kneeling Hip Flexor Stretch',
    category: 'Legs',
    targetMuscles: ['Hip Flexors', 'Quads'],
    secondaryMuscles: ['Lower Back', 'Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Mobility',
    durationMinutes: 6,
    description:
      'A kneeling counter-stretch that releases tight hips after long sitting or a run.',
    instructions: [
      'Kneel on one knee with the other foot flat in front of you and both knees near 90 degrees.',
      'Tuck your pelvis under by squeezing the glute on the kneeling side.',
      'Shift your hips gently forwards while keeping your torso upright.',
      'Hold for 20 to 30 seconds, then switch sides.',
    ],
    tips: [
      'The glute squeeze matters more than leaning forwards.',
      'Keep your ribs stacked over your pelvis so the stretch stays in the hip, not the back.',
    ],
  }),
]

/* ---------- core ---------- */

const CORE_EXERCISES = [
  defineExercise({
    id: 'plank',
    name: 'Plank',
    category: 'Core',
    targetMuscles: ['Core', 'Abdominals'],
    secondaryMuscles: ['Shoulders', 'Glutes'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 8,
    description:
      'An isometric hold that teaches the core to resist movement rather than create it — the base for every heavy lift.',
    instructions: [
      'Set your forearms on the floor directly under your shoulders.',
      'Extend your legs behind you and rest on the balls of your feet.',
      'Brace your midsection and squeeze your glutes so your body forms one line.',
      'Breathe steadily and hold the position without letting your hips rise or sag.',
    ],
    tips: [
      'If it feels like your lower back, shorten the hold before you drop the hips.',
      'Never hold your breath — keep breathing through the whole set.',
    ],
  }),
  defineExercise({
    id: 'mountain-climber',
    name: 'Mountain Climber',
    category: 'Core',
    targetMuscles: ['Core', 'Hip Flexors'],
    secondaryMuscles: ['Shoulders'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    type: 'Cardio',
    durationMinutes: 8,
    description:
      'A dynamic plank that alternates driving your knees forwards while your shoulders stay stacked over your hands.',
    instructions: [
      'Start in a high plank with your hands under your shoulders and your body in one line.',
      'Drive one knee towards your chest without letting your hips rise.',
      'Switch legs quickly, keeping the shoulders stacked over the hands.',
      'Hold a steady rhythm and keep breathing continuously.',
    ],
    tips: [
      'Slow down before your form breaks — a clean slow set beats a fast sloppy one.',
      'This doubles as conditioning, so keep the pace honest.',
    ],
  }),
  defineExercise({
    id: 'bicycle-crunch',
    name: 'Bicycle Crunch',
    category: 'Core',
    targetMuscles: ['Obliques', 'Abdominals'],
    secondaryMuscles: ['Hip Flexors'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 8,
    description:
      'A rotation plus a reach that trains the obliques while keeping constant tension across the midline.',
    instructions: [
      'Lie on your back with your hands beside your ears and your knees lifted off the floor.',
      'Rotate your upper body to bring one elbow towards the opposite knee.',
      'Extend the other leg long without letting the heel touch the floor.',
      'Switch sides in a smooth, controlled pedalling rhythm.',
    ],
    tips: [
      'Keep your lower back flat — that is what keeps the tension on the obliques.',
      'Smaller range with a long exhale beats fast reps here.',
    ],
  }),
  defineExercise({
    id: 'leg-raise',
    name: 'Leg Raise',
    category: 'Core',
    targetMuscles: ['Lower Abs', 'Hip Flexors'],
    secondaryMuscles: ['Core'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    type: 'Strength',
    durationMinutes: 10,
    description:
      'Lifts the legs off the floor to load the lower abdominals without any momentum at all.',
    instructions: [
      'Lie on your back with your hands beside your hips and your legs straight.',
      'Press your lower back gently into the floor.',
      'Lift both legs to about 90 degrees while keeping them together and controlled.',
      'Lower them back down without letting your heels rest on the floor.',
    ],
    tips: [
      'Bend your knees if your lower back starts to lift off the floor.',
      'The hard part is the descent — take two to three seconds over it.',
    ],
  }),
  defineExercise({
    id: 'cat-cow',
    name: 'Cat-Cow',
    category: 'Core',
    targetMuscles: ['Spine', 'Core'],
    secondaryMuscles: ['Shoulders', 'Hips'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Mobility',
    durationMinutes: 6,
    description:
      'A slow spinal wave that takes the back from arched to rounded and wakes up the muscles that hold you upright.',
    instructions: [
      'Start on hands and knees with your wrists under your shoulders.',
      'Inhale, drop your belly and lift your chest and hips into a gentle arch.',
      'Exhale, round your spine, tuck your chin and draw your navel under you.',
      'Alternate with your breath for eight to ten rounds.',
    ],
    tips: [
      'Move with the breath rather than counting reps.',
      'Keep the movement smooth — this is a warm-up, not a stretch to force.',
    ],
  }),
]

/* ---------- full body ---------- */

const FULL_BODY_EXERCISES = [
  defineExercise({
    id: 'burpee',
    name: 'Burpee',
    category: 'Full Body',
    targetMuscles: ['Chest', 'Quads', 'Shoulders'],
    secondaryMuscles: ['Core'],
    difficulty: 'Advanced',
    equipment: 'Bodyweight',
    type: 'Cardio',
    durationMinutes: 10,
    description:
      'The full-body conditioning classic that takes you from standing to the floor and back to a jump in one movement.',
    instructions: [
      'Stand with your feet shoulder-width apart and your arms by your sides.',
      'Squat down, place your hands on the floor and jump your feet back into a plank.',
      'Jump your feet back in beside your hands and stand up.',
      'Finish with a jump and an overhead reach, then reset your feet under your hips.',
    ],
    tips: [
      'Land softly and keep your knees tracking over your toes.',
      'Step back instead of jumping if the impact is not right for you yet.',
    ],
  }),
  defineExercise({
    id: 'jump-squat',
    name: 'Jump Squat',
    category: 'Full Body',
    targetMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Calves', 'Core'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    type: 'Cardio',
    durationMinutes: 8,
    description:
      'An explosive lower-body jump that builds real power alongside leg endurance.',
    instructions: [
      'Stand with your feet shoulder-width apart and your hands clasped at your chest.',
      'Sit back into a squat, keeping your heels in contact with the floor.',
      'Explosively drive through your feet and jump as high as you can.',
      'Land softly on the balls of your feet and absorb the landing with bent knees.',
    ],
    tips: [
      'Start with a small jump — height is a by-product of good mechanics, not the goal.',
      'Do not let your knees collapse inwards on the landing.',
    ],
  }),
  defineExercise({
    id: 'bear-crawl',
    name: 'Bear Crawl',
    category: 'Full Body',
    targetMuscles: ['Core', 'Shoulders'],
    secondaryMuscles: ['Hip Flexors'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    type: 'Mobility',
    durationMinutes: 8,
    description:
      'A crawling pattern that keeps the hips low, the core braced and the shoulders packed — great for warm-ups.',
    instructions: [
      'Start on hands and knees with your hands directly under your shoulders.',
      'Tuck your knees slightly off the floor so only your hands and toes make contact.',
      'Move one hand and the opposite knee forward at a time, keeping the hips low.',
      'Crawl forwards and back for the distance while breathing steadily.',
    ],
    tips: [
      'The hips staying low is the whole exercise — raise them and it becomes a game of tag.',
      'Take short, quiet steps rather than fast ones.',
    ],
  }),
  defineExercise({
    id: 'dumbbell-thruster',
    name: 'Thruster',
    category: 'Full Body',
    targetMuscles: ['Quads', 'Shoulders'],
    secondaryMuscles: ['Core', 'Glutes'],
    difficulty: 'Advanced',
    equipment: 'Dumbbell',
    type: 'Strength',
    durationMinutes: 12,
    description:
      'One fluid movement that finishes a front squat and then immediately drives the weight overhead.',
    instructions: [
      'Hold one dumbbell vertically at your shoulders with both hands.',
      'Squat down until your thighs are below parallel, keeping the weight supported on your shoulders.',
      'Stand up and drive the dumbbell overhead, finishing with straight arms.',
      'Lower the dumbbell back to your shoulders and squat straight into the next rep.',
    ],
    tips: [
      'The overhead finish comes from the leg drive, not a shoulder press.',
      'Choose one dumbbell you can squat and press comfortably — not your heaviest.',
    ],
  }),
]

/* ---------- cardio ---------- */

const CARDIO_EXERCISES = [
  defineExercise({
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'Cardio',
    targetMuscles: ['Cardiovascular System'],
    secondaryMuscles: ['Calves', 'Shoulders'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Cardio',
    durationMinutes: 6,
    description:
      'A simple whole-body rhythm that raises your heart rate and warms up the shoulders, hips and ankles.',
    instructions: [
      'Stand tall with your feet together and your arms resting by your sides.',
      'Jump your feet out wide as you sweep your arms overhead.',
      'Jump your feet back together as your arms return to your sides.',
      'Keep a light, bouncy rhythm and land quietly on the balls of your feet.',
    ],
    tips: [
      'Step side to side instead of jumping if your knees are unhappy with the impact.',
      'Count in seconds of work rather than reps so the pacing stays honest.',
    ],
  }),
  defineExercise({
    id: 'high-knees',
    name: 'High Knees',
    category: 'Cardio',
    targetMuscles: ['Cardiovascular System', 'Hip Flexors'],
    secondaryMuscles: ['Calves', 'Core'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    type: 'Cardio',
    durationMinutes: 5,
    description:
      'Running on the spot with intent — fast, upright and driven by the arms.',
    instructions: [
      'Stand tall with your feet hip-width apart and your arms bent at the elbows.',
      'Run in place, driving each knee up towards hip height.',
      'Keep your torso upright and pump your arms in rhythm with your legs.',
      'Stay on the balls of your feet and keep the pace quick and even.',
    ],
    tips: [
      'Tall posture matters more than speed here — leaning forwards cheats the movement.',
      'Short bursts work better than one long effort, so pace the intervals.',
    ],
  }),
  defineExercise({
    id: 'running',
    name: 'Running',
    category: 'Cardio',
    targetMuscles: ['Cardiovascular System', 'Calves'],
    secondaryMuscles: ['Hip Flexors', 'Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    type: 'Cardio',
    durationMinutes: 30,
    description:
      'Continuous aerobic work that raises your aerobic base — and the ceiling on everything else you do.',
    instructions: [
      'Start with five minutes of brisk walking to warm up before your first run.',
      'Build to a pace where you can still speak in short sentences.',
      'Keep your cadence light and let each foot land underneath you rather than out in front.',
      'Cool down with five to ten minutes of walking when you finish.',
    ],
    tips: [
      'Progress by adding a minute a week rather than distance all at once.',
      'Slower and steadier is what builds endurance; sprints come later.',
    ],
  }),
  defineExercise({
    id: 'cycling',
    name: 'Cycling',
    category: 'Cardio',
    targetMuscles: ['Cardiovascular System', 'Quads'],
    secondaryMuscles: ['Glutes', 'Calves'],
    difficulty: 'Beginner',
    equipment: 'Machine',
    type: 'Cardio',
    durationMinutes: 30,
    description:
      'Low-impact cardio that builds leg endurance while being kind to the joints.',
    instructions: [
      'Set the seat so your knee stays slightly bent at the bottom of the pedal stroke.',
      'Start at a light resistance and settle into a steady cadence.',
      'Add resistance gradually until your breathing is controlled but hard.',
      'Keep your upper body relaxed and your grip light on the handlebars.',
    ],
    tips: [
      'Cadence matters more than a heavy gear — spin rather than push.',
      'Set up the console so you can see time and effort without looking down for long.',
    ],
  }),
]

/**
 * Freeze a value and everything nested inside it.
 *
 * A shallow `Object.freeze` would leave `instructions` and `tips` mutable, and
 * a filter that accidentally pushed onto one of those arrays would corrupt the
 * catalog for the whole session.
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
 * The full exercise library, grouped in category order.
 *
 * The array and every record are frozen so filtering, sorting and future
 * features can never mutate the source catalog.
 *
 * @type {readonly Exercise[]}
 */
export const EXERCISES = deepFreeze([
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...SHOULDER_EXERCISES,
  ...ARM_EXERCISES,
  ...LEG_EXERCISES,
  ...CORE_EXERCISES,
  ...FULL_BODY_EXERCISES,
  ...CARDIO_EXERCISES,
])

/** Every muscle name used anywhere in the library, deduplicated and sorted. */
export const EXERCISE_MUSCLES = Object.freeze(
  [
    ...new Set(
      EXERCISES.flatMap((exercise) => [...exercise.targetMuscles, ...exercise.secondaryMuscles]),
    ),
  ].sort(),
)

/** Total number of exercises in the library. */
export const EXERCISE_COUNT = EXERCISES.length

/**
 * Every category is guaranteed to appear in the library.
 *
 * The exercise library is code, not user data, so an unused category means
 * the catalog needs more content rather than a UI fix.
 */
export const CATEGORIES_WITHOUT_EXERCISES = Object.freeze(
  EXERCISE_CATEGORY_NAMES.filter(
    (name) => !EXERCISES.some((exercise) => exercise.category === name),
  ),
)