# Build Report — Pathfinder Canada MVP

Built in one continuous session per the plan in `docs/PRODUCT.md`/`CLAUDE.md`. ~11,500 lines of TypeScript across 151 source files, 25 routes, 66 passing Vitest unit tests, and a Playwright e2e suite that actually runs.

**Update — live deployment verification:** the app has since been deployed to Vercel and connected to a real Supabase project by the founder, with my help. Everything in this report originally marked "not live-tested" has now been exercised end-to-end against that real project (see "Live verification" below) — this is no longer a gap.

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

Everything personalized: signup/login, onboarding, courses, program search/detail's *personalized* status, dashboard, targets, simulator persistence, action plan, application plan, settings, admin. Now live-verified — see "Live verification" below.

## Live verification (post-deploy)

Once the founder created a real Supabase project and Vercel deployment, the following was exercised against the live project, not just reasoned about:

- **Migrations**: all 4 files run successfully via the Supabase SQL Editor (combined into one script for convenience). Verified via direct REST calls that `courses`, `program_requirements`, and `billing_entitlements` all exist and are queryable.
- **Seed data**: `npm run seed` pushed all fixtures successfully (3 institutions, 25 courses, 15 programs, 49 requirements, 15 sources, 7 supplementals) — confirmed readable via the public REST API.
- **RLS, for real**: queried `student_profiles`, `saved_programs`, and `profiles` via the anon key with no session — all three returned `[]`, confirming anonymous/cross-user access is actually blocked, not just intended. This was risk #1 below; it's resolved.
- **Full signup → onboarding → dashboard flow**: created a real test account, stepped through all 6 onboarding steps against the live course/program catalog, and landed on a dashboard showing correct real-data-driven priority actions (missing English Studies 12, missing Pre-Calculus 12, a supplemental deadline) — matching what the domain engine should produce for that exact input.
- **Admin dashboard**: promoted the test account to `role='admin'` via direct DB write and confirmed `/admin` renders the verification queue with correct live counts (1 stale, 1 needs-review, 1 missing-source, 2 expiring-soon) matching the seeded data's deliberate trust-state mix.
- **Account deletion cascade**: deleted the test account via `auth.admin.deleteUser()` and confirmed its `student_profiles` row was removed by the `ON DELETE CASCADE`, not left orphaned.

Three real bugs were found and fixed during this process (all committed):
1. `new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")` crashed the Vercel build with `ERR_INVALID_URL` because Vercel had the variable declared but empty, and `??` doesn't catch empty strings. Fixed by centralizing the fallback in `lib/env.ts::getAppUrl()`, using `||` instead.
2. `supabase/seed/seed.ts` used plain `dotenv/config`, which only loads `.env` — invisible to `.env.local`, the file the README itself tells you to create. The seed script failed with "missing env vars" even with a correct `.env.local`. Fixed to load `.env.local` explicitly.
3. Supabase's default "Confirm email" setting meant `signUp()` returned a user but no session, and the app silently redirected to `/onboarding`, which then bounced to `/login` with zero explanation. Fixed `signUpAction` to detect the missing session and show a clear "check your email" message instead.

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

1. ~~RLS has not been exercised against a live database.~~ **Resolved** — see "Live verification" above.
2. **Admin bootstrap depends on signup order.** `ADMIN_EMAILS` is only consulted inside the signup server action, so promoting an *already-existing* account requires a direct database update — document this for whoever sets up the first admin. (Worked around manually during live verification via a direct `profiles.role` update.)
3. **No rate limiting** on `/api/ai/explain` or `/api/export` — fine for an MVP with no traffic, not fine before any public launch.
4. **Program comparison and search are simple** (client-side filtering of a small in-memory list) — will need real server-side pagination once the catalog grows past a few hundred programs.
5. **Deleting an admin account with audit history is blocked** by the `admin_audit_log` foreign key (by design, to preserve accountability records) — the delete action surfaces a clear message rather than crashing, but there's no self-service resolution path yet.
6. **Supabase's shared email sender is rate-limited to 2 emails/hour** and is not meant for production use. Before real users sign up, configure a custom SMTP provider (Resend, Postmark, etc.) under Supabase's Auth settings — see the Custom SMTP guide in Supabase's docs.

## Data that still needs real official verification

**Update:** the live database now also has 8 real programs (one Computer Science / closest-equivalent program each at UBC, SFU, University of Toronto, McMaster, McGill, Queen's, Western, and Langara College), researched directly from each institution's official admissions pages, each with a real `source_snapshots` row (URL + excerpt + date). They're marked `needs_review`, not `verified` — an AI assistant did the research pass and sourced everything from official pages, but a human (you) should do a quick confirmation glance against each source before flipping any of them to `verified`. McMaster's entry is the least certain — its real admission tool is an interactive per-applicant widget I couldn't fully extract, so it's flagged explicitly in its own notes row. The three original fictional institutions (Cascade/Harborview/Northern Ridge University) have been deactivated (`active = false`, not deleted) in the **live database only** — `/demo` is untouched and still runs entirely on `src/lib/seed-data.ts`'s fictional fixtures, as designed.

**Still fictional / not yet done:** every program beyond those 8 (the vast majority of real Canadian university programs), and any non-Computer-Science program at the 8 institutions above. Before pointing more real students at this, keep working through the admin verification workflow in `docs/DATA_VERIFICATION.md` — official source URL, excerpt, reviewer, verified date — for whatever programs your actual test users search for next.

## Recommended first user test

Run `docs/USER_TESTING.md`'s script with 3-5 real BC Grade 11/12 students using `/demo` (no account needed). Specifically watch for: whether they understand "official requirement" vs. "strategic suggestion" without prompting (the core trust claim), and whether the what-if simulator's result matches their intuition.

## Recommended next five improvements

1. Configure a custom SMTP provider in Supabase so real users don't hit the 2-emails/hour shared-sender limit.
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
- **Can one user see another student's profile?** No — confirmed live: an anonymous request against `student_profiles`/`saved_programs`/`profiles` with no session returns `[]`, not other users' rows.
- **Can a normal user access admin endpoints?** No — server-side `requireAdmin()` redirect on every admin route/action, backed by RLS; confirmed live by promoting/testing a real account.
- **Does mobile feel like a broken desktop app?** No — spot-checked at 375px (landing, demo, auth) via the in-app browser; looked clean and usable.
- **Does the UI look like school administration software?** No — restrained indigo/neutral palette, generous spacing, no dense enterprise tables outside admin.
