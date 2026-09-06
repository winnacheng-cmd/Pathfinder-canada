# Database — Pathfinder Canada

Postgres via Supabase. Migrations live in `supabase/migrations/*.sql`, applied in filename order. There is no bundled local Postgres in the dev environment this was built in (no Docker) — migrations are written and reviewed carefully but have **not** been run against a live instance. See `docs/BUILD_REPORT.md` for what still needs a live smoke test.

## Tables

| Table | Purpose | Owner-scoped? |
|---|---|---|
| `profiles` | `id` (= `auth.users.id`), `role` (student\|admin\|reviewer) | self |
| `student_profiles` | province, curriculum, grade_level, graduation_year | self |
| `courses` | canonical course catalog (province/curriculum/code/name/subject_group) | public read |
| `student_courses` | a student's course + status + grade/predicted grade | self (via student_profile_id) |
| `institutions` | name, province, city, official_url | public read |
| `programs` | institution_id, name, credential, faculty, campus, subject_area | public read |
| `source_snapshots` | source_url, excerpt, verified_by/at, expires_at | public read |
| `program_requirements` | requirement_type, rule_json, display_text, source_snapshot_id, status | public read |
| `supplemental_requirements` | program_id, type, deadline, source_snapshot_id | public read |
| `saved_programs` | student_profile_id + program_id (unique pair) | self |
| `evaluations` | cached eligibility result + rules_version (audit only — engine always recomputes) | self |
| `scenarios` | saved what-if scenario_json | self |
| `feedback` | incorrect-data reports | insert: any signed-in user; read: admin |
| `admin_audit_log` | before/after JSON on admin mutations | admin |

Full column lists match `docs/DATA_MODEL.md`; the migrations are the source of truth for exact types/constraints.

## Why `profiles` was added beyond `docs/DATA_MODEL.md`
The data model doc doesn't list a role table, but `CLAUDE.md`/build-prompt §71 require a DB-backed role system rather than trusting `ADMIN_EMAILS` alone in production. `profiles.role` is that mechanism. The `on_auth_user_created` trigger (`supabase/migrations/20260101000002_functions_triggers.sql`) always creates a plain `role='student'` row — Postgres has no access to the Next.js `ADMIN_EMAILS` env var. Instead, the signup server action (`src/features/auth`) checks `ADMIN_EMAILS` after a successful signup and promotes the new row to `role='admin'` via the service-role client if the email matches. Every authorization check downstream reads `profiles.role`, never the env var directly.

## Data minimization decisions
- `student_profiles` never stores health, disability, income, ethnicity, religion, or precise address data — see `.claude/rules/privacy.md`. Onboarding intentionally has no fields for these.
- Admins do **not** get blanket read access to `student_profiles`/`student_courses`/`saved_programs`/`scenarios`. Admin's job is the catalog (institutions/programs/requirements/sources) and the `feedback`/`admin_audit_log` queues — not student academic records. This is stricter than the build prompt strictly required, chosen to minimize sensitive-data exposure per `.claude/rules/privacy.md`.
- Authentication identity (`auth.users`) is separate from academic profile data (`student_profiles`), linked only by `user_id`, so academic data can be exported/deleted independently of the auth record if that's ever needed.

## Row Level Security (summary — see migration files for exact policies)
- Self-scoped tables: `USING (student_profile_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()))` (or the direct `user_id = auth.uid()` form for `profiles`/`student_profiles` themselves).
- Catalog tables: `SELECT` open to `anon` + `authenticated`; `INSERT`/`UPDATE`/`DELETE` require `is_admin(auth.uid())`.
- `feedback`: any authenticated user can `INSERT` their own row; only admins can `SELECT`/`UPDATE`.
- `admin_audit_log`: admin-only `SELECT`; rows are written by server-side admin actions using the service-role client after the mutation succeeds (never client-writable).
- A `is_admin(uid uuid) RETURNS boolean` SQL function centralizes the role check so policies don't repeat the subquery.

## Constraints backing up Zod validation
- `student_courses.grade_percent` / `predicted_grade_percent`: `CHECK (value BETWEEN 0 AND 100)`.
- `student_courses.status`, `program_requirements.status`, `program_requirements.requirement_type`: Postgres `CHECK ... IN (...)` enums mirroring the Zod enums in `src/domain/eligibility/types.ts`.
- `program_requirements`: `CHECK (status <> 'verified' OR source_snapshot_id IS NOT NULL)` — a verified requirement must have provenance.
- Foreign keys with `ON DELETE CASCADE` from student-owned tables to `student_profiles`, so account deletion cascades cleanly (see `docs/PRIVACY.md`).

## Seed data
`src/lib/seed-data.ts` is the single source of truth for fixture data — 3 fictional institutions, ~15 programs across Sciences/Engineering/Business/Health/Arts/Computer Science, 20+ BC courses, and every rule pattern (`ANY_OF`, `AT_LEAST_N`, `AVERAGE_OF_SELECTED`, `SUPPLEMENTAL_REQUIRED`) including one deliberately `stale` and one `needs_review` requirement so the trust-badge UI is fully exercisable. `supabase/seed/seed.ts` pushes these fixtures into Postgres via the service-role client; `/demo` reads the same fixtures directly in memory. See `docs/DATA_VERIFICATION.md` for why this data is fictional rather than scraped.
