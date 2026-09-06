# Testing — Pathfinder Canada

## Philosophy
The domain layer (`src/domain/**`) is pure TypeScript with zero React/Supabase imports, so it is fully unit-testable without a database or a browser. That's where most of the confidence in this product should come from — not from end-to-end tests, which are comparatively few and target critical journeys only.

## Commands
```bash
npm run lint
npm run typecheck
npm test            # vitest run — unit + integration
npm run test:watch  # vitest watch mode
npm run test:e2e    # playwright — needs `npm run build` output or a running dev server
```

## Unit tests (`tests/unit/`)
**Eligibility** (`tests/unit/eligibility/`) — one test file per operator plus a program-level file, covering (per `docs/MVP_TASKS.md` / build-prompt §50): required-course met/missing/planned/in-progress, grade above/at/below minimum, unknown grade, `ANY_OF` success/fail, `AT_LEAST_N` success/fail, average success/fail, stale requirement, needs-review requirement, supplemental required, multiple simultaneous requirements, program fully eligible, program partially eligible.

**Recommendations** (`tests/unit/recommendations/`) — missing course creates an action; below-minimum creates an action; the same missing course across programs consolidates into one action; an action affecting more saved programs ranks higher; a supplemental requirement creates a deadline-bearing action.

**Scenario** (`tests/unit/scenario/`) — raising a grade opens a program; lowering a grade removes eligibility; adding a course opens a program; removing a course closes one; an unchanged scenario produces an identical result to the base evaluation.

**Validation** (`tests/unit/validation/`) — rejects: unknown rule operator, malformed rule JSON, out-of-range grade, `verified` status with no `source_snapshot_id`, a program referencing a non-existent institution.

## Integration tests (`tests/integration/`)
Test the query-layer functions (the thin wrappers around the Supabase client in `src/lib/supabase`) for the shape of the filters they apply — e.g. "the saved-programs query is always scoped to the caller's `student_profile_id`". These do **not** run against a live database in this build (none is available — no Docker, no hosted project); they check the query-builder call arguments. **Full Row Level Security behavior must be smoke-tested against a real Supabase project before trusting it in production** — see `docs/BUILD_REPORT.md`.

## End-to-end (`tests/e2e/`, Playwright)
- `student-demo-journey.spec.ts` — landing → Try Demo Student → view eligibility → run a what-if → view action plan → click a source link. Runs against the built app with **zero backend configuration**, so this one actually executes in any environment, including this one.
- `signup-onboarding.spec.ts`, `admin-rule-flow.spec.ts` — written to the same standard, but require real Supabase credentials in `.env.local` to run (auth needs a real project). They are not silently skipped-and-reported-green; running them without credentials fails loudly with a clear message, which is the honest behavior.

## What "done" means for a milestone
Per `CLAUDE.md`: lint, typecheck, and the relevant test files pass before moving to the next milestone. Before the whole MVP is called complete: full suite green, production build succeeds, and the founder-review checklist in `docs/BUILD_REPORT.md` is answered honestly, including anything that still needs real credentials to verify.
