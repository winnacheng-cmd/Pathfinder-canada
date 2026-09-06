# Architecture — Pathfinder Canada

## Stack
Next.js 15+ (App Router) · React · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + Auth) · Zod · React Hook Form · Vitest · Playwright.

## Layering (the part that matters most)
```
UI (src/app, src/features)  ──►  reads/writes via src/lib/supabase
        │
        ▼ (passes plain data in, gets plain data out — no DB, no React)
Domain layer (src/domain)   ──►  eligibility engine, action engine, scenario diff
        │
        ▼
AI explanation (src/lib/ai) ──►  summarizes domain output in prose; never decides it
```

The domain layer is pure TypeScript: no Supabase client, no React, no fetch. It takes a student profile + course list + program requirements as plain objects and returns plain result objects. This is what makes eligibility "deterministic and testable" per `CLAUDE.md` — every rule in `docs/ADMISSIONS_RULES.md` has a Vitest test that never touches a database.

## Folder structure
```
src/
  app/            routes only — thin pages/layouts that fetch data and render features
  features/       client components + hooks, grouped by product area
                  (auth, onboarding, courses, programs, targets, eligibility,
                   action-plan, simulator, admin, billing)
  domain/         pure business logic — eligibility, recommendations, scenario
  lib/
    supabase/     client.ts (browser), server.ts (RSC/server actions), admin.ts
                  (service-role, server-only, never imported by client code)
    ai/           provider abstraction + fallback (see docs/ADMISSIONS_RULES.md)
    validation/   Zod schemas, one per form/API boundary
    analytics/    track() abstraction, see "Analytics" below
    seed-data.ts  single source of truth for fixture data (see docs/DATABASE.md)
  types/          shared TS types (DB row types, domain DTOs)
  config/         site copy constants, nav config
supabase/
  migrations/     numbered SQL migrations (schema + RLS)
  seed/           seed.ts — pushes src/lib/seed-data.ts into Postgres
tests/
  unit/           domain layer tests — no I/O
  integration/    query-layer/authorization tests
  e2e/            Playwright, critical user journeys
```

## Why Supabase, and how the app behaves without it
Supabase gives Postgres + Auth + Row Level Security with a small operational footprint, matching `CLAUDE.md`'s stack requirement. There's no bundled local Postgres in this environment (no Docker), so the app is written to fail gracefully when `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are absent:

- The Supabase client factories (`src/lib/supabase/client.ts`, `server.ts`) throw a typed `SupabaseNotConfiguredError` instead of an opaque runtime crash.
- Every server component/action that needs Supabase catches that error and renders an `EmptyState` explaining what's missing and linking to `README.md`.
- `/demo` and the marketing pages never touch Supabase — they run the exact same domain engine against `src/lib/seed-data.ts` fixtures held in memory. This is not a second fake app; it's the same domain code, fed static data instead of a DB round trip, which is why the eligibility engine has zero DB dependency in the first place.

## Auth & authorization
Supabase Auth (email/password) via `@supabase/ssr` (cookie-based session, refreshed in middleware). A Postgres trigger creates a `profiles` row (`role: student | admin | reviewer`, default `student`) on signup. The signup server action then checks `ADMIN_EMAILS` (a Next.js env var Postgres can't see) and promotes the row via the service-role client as a one-time bootstrap convenience for the founder account — every actual authorization check (route guards, RLS policies) reads `profiles.role`, not the env var. See `docs/DATABASE.md`.

## AI explanation layer
`src/lib/ai/provider.ts` defines `generateExplanation(context): Promise<string>`. `AI_PROVIDER` env var selects `anthropic-provider.ts` / `openai-provider.ts`; with no key set, `fallback-provider.ts` runs — a deterministic template that reads the same structured action-engine output an LLM would summarize. The system prompt (server-side only, never sent to the client) instructs the model it is not the authority on requirements and must not contradict structured results. See `docs/ADMISSIONS_RULES.md`.

## Analytics
`src/lib/analytics/track.ts` is a thin abstraction (event name + minimal metadata). In development it logs to the console; no third-party analytics vendor is wired in the MVP. Student grades and other academic data are never sent as event properties — see `.claude/rules/privacy.md`.

## Performance
Server components fetch data server-side by default; client components are used only where interactivity requires it (course editor, what-if simulator, admin forms). Public catalog data (institutions/programs/requirements) is safe to cache; personalized data (profile/courses/saved programs/scenarios) is always fetched per-request, never cached across users.
