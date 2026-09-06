# MVP Task Plan

## Milestone 0 — repository
- initialize Next.js + TypeScript
- configure Tailwind + shadcn/ui
- configure Supabase
- configure Zod, Vitest, Playwright
- add lint/typecheck/test scripts
- create env example
- add CI

## Milestone 1 — database + admin seed
- implement schema
- seed 2 institutions and 10 programs first
- seed BC course catalog subset
- seed requirement rules with fake/dev source URLs
- admin CRUD for programs, requirements, and source snapshots

Acceptance:
- migrations reproducible
- seed command works
- rule records editable without code changes

## Milestone 2 — student profile
- auth
- onboarding
- course/grade editor
- validation
- demo profile button

Acceptance:
- student can create/update profile and courses in <3 minutes

## Milestone 3 — eligibility engine
Create a domain module:
`src/domain/eligibility/`

Functions:
- evaluateRequiredCourse()
- evaluateCourseMinimum()
- evaluateChooseN()
- evaluateAverage()
- evaluateProgram()
- explainEvaluationBasis()

Tests:
- eligible
- missing course
- grade below minimum
- planned course
- predicted grade
- choose-N group
- ambiguous/stale rule -> needs_review

Acceptance:
- no React/UI dependencies
- deterministic tests

## Milestone 4 — program search + results
- search programs
- save target programs
- result cards
- requirement checklist
- official source link
- verified date badge
- stale warning

## Milestone 5 — what-if simulator
- clone profile state client-side
- modify grade/course
- compare before/after evaluations
- show "newly opened / lost / unchanged"

Acceptance:
- no writes required until user saves scenario

## Milestone 6 — action engine
Rules examples:
- missing required course -> add/complete course
- below minimum -> improve/retake if feasible
- supplemental -> add deadline/task
- one course opens multiple saved programs -> prioritize it

Action engine must say WHY an action matters and list affected programs.

## Milestone 7 — trust/privacy
- delete account/data
- source provenance UI
- feedback/report incorrect info
- privacy-friendly analytics
- no sensitive optional profile fields in MVP

## Milestone 8 — polish + deploy
- responsive mobile layout
- loading/error states
- accessibility pass
- production env checks
- deploy
- seed with 30-50 manually verified programs

## Validation before Phase 2
Do not add more product surface until at least 20 real target users have tried the MVP.
Record:
- what they expected
- what confused them
- what they would pay for
- whether the action plan changed a real decision
