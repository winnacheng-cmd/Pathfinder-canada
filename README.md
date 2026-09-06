# Pathfinder Canada

Enter your courses once. See what is open, what is missing, and what to do next.

A Canada-first university eligibility and planning engine for Grade 11-12 students. Admission requirements are evaluated by a deterministic rules engine — never by an LLM — and every requirement links back to an official source with a verification date. See `docs/PRODUCT.md` for the full product spec and `CLAUDE.md` for engineering ground rules.

## Local development

Requires Node.js 20+ (built and tested on Node 24 LTS).

```bash
npm install
cp .env.example .env.local   # fill in what you have — see "Environment variables" below
npm run dev
```

The app runs with **zero configuration**: the landing page, `/demo` (a full working eligibility/simulator/action-plan experience against fictional seed data), and the marketing pages all work with no `.env.local` at all. Auth-gated pages (`/dashboard`, `/courses`, etc.) show a "backend not configured" screen until Supabase credentials are added.

## Environment variables

See `.env.example` for the full list and inline comments. Summary of what each group unlocks:

| Missing | Behavior |
|---|---|
| Supabase vars | Public pages + `/demo` work; auth-gated pages show a setup prompt instead of crashing. |
| `AI_PROVIDER`/API key | AI explanations fall back to a deterministic template. Eligibility itself never depends on this. |
| Stripe keys | App runs in free/demo mode; billing UI is present but inert. |

## Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy the project URL, anon key, and service-role key into `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Run the migrations (below) against that project — via the Supabase SQL editor (paste each file in `supabase/migrations/` in order) or the Supabase CLI (`supabase link`, then `supabase db push`).
4. (Optional) set `ADMIN_EMAILS` to your own email *before* your first signup, so your account is auto-assigned `role=admin`. See `docs/DATABASE.md` for why this is a bootstrap convenience, not the production authorization mechanism.

This has been run end-to-end against a real Supabase project (migrations, seed, signup/onboarding/dashboard, admin, RLS) — see `docs/BUILD_REPORT.md` "Live verification" for exactly what was checked.

**Note on email confirmation:** Supabase's default "Confirm email" setting requires a real inbox before a session is granted, and its shared email sender is rate-limited to 2 emails/hour — fine for a couple of manual test signups, not enough for real traffic. Before real users sign up, configure a custom SMTP provider (Resend, Postmark, etc.) under Supabase's Auth settings.

## Database migration

```bash
# via Supabase CLI, once `supabase link` is done:
supabase db push

# or paste each file in supabase/migrations/ into the Supabase SQL editor, in order.
```

## Seed data

```bash
npm run seed
```

Pushes the fixtures in `src/lib/seed-data.ts` (fictional institutions/programs/courses/requirements, clearly labeled as sample data — see `docs/DATA_VERIFICATION.md`) into your connected Supabase project. Requires `SUPABASE_SERVICE_ROLE_KEY` to be set.

## Tests

```bash
npm run lint
npm run typecheck
npm test            # unit + integration (Vitest) — no external services required
npm run test:e2e    # Playwright — the demo-mode journey runs with zero config;
                     # auth/admin specs need real Supabase credentials in .env.local
```

The auth-dependent specs are intentionally not skip-and-green when unconfigured: `signup-onboarding.spec.ts` fails loudly (a clear "element not found" timeout) if Supabase isn't connected, since `/signup` renders the "backend not configured" state instead of a form. `admin-rule-flow.spec.ts` additionally needs a real admin account — set `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` to run it, otherwise it reports as **skipped** (not passed) with an explicit reason.

## Production build

```bash
npm run build
npm run start
```

## Deployment

Built for Vercel (Next.js) + Supabase (Postgres/Auth). Set the same environment variables from `.env.example` in the Vercel project settings. Point `NEXT_PUBLIC_APP_URL` at the deployed domain.

## Admin setup

Admin access is controlled by `profiles.role = 'admin'` in the database (checked server-side, backed by Row Level Security) — not by anything client-visible. The `ADMIN_EMAILS` env var is only a one-time convenience: it's read by the signup trigger to auto-assign `role=admin` to the founder's first account. See `docs/DATABASE.md` for the full model, and never treat `ADMIN_EMAILS` alone as sufficient authorization in production.

## Data verification

Admissions requirements are only as trustworthy as the review process behind them. The MVP ships with clearly-labeled **fictional** seed data (invented institutions, placeholder sources) rather than scraped or AI-recalled "real" requirements — see `docs/DATA_VERIFICATION.md` for why, and for the verification workflow required before any real requirement can be marked `verified`.

## Docs index

`docs/PRODUCT.md` · `docs/ARCHITECTURE.md` · `docs/DATABASE.md` · `docs/ADMISSIONS_RULES.md` · `docs/PRIVACY.md` · `docs/TESTING.md` · `docs/ROADMAP.md` · `docs/DATA_VERIFICATION.md` · `docs/USER_TESTING.md` · `docs/BUILD_REPORT.md`
