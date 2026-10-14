# BeFit

BeFit is a modern **workout planner + fitness tracker** that runs entirely in the browser.
Plan workouts, discover exercises, log completed sessions, monitor streaks and progress,
track food and macros — all persisted locally with `localStorage`.

## Features

- Landing page, local sign-up / sign-in / sign-out, and guided onboarding
- Dashboard with streak, weekly activity, today's summary, quick workouts and AI insight
- Exercise library with search, category / difficulty / equipment / type filters and details
- Workout library (15 templates), custom workout builder, and a guided session runner
- Workout session with hold timer, rest countdown, pause/resume, refresh recovery and completion
- Completed workout history, streaks and progress analytics (7 / 30 / 90 day, all time)
- Diet tracker: food search, custom foods, meal logging, serving multipliers and macro targets
- AI Fitness Tracker: daily insight, workout recommendation, nutrition insight and progress review
- Settings: profile, goal, workout preferences, appearance, reduced motion, AI preferences
- Data export, import, clear-fitness-data and delete-all-data (all local to this browser)

## Stack

- Vite
- React
- React Router
- JavaScript (no TypeScript)
- CSS design system
- `localStorage` for persistent app data
- Vercel Serverless Function proxying GroqCloud for AI

No database and no external auth. Everything the app stores lives in the
browser. The only server-side code is a single Vercel serverless function that
proxies AI requests to GroqCloud so the API key never reaches the browser.

## Local authentication

Registration, sign-in and sign-out are implemented entirely in the browser
against `localStorage`. There is no server to talk to and no email to send.

| Key | Contents |
| --- | --- |
| `befit_users` | Array of local accounts (`id`, `name`, `email`, `password`, `createdAt`, fitness fields) |
| `befit_session` | The active session: `{ userId, loggedInAt }` |
| `befit_profile` | The signed-in athlete's profile: `fitnessGoal`, `experienceLevel`, `preferredWorkoutDuration`, `updatedAt` |

- `/register` validates the form, rejects duplicate emails and writes the
  account, a profile and a session.
- `/login` checks the stored credentials and reports
  "Email or password is incorrect." without revealing which part was wrong.
- `/onboarding` collects fitness goal, experience level and preferred workout
  duration, then saves them to `befit_profile`.
- `/dashboard` and `/onboarding` are wrapped in `ProtectedRoute`; signed-out
  visitors are redirected to `/login` and returned to their original target
  after signing in. A signed-in visitor opening `/login` or `/register` is
  sent to their dashboard.
- Logging out removes only `befit_session` — the account and its data stay put.

**This is not secure authentication.** Passwords are stored as plain text,
readable by anyone with access to the browser, and the route guard is
client-side only. It keeps honest visitors on the right screen; it is not a
security boundary. A real deployment needs a server with hashed credentials
and managed sessions.

## Exercise library

The movement catalog is application content, so it ships in code rather than
`localStorage` — it must work for a signed-out visitor before any data exists.

| Module | Contents |
| --- | --- |
| `src/data/exerciseCategories.js` | The eight body categories: `id`, `name`, `description`, visual `icon`, `accent` |
| `src/data/exercises.js` | The exercise records plus the controlled vocabularies (`EXERCISE_DIFFICULTIES`, `EXERCISE_EQUIPMENT`, `EXERCISE_TYPES`) and the `defineExercise` factory |
| `src/utils/exercises.js` | Lookups, data-quality validation and the query helpers used by the library page |

Every record has the same shape, so the library grid, the detail page and the
future workout builder can all read one structure:

```js
{
  id, name, category,
  targetMuscles, secondaryMuscles,
  difficulty, equipment, type,
  durationMinutes, description,
  instructions, tips,
}
```

- `/exercises` browses the catalog with category tabs, search across name,
  muscle, category, equipment and type, and combined filters for difficulty,
  equipment and type.
- `/exercises/:exerciseId` renders instructions, form tips and related
  exercises, and falls back to a not-found state for an unknown id.
- Category names live only in `exerciseCategories.js`; `src/data/models.js`
  re-exports that list so nothing keeps a second copy.
- The exported catalog is deeply frozen, so filtering and sorting can never
  mutate the source records.

### Workout selection (foundation)

Browsing an exercise can add it to a temporary workout selection that the future
workout builder will read.

| Key | Contents |
| --- | --- |
| `befit_workout_builder` | `[{ exerciseId, addedAt }]` — scoped per account as `befit_u_<userId>_workout_builder` once someone is signed in |

- Adding is idempotent, the order added is preserved, and a corrupt payload
  degrades to an empty selection instead of breaking the library.
- Selecting an exercise is **not** performing it: no sets, reps, calories,
  streak or completed-workout data is written.
- Pure rules live in `src/utils/workoutSelection.js`; `useWorkoutSelection`
  adds the storage and toast behaviour on top.

### Workout library data

`src/data/workouts.js` holds the ready-made plans, and
`src/data/workoutCategories.js` owns the workout categories and vocabularies
(category names, goals, equipment, duration buckets, difficulty).

A workout never duplicates exercise data. Each entry stores only the plan and
references an exercise by id, so renaming a movement updates every workout at
once:

```js
{
  id: 'full-body-beginner',
  name, description, category, goal, difficulty,
  durationMinutes, equipment, targetMuscles,
  exercises: [{ exerciseId: 'push-up', sets: 3, reps: 10, restSeconds: 45 }],
}
```

- `durationSeconds` replaces `reps` for timed holds (planks, stretches), so a
  hold is never rendered as "3 × 1 reps".
- `src/utils/workouts.js` owns search, the combined filters, duration buckets,
  exercise resolution and the volume/estimate labels.
- `src/utils/customWorkouts.js` owns the custom-workout shape: normalizing
  stored records, the create/update/delete list helpers and the builder's
  validation messages.
- Workout difficulty reuses `EXERCISE_DIFFICULTIES`, so a plan can never be
  harder than the movements inside it.

## Workouts

Four surfaces sit on the same workout data: the library, the detail page, the
builder and the preparation stage.

| Route | Who can reach it | What it does |
| --- | --- | --- |
| `/workouts` | Everyone | Browses the 15 templates with search, category tabs and combined filters, then lists saved workouts in **My Workouts** |
| `/workouts/:workoutId` | Everyone | Shows the resolved plan with a link per exercise; saved workouts add edit and delete |
| `/workouts/create` | Signed in | Builds a plan from the exercise catalog |
| `/workouts/edit/:workoutId` | Signed in | Edits a saved workout in place |
| `/workouts/:workoutId/start` | Everyone | Preparation stage: the plan in order, then **Start** launches the guided session |
| `/workouts/:workoutId/session` | Signed in | The guided runner: sets, reps or hold timer, rest countdown, pause/resume and previous/next |
| `/workouts/:workoutId/complete` | Signed in | Completion screen shown after a finished session |
| `/completed` | Signed in | Completed workout history, grouped and summarised |

- A workout is looked up with `useWorkout`, which answers for a template *or* a
  saved workout, so both reach the same detail and preparation pages.
- The runner is driven by `useWorkoutSession` (rules in
  `src/utils/workoutSession.js`): one 1-second heartbeat, a per-set hold timer
  and a between-set rest timer. Pausing freezes the workout clock; a refresh
  offers to resume from the stored snapshot.
- Leaving with **End workout** clears the in-progress snapshot and records
  nothing. Only **Finish workout** on the last exercise writes a completed
  record, so an abandoned session never counts as a completed workout.
- Completed records are stored in the account-scoped `befit_completed_workouts`
  key and feed the dashboard streak, recent activity and the progress analytics.

### Building a workout

- The plan rows set sets, reps or a timed hold, rest, position and removal, and
  the picker searches the frozen catalog by name, muscle and equipment.
- Duration, equipment and target muscles are **derived** from the exercises
  (`deriveWorkoutPlan`) and stored that way, so a saved workout can never
  disagree with the movements it holds.
- A pending exercise selection seeds an empty plan when the builder opens, and
  is consumed once the workout is saved, which is what the selection bar's
  "Continue in builder" hands over.
- Validation refuses an unnamed workout or an empty plan, naming the field.

### Saved workouts

| Key | Contents |
| --- | --- |
| `befit_workouts` | `[{ id, type: 'custom', name, description, category, goal, difficulty, durationMinutes, equipment, targetMuscles, exercises, createdAt, updatedAt }]` — scoped per account as `befit_u_<userId>_workouts` |

- `useCustomWorkouts` is the only writer. Every read goes through
  `normalizeCustomWorkouts`, so hand-edited storage degrades into something
  renderable instead of breaking the library.
- Editing keeps the id and `createdAt` and moves `updatedAt` forward, so an
  edited workout never looks new.
- Deleting asks for confirmation first, and only ever touches the signed-in
  athlete's own list.
- Two accounts on one device keep separate lists; the built-in templates are
  never written to storage at all.

## Scripts

```bash
npm install     # install dependencies
npm run dev     # start the dev server
npm run build   # production build
npm run lint    # oxlint
npm test        # unit tests (Node test runner, no extra dependency)
npm run preview # preview the production build
```

## Tests

Pure logic is covered by `node:test`, so the suite runs with no test-framework
dependency:

```bash
npm test
```

| File | Covers |
| --- | --- |
| `test/validation.test.js` | Email/password/name rules, register + login form errors, first-invalid-field focus order |
| `test/authService.test.js` | Registration, duplicate emails, sign-in/out, session shape, profile writes, and recovery from corrupt `localStorage` |
| `test/storage.test.js` | JSON round-trips, corrupt-value fallbacks, `befit_` prefix isolation, no-storage degradation |
| `test/exercises.test.js` | Catalog integrity (unique ids/names, valid categories and vocabularies, complete records) plus search, combined filtering and related-exercise ranking |
| `test/workoutSelection.test.js` | Add / remove / toggle / clear rules, corrupt-payload recovery, selection storage key and per-account scoping |
| `test/workouts.test.js` | Workout template integrity (unique ids, real exercise ids, vocabularies, plan values, duration sanity), workout search/filters, derived plan values, custom-workout normalization, builder validation, and the saved-workout persistence flow (account scoping, edit in place, delete, corrupt storage) |
| `test/aiFitnessApi.test.js` | The AI proxy handler: method/action validation, the missing-key configuration error, success normalisation, prose fallback, rate-limit and provider/network error mapping, context sanitising, and prompt building |
| `test/aiService.test.js` | The browser AI service: action allow-list, request shape, result normalisation, and safe error mapping |
| `test/aiSummary.test.js` | The sanitized payload sent to the AI: four fixed sections, profile-only safe fields, workout/nutrition/progress summaries, credential-free output, and the render-only status snapshot |
| `test/aiHistory.test.js` | Saved AI insight history: forgiving parsing, prepend/dedupe/cap rules, latest lookup, timestamp formatting, and matching AI-mentioned exercises to the BeFit library |

A localStorage stub in `test/helpers/browser.js` stands in for the browser, so
the real service and utility code is exercised rather than a reimplementation.
Because the app's own imports omit file extensions, `test/helpers/extension-resolver.mjs`
maps them to real files for the Node resolver instead of touching app source.

## Environment

### AI proxy (GroqCloud)

The AI Fitness Coach gets its answers from GroqCloud, but the browser never
talks to Groq and never sees the API key. The flow is:

```
React UI  →  POST /api/ai/fitness  →  serverless function  →  GROQ_API_KEY  →  GroqCloud  →  structured result  →  UI
```

- `api/ai/fitness.js` is the only code that reads the key. It validates the
  request, sanitises the context, calls Groq, and returns a normalised JSON
  result with a safe status code.
- `src/services/aiService.js` is the only browser caller. It POSTs to the
  endpoint and maps failures to human-readable messages.
- The key is read from `process.env.GROQ_API_KEY`. It must **never** be
  prefixed with `VITE_`, imported into React, written to `localStorage`, logged,
  or committed.

The browser only ever sends a small, sanitized fitness summary built by
`src/utils/aiSummary.js` — workout, nutrition and progress numbers plus the
goal, never an email, password, session token or raw record dump. Each result is
saved to the user-scoped `befit_ai_insights` key (the newest 10), which powers
the **AI Fitness Insight** card on the dashboard and the "Recent AI insights"
list on the AI page. Generating an insight is always an explicit action; loading
the dashboard never spends an API call.

| Variable | Where | Purpose |
| --- | --- | --- |
| `GROQ_API_KEY` | Server env (Vercel project settings, or `.env` locally) | The Groq API key used by `api/ai/fitness.js` |
| `GROQ_MODEL` | Server env (optional) | Overrides the default model (`openai/gpt-oss-120b`) |

### Running locally

```bash
cp .env.example .env      # then set GROQ_API_KEY in .env
npm run dev               # Vite also serves POST /api/ai/fitness via a dev middleware
```

`npm run dev` needs no extra command: a small Vite plugin reuses the same
request handler so the AI route works in development exactly as it does on
Vercel. `vite preview` gets the same treatment via `configurePreviewServer`. If
you prefer the real serverless runtime, install the Vercel CLI and run
`vercel dev`.

Because `api/ai/fitness.js` follows the Vercel Node function convention, Vercel
picks up the `api/` directory automatically. Secret keys are **never**
committed — see `.env.example` for the placeholder shape and `.gitignore` for
the ignored env files.

### Local data, not the cloud

BeFit stores account and fitness data in this browser's `localStorage`. Data is
therefore **browser-specific**: it is not synced across devices, and clearing
browser storage (or using a different browser / profile) will remove it. Export
your data from **Settings → Data Management** if you want a backup. There is no
cloud database and no account recovery.

### AI guidance disclaimer

AI insights and recommendations are generated by GroqCloud from the fitness data
you have logged. Treat them as general fitness guidance, **not medical advice or
diagnosis**. Consult a qualified healthcare professional before making changes
that affect your health.

## Deployment (Vercel)

BeFit is built to deploy on Vercel with no extra tooling:

1. Import the GitHub repository into Vercel.
2. Add the server-side environment variable `GROQ_API_KEY` in
   **Project → Settings → Environment Variables**. Never prefix it with `VITE_`.
3. Deploy. Vercel runs `vite build`, serves `dist/`, and exposes
   `api/ai/fitness.js` as a serverless function at `/api/ai/fitness`.

`vercel.json` contains a single SPA rewrite so direct requests such as
`/dashboard` or `/progress` load the app instead of returning a 404. The rewrite
deliberately excludes `/api/*` so the AI serverless function is never swallowed
by the SPA fallback.

### Production build

```bash
npm run build     # outputs dist/
npm run preview   # serves the production build locally (with a working AI route)
```