# Build Report — Pathfinder Canada MVP

Built in one continuous session per the plan in `docs/PRODUCT.md`/`CLAUDE.md`. ~11,500 lines of TypeScript across 151 source files, 25 routes, 66 passing Vitest unit tests, and a Playwright e2e suite that actually runs.

## What was built

The full Phase-1 MVP from the product spec:

- **Landing page** with the exact hero/demo-copy/trust messaging from the spec, plus SEO metadata.
- **Demo mode** (`/demo`) — a fully self-contained, zero-backend page running the real domain engine (eligibility + action engine + what-if simulator) against fictional seed data. Statically prerendered.
- **Auth** — Supabase email/password signup/login/logout/password-reset, session refresh via a Next.js 16 `proxy.ts` (the renamed middleware convention).
- **Onboarding** — 6-step wizard (province/curriculum, grade, grad year, courses, interests, target programs), single atomic submit.
- **My Courses** — add/edit/remove courses and grades post-onboarding.
- **Program search & detail** — filterable search, per-requirement eligibility rows with trust badges, source links, verified dates, save/unsave, report-an-issue.
- **My Targets** — saved programs list with a 4-way comparison table.
- **Dashboard** — status counts, ranked priority actions, target list, recently-verified sources, AI "explain this" panel, empty states for no-courses/no-targets.
- **What-If Simulator** — client-side scenario editing (add/remove/change grade or status), instant before/after diff (newly opened / lost / still unavailable / unchanged), preset chips derived from the action engine, save-scenario.
- **Action Plan** (`/action-plan`) — full ranked action list; **Application Plan** (`/application-plan`) — separate printable/exportable version with its own print-friendly layout.
- **Admin dashboard** — role-gated (server-enforced + RLS-backed) CRUD for institutions, programs, courses, requirements (with a structured rule builder + live human-readable preview, not a raw JSON textarea), sources, plus a verification queue, feedback queue, and audit log.
- **AI explanation layer** — provider abstraction (Anthropic/OpenAI via plain `fetch`, no SDK weight) with a deterministic template fallback; system prompt hard-coded server-side; never sent the student's identity, only structured counts/actions.
- **Settings** — edit profile, export data as JSON, delete account (typed confirmation, cascading deletion).
- **Billing scaffolding** — Stripe Checkout + webhook + `billing_entitlements` table, entirely inert without keys; nothing in the product is actually paywalled.
- **Docs** — all ten required `docs/*.md` files plus this report.

## Architecture

Domain layer (`src/domain/eligibility`, `src/domain/recommendations`, `src/domain/scenario`) is pure TypeScript — zero React, zero Supabase imports — so eligibility, the action engine, and scenario diffing are fully unit-tested without any I/O. `src/domain/adapters.ts` is the single translation point between DB-row shape and domain input shape, which is *why* `/demo` and every live page share the exact same evaluation code path (demo feeds it `src/lib/seed-data.ts` directly instead of a DB round trip). See `docs/ARCHITECTURE.md`.

## Database

4 migrations (`supabase/migrations/`), syntax-validated against the real Postgres grammar via `libpg-query` (not just eyeballed) — see "Remaining production risks" for what that check does and doesn't prove. 14 tables, RLS on every one, an `is_admin()` helper function, an `on_auth_user_created` trigger, and a `billing_entitlements` table for the Stripe scaffolding. See `docs/DATABASE.md`.

## Routes (25 pages + 5 API routes)

```
/  /demo  /methodology  /privacy  /terms
/login  /signup  /reset-password  /reset-password/confirm
/onboarding
/dashboard  /courses  /programs  /programs/[id]  /targets
/simulator  /action-plan  /application-plan  /settings
/admin  /admin/institutions  /admin/programs  /admin/courses
/admin/requirements  /admin/sources  /admin/feedback  /admin/audit
/api/ai/explain  /api/export  /api/stripe/checkout  /api/stripe/webhook
```

## Tests

- **66 Vitest unit/integration tests**, all passing, zero external services: every required eligibility case (met/missing/planned/in-progress/above-minimum/at-minimum/below-minimum/unknown-grade/ANY_OF/AT_LEAST_N/average/stale/needs-review/supplemental/multi-requirement/program-level eligible-and-partial), 6 action-engine tests (consolidation + ranking by affected-program count + deadline actions), 6 scenario tests (raise/lower grade, add/remove course, unchanged, the conditionally-eligible edge case the QA pass below found), a data-validation suite that runs the real seed data through the Zod rule schema (this is what caught a missing source-snapshot reference during the build — see below), and 3 AI-fallback tests.
- **Playwright**: `student-demo-journey.spec.ts` (8/8 passed across chromium + mobile-safari — the demo journey genuinely runs end-to-end with zero configuration); `signup-onboarding.spec.ts` (fails loudly with a clear timeout, as designed, since no Supabase project is connected in this environment — not a silent skip); `admin-rule-flow.spec.ts` (skipped with an explicit reason — no `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` fixture supplied).
- `npm run lint`, `npm run typecheck`, `npm run build` all clean throughout — verified after every milestone, not just at the end.

## Environment variables required

See `.env.example`. Nothing is required to run the app or the demo.

## What works without external secrets

Landing page, `/demo` (full eligibility/action-plan/what-if experience), `/methodology`, `/privacy`, `/terms`, all unit tests, lint, typecheck, production build, and the Playwright demo-journey spec.

## What requires Supabase

Everything personalized: signup/login, onboarding, courses, program search/detail's *personalized* status, dashboard, targets, simulator persistence, action plan, application plan, settings, admin, both non-demo Playwright specs. **Migrations have not been run against a live database** — no Docker was available in this environment to run a local Supabase stack, and no hosted project credentials were provided. They're syntax-valid (checked against the real Postgres grammar) and carefully reviewed, but RLS policy *behavior* (not just syntax) needs a live smoke test — see below.

## What requires an AI key

Only the "Explain this" panel's live-model path. The fallback template covers the same feature without a key; eligibility/actions never depend on AI.

## What requires Stripe

Only the Settings "Upgrade" button and the two `/api/stripe/*` routes. Nothing else in the product checks entitlement status — no feature is paywalled in this MVP.

## Security decisions

- Service-role Supabase client (`src/lib/supabase/admin.ts`) is `import "server-only"` and used in exactly four places: seed script, admin-bootstrap promotion, account deletion, Stripe webhook — never reachable from client code.
- Every admin mutation checks `requireAdmin()` server-side *and* is backed by an `is_admin()` RLS policy at the database layer — a hidden nav link was never the only gate.
- Admins have no RLS access to student academic tables (`student_profiles`, `student_courses`, `saved_programs`, `scenarios`) — stricter than the spec strictly required, chosen for data minimization.
- `profiles.role` has no client-facing UPDATE policy — the only way to become admin is the signup-trigger `ADMIN_EMAILS` bootstrap or a direct service-role write, closing the obvious self-promotion hole.
- Stripe webhook verifies the signature before touching the payload; the AI explain route derives its context entirely server-side from the caller's own session, never from client input.
- The eligibility engine cannot be influenced by AI: `/api/ai/explain` only ever *reads* already-computed `evaluateProgram`/`generateActionPlan` output.

## Remaining production risks

1. **RLS has not been exercised against a live database.** Migrations are syntax-checked, not behavior-tested. Run the migrations against a real Supabase project and manually verify: a student can't read another student's `student_profiles`/`student_courses`/`saved_programs`; a non-admin can't write to `institutions`/`programs`/`program_requirements`; the `on_auth_user_created` trigger actually fires.
2. **Admin bootstrap depends on signup order.** `ADMIN_EMAILS` is only consulted inside the signup server action, so promoting an *already-existing* account requires a direct database update — document this for whoever sets up the first admin.
3. **No rate limiting** on `/api/ai/explain` or `/api/export` — fine for an MVP with no traffic, not fine before any public launch.
4. **Program comparison and search are simple** (client-side filtering of a small in-memory list) — will need real server-side pagination once the catalog grows past a few hundred programs.
5. **Deleting an admin account with audit history is blocked** by the `admin_audit_log` foreign key (by design, to preserve accountability records) — the delete action surfaces a clear message rather than crashing, but there's no self-service resolution path yet.

## Data that still needs real official verification

**All of it.** Every institution, program, and requirement in `src/lib/seed-data.ts` is fictional development data, clearly labeled as such in the UI (`SampleDataNotice`) and in `docs/DATA_VERIFICATION.md`. Before any real user relies on this product, real requirements must go through the admin verification workflow described there — official source URL, excerpt, reviewer, verified date — for every single program a real student might search for. Do not point real students at this deployment's current data.

## Recommended first user test

Run `docs/USER_TESTING.md`'s script with 3-5 real BC Grade 11/12 students using `/demo` (no account needed). Specifically watch for: whether they understand "official requirement" vs. "strategic suggestion" without prompting (the core trust claim), and whether the what-if simulator's result matches their intuition.

## Recommended next five improvements

1. Connect a real Supabase project and run the live RLS/auth Playwright specs — the one thing this build genuinely could not verify itself.
2. Replace the fictional seed data with 15-30 real, admin-verified BC program requirements before showing this to real students.
3. Add rate limiting to `/api/ai/explain` and `/api/export` before any public deployment.
4. Build the second-reviewer step in the source-verification workflow (`docs/DATA_VERIFICATION.md` mentions it as a later step).
5. Server-side pagination for program search once the catalog is real-sized.

## Founder-level review (build-prompt §92)

- **Does the product immediately communicate value?** Yes — landing page hero + live example matches the actual computed demo result.
- **Can a student get value in under three minutes?** Yes via `/demo`, no signup at all; onboarding itself is a 6-step wizard designed for the same target.
- **Does every eligibility result explain why?** Yes — every requirement row shows student value vs. required value and the specific status.
- **Is every formal requirement traceable?** Yes — `SourceLink` + `VerifiedSourceBadge` + verified date on every requirement row, or an explicit "no source yet" if one is missing.
- **Can the student see what action changes their options?** Yes — action engine ranks by affected-program count; what-if simulator shows the diff live.
- **Can a student experiment without changing their real profile?** Yes — the simulator operates on a client-side clone; nothing writes until "Save scenario" is clicked.
- **Could an AI hallucination alter eligibility?** No — `evaluateProgram`/`generateActionPlan` never call AI; the AI route only reads their output.
- **Can one user see another student's profile?** Not through the app code (every query is scoped by the caller's own `student_profile_id`); **RLS enforcement of this has not been live-tested** — see risk #1 above. Treat as unverified, not as proven safe, until that smoke test runs.
- **Can a normal user access admin endpoints?** No — server-side `requireAdmin()` redirect on every admin route/action, backed by RLS (same live-test caveat as above).
- **Does mobile feel like a broken desktop app?** No — spot-checked at 375px (landing, demo, auth) via the in-app browser; looked clean and usable.
- **Does the UI look like school administration software?** No — restrained indigo/neutral palette, generous spacing, no dense enterprise tables outside admin.
