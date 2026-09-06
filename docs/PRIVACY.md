# Privacy — Pathfinder Canada

Full rules live in `.claude/rules/privacy.md` (binding for all code in this repo); this doc explains how the MVP implements them. `/privacy` is the user-facing policy page — mark it clearly as a starter template pending legal review before any real production launch with real users.

## Data minimization
Onboarding collects only: province, curriculum, grade level, graduation year, courses + status + grade/predicted grade, optional broad interest categories, and target programs. It never asks for health, disability, household income, ethnicity, religion, sexual orientation, exact home address, or an unnecessary birth date. There is no field in the schema for any of these — this is enforced by the data model, not just the form.

## Minors
Most users are expected to be minors. No dependency-pattern engagement mechanics (streaks, urgency, guilt-based nudges) are used anywhere in the product. Notifications, if ever added, must default to off.

## Identity vs. academic data
`auth.users` (Supabase-managed identity) is separate from `student_profiles` (academic data), joined only by `user_id`. This means academic data can be exported or deleted independently of the login record.

## Access control
- Row Level Security restricts every student-owned table to its owner. See `docs/DATABASE.md`.
- Admins manage the catalog (institutions/programs/requirements/sources) and the feedback/audit queues — they do **not** get blanket read access to student profiles, courses, saved programs, or scenarios.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only (`src/lib/supabase/admin.ts`); it is never imported by any file under `src/app/**/page.tsx` client boundary or any `"use client"` component, and never sent to the browser.

## Logging
Server logs use IDs, not content: no grades, no free-text profile fields, no email addresses in casual logs. Error logs sanitize request bodies before writing.

## Analytics
`src/lib/analytics/track.ts` logs event *names* (e.g. `course_added`, `scenario_saved`) with minimal non-sensitive metadata (counts, booleans, IDs) — never grades, never free-text. No third-party analytics vendor is wired into the MVP; in production this should stay privacy-friendly (aggregate/self-hosted) rather than a full behavioral-tracking SDK.

## User controls (`/settings`)
- **Export**: downloads the student's own profile, courses, saved programs, and scenarios as JSON (no internal admin fields).
- **Delete account**: requires a deliberate confirmation step; cascades delete of `student_profiles` and everything FK'd to it (`student_courses`, `saved_programs`, `scenarios`, `evaluations`), then deletes the `auth.users` row. `feedback` rows are anonymized (user_id set null) rather than deleted, since they may still be actionable data-quality reports about a program. Documented behavior, not a claim about data Pathfinder doesn't control (e.g. backups) — see the `/settings` deletion confirmation copy.

## AI and privacy
Student profile data sent to an AI provider (when a key is configured) is limited to the structured evaluation/action-engine output needed to generate an explanation — not raw free-text, not the student's email or account identifiers. See `docs/ADMISSIONS_RULES.md`.
