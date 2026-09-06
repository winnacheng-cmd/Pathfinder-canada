# Product — Pathfinder Canada

## What it is
A Canada-first decision engine for Grade 11-12 students. A student enters their province/curriculum, courses, grades, and target university programs. Pathfinder tells them what they currently qualify for, exactly what's missing, what actions change their options, what happens in what-if scenarios, and the official source + verification date behind every requirement.

## What it is not (MVP)
Not a chatbot, not a chancing/probability engine, not a scholarship marketplace, not a counselor platform, not the full lifelong "PathAI" career-guidance vision. See `docs/ROADMAP.md` for what's deferred and why.

## Primary user
A BC Grade 11 or 12 student applying to Canadian undergraduate programs. Architecture supports adding other provinces/curricula without a rewrite (see `docs/DATABASE.md`), but only BC's Graduation Program courses are seeded in the MVP.

## Core user journey
Landing → Try Demo Student (no signup) or Sign up → Onboarding (province, grade, grad year, courses+grades, interests, target programs) → Dashboard → Program search & save → Program detail (rule-by-rule eligibility, source, verified date) → What-if simulator → Action plan → Application plan export.

## Non-negotiable product rules
1. Eligibility is decided by a deterministic rules engine (`src/domain/eligibility`), never by an LLM. See `docs/ADMISSIONS_RULES.md`.
2. Every requirement has an official source URL and a `verified_at` date, surfaced in the UI.
3. Official minimum, competitive context, and Pathfinder's own recommendation are always visually and textually distinct.
4. No fabricated admission probabilities. No guarantees of admission, ever, in any copy.
5. Structured evaluation always wins over AI explanation — see `docs/ADMISSIONS_RULES.md` and `.claude/rules/privacy.md`.

## MVP acceptance criteria (from docs/PRD.md §14)
A BC Grade 11/12 student can enter a realistic course/grade profile, save ≥5 seeded programs, see correct rule-by-rule eligibility, see missing prerequisites, run a what-if scenario, receive an action plan, open the official source for every rule, see each requirement's verification date, and delete their account/data. `docs/BUILD_REPORT.md` records how each of these was verified.
