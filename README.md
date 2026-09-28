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

## Scripts

```bash
npm install     # install dependencies
npm run dev     # start the dev server
npm run build   # production build
npm run lint    # oxlint
npm run preview # preview the production build
```

## Environment

Future AI-powered insights will use GroqCloud. Secret keys are **never**
committed to the repository — see `.env.example` for the placeholder shape and
`.gitignore` for the ignored env files.