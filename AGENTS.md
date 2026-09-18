# AGENTS.md

Guidance for AI coding agents (Codex, Claude Code, etc.) working in the **Maclang-HRIS** repository.

## 1. What this project is

Maclang-HRIS is a single-page **Human Resource Information System** frontend built for a
Philippine hospital/government-agency setting. It covers the full employee lifecycle:

- **Recruitment** — "Plantilla" (permanent, budgeted civil-service positions) and
  "Non-Plantilla" (contract-of-service/consultant) hiring pipelines: postings → applications
  → interviews/comparative assessment → onboarding.
- **Attendance** — a face-recognition DTR (Daily Time Record) kiosk.
- **Leave management** — requests, approvals, balances, calendar, suspensions.
- **Performance management** — SPMS/IPCR/OPCR/MFO (the Philippine civil-service performance
  appraisal framework).
- **Org structure** — departments, positions, plantilla items, manpower mapping, renewals.
- **Learning & development** — trainings, skill-gap analysis, training effectiveness.
- **System admin** — accounts, role/permission management, audit logs, announcements,
  analytics, top-performer leaderboards, task monitoring, bug reports.

Domain terms like "Plantilla," "SPMS," "IPCR," and "CS Form No. 212" come from the Philippine
Civil Service Commission — see the glossary in §7 before renaming or "simplifying" anything
that looks unfamiliar.

## 2. Repo composition — read this before touching `vendor/`

This repository is the **frontend only** (React + Vite). It talks to a **separate Laravel REST
API** (not in this repo) over `VITE_API_URL`.

The `composer.json` / `vendor/` at the repo root pull in `laravel/reverb` (a WebSocket
broadcast server), but there is **no Laravel application skeleton here** — no `artisan`, no
`app/`, `routes/`, or `config/`. Don't assume you can run `php artisan reverb:start` in this
repo; the real Reverb server lives with the backend project. Treat `vendor/` as inert for
frontend work.

## 3. Tech stack

- **React 19**, **Vite 7**, **React Router v7** (data-less `<Routes>/<Route>` style)
- **Tailwind CSS v4** via `@tailwindcss/vite` — there is no `tailwind.config.js`; theme tokens
  live in `src/index.css`. Dark mode uses the `class` strategy (`ThemeProvider` in `main.jsx`).
- **shadcn/ui** (`"new-york"` style, plain `.jsx`, not `.tsx` — see `components.json`) built on
  **Radix UI** primitives, in `src/components/ui/`
- **PrimeReact** + `primeicons` used alongside shadcn in some older/denser screens
- **TanStack React Table**, **dnd-kit** (drag & drop), **Recharts** (charts)
- **react-hook-form** + **zod** (`@hookform/resolvers`) for forms/validation
- **axios** for HTTP; **laravel-echo** + **pusher-js** for realtime, against a Laravel Reverb
  server
- **MediaPipe** (`face_detection`, `face_mesh`, `camera_utils`) — powers the DTR kiosk's
  liveness check and face capture
- **xlsx** / **xlsx-js-style** (Excel export), **mammoth** (.docx reading), **framer-motion**
  (animation), **sonner** (toasts), **date-fns**

No TypeScript (only `@types/*` dev-deps for editor intellisense + `jsconfig.json` path
aliases) and **no test runner** is configured (no Jest/Vitest/RTL). Verify changes manually via
`npm run dev`.

## 4. Repository layout

```
src/
├─ api/api.js            # single axios instance (see §6)
├─ app/dashboard/         # dashboard-specific composition
├─ components/            # shared components; ui/ = shadcn primitives (35 components)
├─ constants/             # constants.js (CS Form 212 field data), permissions.js (RBAC strings)
├─ context/authContext.jsx
├─ hooks/                 # ~24 hooks, one concern each (useLeaveApprovals, useAuditLogs, ...)
├─ layout/                # roleBasedLayout.jsx, userLayout.jsx, layout.jsx
├─ lib/                   # tokenStorage, echo (websockets), authHelpers, validation, ph-geo/ph-barangays, utils
├─ pages/<feature>/        # one folder per feature, see pattern below
├─ routes/                # appRoutes.jsx + route guards
└─ services/               # one file per domain, wraps api.js (leaveApiService, hiringService, ...)
```

Feature folders under `src/pages/` generally follow:

```
pages/<feature>/
  <feature>Page.jsx        # top-level page component
  components/               # feature-local components
  hooks/ | utils/ | helpers/ # optional, feature-local
```

Nested features follow the same pattern recursively, e.g.
`pages/hiring/plantilla/application/components/{documents,interviews,overview,comparativeAssessment}/`.

## 5. Path aliases

`@/` maps to `./src` — configured in both `vite.config.js` and `jsconfig.json`. Use
`@/lib/utils`, `@/components/ui/button`, etc. instead of relative `../../../` chains.

## 6. Setup & commands

```bash
npm install
npm run dev          # Vite dev server
npm run dev:host     # binds 0.0.0.0:3000 — useful for testing the camera-based DTR kiosk from another device
npm run build        # production build
npm run preview      # preview the production build
npm run lint         # ESLint, flat config in eslint.config.js — no Prettier config exists
```

Required environment variables (`.env`, already `.gitignore`d — never commit real values):

```
VITE_API_URL=            # base URL of the separate Laravel backend
VITE_REVERB_APP_KEY=
VITE_REVERB_HOST=
VITE_REVERB_PORT=
VITE_REVERB_SCHEME=
```

## 7. Auth & RBAC

- `src/context/authContext.jsx` — global auth state. Restores the session on mount via
  `authService.me()`, and listens for a "session displaced" flag (another login evicted this
  one), surfaced through `src/components/sessionDisplaceModal.jsx`.
- `src/lib/tokenStorage.js` — stores the bearer token and user under `sessionStorage`
  (**not** `localStorage`) as `auth_token` / `auth_user`. This is intentional: sessions do not
  survive a browser restart. Don't "fix" this without confirming with the team.
- `src/lib/authHelpers.js` — `hasPermission(user, permission)`, `hasAnyPermission`,
  `hasAllPermissions`, all checking `user.permissions` (a flat string array from the backend).
- `src/constants/permissions.js` — the single source of truth for permission strings, in
  `"module.action"` form (e.g. `"hiring.plantilla.postings.view"`, `"leave.approval.manage"`).
  Add new permissions here first.
- Route guards in `src/routes/`: `protectedRoutes.jsx` (must be authenticated),
  `publicRoute.jsx` (must be logged out), `permissionRoute.jsx` (must hold a permission),
  `plantillaApplicantGate.jsx` (external-applicant flow).
- `src/layout/roleBasedLayout.jsx` renders navigation based on the current user's permissions.
- Public (unauthenticated) routes: `/login`, `/register`, and `/dtr/*` — the DTR kiosk is
  deliberately public since it runs on a shared physical terminal, not a personal login.

## 8. API layer & data flow

- `src/api/api.js` — the one axios instance. `baseURL` = `VITE_API_URL`, `withCredentials:
  true`. A request interceptor attaches `Authorization: Bearer <token>` and an
  `X-Socket-Id` header (from the active Laravel Echo connection, so the backend can exclude
  the sender from its own broadcast). A response interceptor clears auth and redirects to
  `/login` on `401`, *except* for `/profile/status` checks, calls already on `/login`,
  `/logout` calls, and while a "session displaced" flow is in progress.
- `src/services/*.js` — one file per domain (`leaveApiService`, `hiringService`,
  `employeeService`, `accountsService`, `rolesService`, `manpowerService`, etc.), each
  wrapping calls to `api.js`. **New backend endpoints should get a function in the matching
  service file**, not an inline `axios`/`api` call inside a component.

## 9. Realtime

`src/lib/echo.js` configures Laravel Echo over the Pusher protocol against the Reverb server
(`VITE_REVERB_*`). Used for notifications and live updates (leave approvals, announcements,
account approvals, etc.).

## 10. UI conventions

- Prefer composing from `src/components/ui/` (shadcn, "new-york" style) before reaching for
  PrimeReact or hand-rolling a primitive.
- Icons: `lucide-react` is the pinned icon library (`components.json`); `react-icons` /
  `primeicons` appear in a few older screens.
- Forms: `react-hook-form` + `zod`; shared validation helpers in `src/lib/validation.js`.
- Philippine-specific helpers: `src/lib/ph-geo.js`, `ph-barangays.js`,
  `ph-barangays-helpers.js` for region/province/city/barangay address data used in employee
  and applicant forms.

## 11. Domain glossary

| Term | Meaning |
|---|---|
| **Plantilla** | An official, budgeted government position/item. "Plantilla hiring" = filling a permanent civil-service post. |
| **Non-Plantilla** | Contract-of-service / consultant hiring, run as a parallel pipeline to Plantilla. |
| **Plantilla Items** | The master list of authorized position slots an org unit is allotted (`src/pages/plantillaItems/`). |
| **DTR** | Daily Time Record — attendance, captured here via the face-recognition kiosk (`/dtr` route). |
| **SPMS / IPCR / OPCR / MFO** | Strategic Performance Management System / Individual & Office Performance Commitment and Review / Major Final Outputs — the government performance-appraisal framework (`src/pages/spms/`). |
| **CS Form No. 212** | The Civil Service Commission's Personal Data Sheet; its field set drives `src/constants/constants.js` and the employee/applicant/onboarding forms. |
| **Manpower Mapping** | Org staffing/headcount planning (`src/pages/manpower/`). |

## 12. Testing & quality

- No automated tests exist yet — sanity-check UI changes with `npm run dev`.
- `npm run lint` (ESLint flat config) is the only automated check. There is no Prettier config;
  match the surrounding formatting by eye.
- Plain JS/JSX only — don't introduce `.ts`/`.tsx` files without discussing it first, since the
  build has no TypeScript compiler configured.

## 13. Git

- Remote: `https://github.com/Mamapoco2/Maclang-HRIS.git`
- Default branch: `main` (a `ransh` branch also exists on `origin`)

## 14. Watch out for

- **Never** commit `.env` or real API/Reverb keys.
- The `vendor/`/`composer.json` Reverb dependency has no runnable Laravel app in this repo —
  don't try to start it here.
- A few filenames have inconsistent casing (e.g. `hooks/Useauthenticatedimage.js`,
  `hooks/UseTrainingnotifications.js`). Match existing import paths exactly rather than
  "correcting" the casing, which would break every importer.
- The face-recognition endpoints (`register-face`, `recognize-face` in
  `src/services/faceService.js`) send base64 image frames of employees' faces — treat this as
  sensitive biometric data; don't log captured frames or add third-party analytics to that flow.
