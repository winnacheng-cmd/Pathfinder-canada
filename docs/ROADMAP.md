# Roadmap

## Phase 1 — this build (Canadian academic decision engine)
Profile → target programs → rule-by-rule eligibility → missing requirements → prioritized actions → what-if scenarios → sources. British Columbia Graduation Program courses; architecture supports adding provinces without a schema rewrite (province/curriculum are already columns on `courses` and `student_profiles`, not hard-coded).

## Phase 2 — after MVP usage proves trust (not built now)
- Scholarships: matching, deadlines, amounts, source provenance (same trust model as program requirements).
- Deadlines/calendar integrated with the action plan.
- Extracurricular *exploration* suggestions — explicitly not fabricated requirements ("Dentistry requires 100 volunteer hours" is never something Pathfinder invents; if no official requirement is published, say so and offer genuine-exploration ideas instead).
- Optional AI advisor grounded only in Pathfinder's own structured data + official sources — not a general chatbot.
- Outcome feedback (applied/admitted/waitlisted/rejected/enrolled), captured only with explicit consent, as the seed of a future calibrated model (see "Phase 5" below) — not built or collected in the MVP.

## Phase 3 — school/counselor model (not built now)
Counselor dashboard, caseload overview, missing-prerequisite alerts, school-wide pathway reports, org-level roles, annual licensing. The student-facing product must stay useful without a school contract — architecture avoids anything that would make multi-tenant orgs impossible later (e.g., `student_profiles` isn't hard-wired to a single implicit tenant), but no counselor UI exists yet.

## Phase 4 — PathAI (career guidance), not built now
Explorer / Advisor / Planner / Challenge Me modes, cross-year planning, periodic goal re-evaluation. Governing principle carried forward from day one: **prediction must not become destiny**. If a future model ever estimates that a demographic pattern correlates with lower entry into a field, the product must never use that to steer similar students away from it. Any future system here must distinguish current probability, potential, aspiration, barriers, and the actions that actually change outcomes — and must not collect the sensitive attributes (income, ethnicity, etc.) that would be needed to even compute such a correlation, since the MVP schema deliberately excludes them (`docs/PRIVACY.md`).

## Phase 5 — outcomes & calibrated prediction, not built now
Only if enough students voluntarily opt in to report outcomes. Any future probability display must show uncertainty, disclose data coverage, be calibrated, undergo bias analysis, and never imply certainty or destiny. Explicitly not implemented, not even a stub, in this build — the MVP's whole trust proposition rests on *not* doing fake-precision chancing (`docs/PRODUCT.md` rule 4).

## Explainability commitment (future AI features)
If a future recommendation model ever makes a non-obvious decision, its explanation must be faithful to the actual reasoning, not a simple story invented after the fact. If the real reason is uncertain, the product must say so rather than fabricate a clean narrative.
