# Admissions Rules Engine

## The rule that matters most
An LLM never decides whether a student meets a requirement. `src/domain/eligibility/evaluators.ts` is pure, deterministic TypeScript. AI (`src/lib/ai`) may only turn its output into prose — see "AI's job" below.

## Rule JSON operators
Validated by Zod discriminated union in `src/domain/eligibility/rule-schema.ts`.

| Operator | Meaning | Example |
|---|---|---|
| `ANY_OF` | one of the listed course codes, at or above `minimumGrade` if given | Pre-Calc 12 **or** Calc 12 ≥ 80 |
| `AT_LEAST_N` | at least `n` of the listed course codes present (any status counts toward "planned", grade rules apply per-course if given) | choose 2 of {Chem 12, Phys 12, Biol 12} |
| `AVERAGE_OF_SELECTED` | mean of the listed courses' grades ≥ `minimum` | average of {Eng 12, PreCalc 12, Chem 12, Biol 12} ≥ 85 |
| `SUPPLEMENTAL_REQUIRED` | a non-academic requirement (personal profile, portfolio, interview, audition) | supplemental type `personal_profile` |
| `GRADUATION_REQUIREMENT` | provincial graduation program completion, not a specific course | BC Graduation Program completion |

## Per-requirement statuses
`met`, `missing_course`, `below_minimum`, `planned`, `in_progress`, `unknown_grade`, `supplemental_required`, `needs_review`. A requirement whose `program_requirements.status` is `stale` or `needs_review` is evaluated but the UI wraps the result in a warning rather than presenting it with full confidence — see "Trust status vs. evaluation status" below.

## Per-program statuses
`eligible` (all requirements met), `conditionally_eligible` (met except supplementals/graduation-requirement pending), `missing_requirements` (at least one `missing_course`/`below_minimum`), `needs_review` (a load-bearing requirement is stale/needs_review, so we don't assert an answer either way).

## Trust status vs. evaluation status
These are two different axes and both matter:
- **Evaluation status** — does *this student's profile* satisfy *this rule*.
- **Trust status** (`program_requirements.status`: `verified`/`needs_review`/`stale`) — how much confidence to place in the rule itself, based on `source_snapshots.verified_at` vs. `expires_at`.

A student can be "met" on a stale rule — the UI shows the met/missing result **and** a `StaleWarning` saying the requirement needs re-verification before they rely on it. We never silently drop or hide a stale rule; we flag it.

## AI's job (and what it may never do)
`src/lib/ai/provider.ts` takes the structured evaluation + action-engine output and asks a model to phrase it as prose ("Pre-Calculus appears to be your highest-leverage priority because three saved programs require it"). The server-side system prompt (in `anthropic-provider.ts`/`openai-provider.ts`) explicitly instructs the model:
- it is not the authority on admissions requirements and must never invent one,
- it must never contradict the structured result it was given,
- it must never state or imply an admission probability,
- it must say so plainly when the underlying data is stale/needs_review,
- it must not tell a student to guarantee-of-outcome language ("you will get in") — see `CLAUDE.md` §84 language rules.

If no AI key is configured, `fallback-provider.ts` generates the same category of sentence from a template driven by the action-engine's own ranked output — the product's core value never depends on an AI key existing.

## Testing
Every operator has unit tests in `tests/unit/eligibility/` covering: met, missing, planned, in-progress, unknown-grade, below-minimum, at-minimum, above-minimum, `ANY_OF` success/fail, `AT_LEAST_N` success/fail, average success/fail, stale, needs-review, supplemental-required, and a program with multiple simultaneous requirements (partial + full eligibility). See `docs/TESTING.md`.
