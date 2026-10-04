# BeFit

BeFit is a modern **workout planner + fitness tracker** that runs entirely in the browser.
Plan workouts, discover exercises, log completed sessions, monitor streaks and progress,
track food and macros — all persisted locally with `localStorage`.

## Stack

- Vite
- React
- React Router
- JavaScript (no TypeScript)
- CSS design system
- `localStorage` for persistent app data

No backend, no database, no external auth. Everything lives in the browser.

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

A localStorage stub in `test/helpers/browser.js` stands in for the browser, so
the real service and utility code is exercised rather than a reimplementation.
Because the app's own imports omit file extensions, `test/helpers/extension-resolver.mjs`
maps them to real files for the Node resolver instead of touching app source.

## Environment

Future AI-powered insights will use GroqCloud. Secret keys are **never**
committed to the repository — see `.env.example` for the placeholder shape and
`.gitignore` for the ignored env files.