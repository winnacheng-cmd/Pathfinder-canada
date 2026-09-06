# Data Verification

## Why this document exists
Pathfinder's core promise is that every requirement is traceable to an official source with a verification date. That promise is only as good as the discipline behind populating the data. This document is the policy; `docs/ADMISSIONS_RULES.md` is the mechanism.

## Rule for the MVP seed data
`src/lib/seed-data.ts` contains **fictional development data** — invented institutions ("Cascade University", "Harborview University", "Northern Ridge University"), invented programs, and placeholder source URLs. It is not scraped, not AI-recalled, and not presented as real official requirements anywhere in the UI. A "Sample data — not verified official requirements" indicator (`src/components/SampleDataBadge`, or equivalent) appears wherever seed program data is shown, and this file is the canonical explanation of why.

This is a deliberate choice, not a shortcut: the alternative — an AI populating requirements from model memory and labeling them as real — is explicitly prohibited by `CLAUDE.md` §26 ("do not silently populate production data from model memory") and is a much worse failure mode than clearly-labeled fictional data, because a wrong real-looking number can cause real harm to a student's plan.

The seed data still deliberately includes one `verified`, one `needs_review`, and one `stale` requirement (trust-status field), so the trust-badge UI is fully exercisable even though none of it is real. This is a demonstration of the *mechanism*, not a claim about the *content*.

## Rule for any future real data
Before a `program_requirements` row can be marked `verified`, an admin must (workflow enforced by `src/features/admin`):
1. Open the actual official university/government admissions page.
2. Record the exact `source_url` and an excerpt of the relevant text in a `source_snapshots` row.
3. Set `verified_by` (reviewer name/id) and `verified_at`.
4. Set an `expires_at`/recheck date — requirements are never assumed permanent.
5. Enter the rule as structured JSON and use the admin rule-preview ("Student must have Chemistry 12 with at least 90%") to sanity-check it against the source text before saving.

**Never acceptable as the authority for a formal requirement:** blogs, Reddit, admissions-consultant pages, or AI-generated summaries. Those may inform *strategic* guidance later but never a `program_requirements` row's rule content.

## Freshness
If `source_snapshots.expires_at` passes, the linked requirement's `status` should be treated as `stale` (a scheduled job or an on-read check — not yet automated in the MVP; the admin verification queue surfaces requirements approaching or past expiration for manual re-verification). A stale requirement is still shown to the student, wrapped in a visible warning — never silently hidden, never presented with full confidence.

## Corrections
Every program detail view has a "Report an issue" action (`feedback` table, `incorrect_requirement`/`stale_source`/`confusing`/`other` types). This is treated as a product feature, not an afterthought — data-quality reports per 1,000 program views is a tracked metric (see `docs/ROADMAP.md`).
