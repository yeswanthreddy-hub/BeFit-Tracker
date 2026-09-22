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