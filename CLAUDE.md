# Project: Pathfinder Canada

## Mission
Build a Canada-first decision engine for Grade 11-12 students. A student enters their province/curriculum, courses, grades, goals, and target university programs. The product tells them:
1. what they currently qualify for,
2. exactly what is missing,
3. what actions can change their options,
4. what happens in "what-if" scenarios,
5. the official source and last-verified date behind every requirement.

## Non-negotiable product rules
- Eligibility logic is deterministic/rules-based. Never let an LLM invent admission requirements.
- Every program requirement must have an official source URL and `last_verified_at`.
- Clearly distinguish:
  - official minimum requirement,
  - competitive/historical context,
  - our recommendation.
- Do not output fake precision such as "83% admission chance" without validated data.
- Never imply admission is guaranteed.
- Prefer actionable guidance over generic articles or personality quizzes.
- The MVP is Canada-first and Grade 11-12-first. Do not build the full lifelong PathAI vision yet.
- Build for students directly first; school/counselor dashboards are later.
- Keep onboarding short. Students should reach useful output in under 3 minutes with sample/demo data.
- Privacy by design: minimize data collection, do not collect sensitive data unless required, provide deletion/export paths, and treat minors' data as high sensitivity.
- AI explanations may summarize structured rule-engine results, but must not alter them.

## Engineering principles
- TypeScript everywhere.
- Next.js App Router.
- PostgreSQL via Supabase.
- Tailwind CSS + shadcn/ui.
- Zod for validation.
- Vitest for unit tests; Playwright for critical user flows.
- Keep business rules in a dedicated domain layer, not React components.
- Prefer simple, testable code over speculative abstractions.
- Never hard-code one student's grades or one university into core logic.
- Seed development data separately from production data.
- Run lint, typecheck, and tests before considering a task complete.

## First build target
Read `docs/PRD.md`, `docs/DATA_MODEL.md`, and `docs/MVP_TASKS.md`.
Start in plan mode. Do not implement Phase 2+ until the MVP acceptance criteria pass.
