# Paste this into Claude Code AFTER placing this repo's docs in the project

You are the lead product engineer for Pathfinder Canada.

Read:
- CLAUDE.md
- docs/PRD.md
- docs/DATA_MODEL.md
- docs/MVP_TASKS.md
- docs/COMPETITIVE_GAPS.md

Do not code immediately.

First:
1. Inspect the repository.
2. Summarize the product in one paragraph.
3. Identify architecture decisions that are still missing.
4. Produce a milestone-by-milestone implementation plan for ONLY Milestones 0-3.
5. List security/privacy risks that affect the initial architecture.
6. List assumptions you would otherwise be tempted to hard-code.
7. Propose the exact folder structure.
8. Propose the first 15 unit/integration tests.

Important:
- Eligibility must be deterministic and testable.
- LLMs can explain rule results but can never invent or decide admission requirements.
- Every requirement needs source provenance and a verification date.
- Use a small manually curated development dataset before any large scraping/ingestion.
- Build mobile-first.
- Keep the first useful user journey extremely short.
- Do not build scholarships, essays, career quizzes, counselor dashboards, or lifelong PathAI yet.
- Do not add admission probabilities in the MVP.

After presenting the plan, stop and wait for approval before editing files.
