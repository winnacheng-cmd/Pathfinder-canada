# Product Requirements Document — Pathfinder Canada

## 1. Product thesis
Canadian students can already find admission requirements, career quizzes, scholarship databases, and school-planning tools. The gap is the decision layer:

> "Given MY actual courses and grades, what can I apply to, what am I missing, and what should I do next?"

Pathfinder should transform scattered official information into a personalized, explainable action plan.

## 2. Initial user
Primary:
- Canadian Grade 11 and Grade 12 student
- begins with British Columbia, then Ontario
- applying to Canadian undergraduate programs
- wants to know prerequisites, minimums, competitiveness context, and next actions

Secondary later:
- parents
- guidance counsellors
- schools/districts

## 3. Core jobs-to-be-done
1. "Tell me whether I meet the published requirements."
2. "Show me exactly why I do or do not qualify."
3. "Tell me what I can still change."
4. "Let me test scenarios before I change courses."
5. "Show me alternative programs that stay open."
6. "Show me the official source so I can verify it myself."

## 4. MVP user flow
### Step A — profile
Collect:
- province
- current grade
- expected graduation year
- curriculum type
- courses completed/in progress/planned
- grades or predicted grades
- optional broad interests

### Step B — target programs
Search and save programs by:
- university
- program name
- province
- subject area

### Step C — match
For each saved program show:
- ELIGIBLE / MISSING REQUIREMENT / NEEDS REVIEW
- required courses and whether each is satisfied
- minimum grade rules
- overall average rule if officially published
- supplemental requirements
- important notes
- source links
- last verified date

### Step D — action plan
Generate prioritized actions from structured rules:
Examples:
- "English Studies 12 is required and is not currently in your plan."
- "Your Chemistry 12 grade is 87%; this program publishes a 90% subject minimum."
- "Adding Physics 12 would open Programs A, B, and C."
- "This program has a supplemental application; add its deadline to your checklist."

The action plan must distinguish official facts from strategy suggestions.

### Step E — what-if simulator
Allow user to clone their profile and change:
- a course
- a grade
- planned vs completed status

Immediately recompute:
- eligible programs
- newly opened programs
- programs lost
- requirements still missing

Example:
"What changes if Pre-Calculus 12 goes from 84% to 90%?"

## 5. MVP pages
- Landing page
- Sign up / login
- Onboarding
- Dashboard
- My Courses & Grades
- Program Search
- Program Detail
- My Target Programs
- Eligibility Results
- Action Plan
- What-If Simulator
- Settings / privacy / delete account
- Internal Admin: programs, rules, sources, verification dates

## 6. Do NOT build in MVP
- opaque admission probability percentages
- essay rewriting
- scholarship matching
- personality tests
- volunteer marketplace
- direct university application submission
- counselor/school dashboard
- chat-based lifelong career guidance
- automated scraping of every Canadian university
- social feed/community
- gamification

## 7. Phase 2
Once MVP usage proves students return and trust the results:
- scholarship matching
- deadlines/calendar
- extracurricular opportunity suggestions
- application checklist
- optional AI advisor grounded only in Pathfinder data + official sources
- application-writing coach that gives feedback rather than fabricating achievements
- outcome feedback ("I applied / accepted / rejected") to build future evidence

## 8. Phase 3 — school model
Add:
- counselor dashboard
- caseload overview
- students missing prerequisites
- alerts for deadlines/missing courses
- school-wide pathway reports
- admin roles and permissions
- annual school contracts

The student-facing product should remain useful without a school contract.

## 9. Phase 4 — PathAI
Only after trust, data governance, and product-market fit:
- career exploration modes: Explorer / Advisor / Planner / Challenge Me
- cross-year planning
- periodic re-evaluation of goals
- aspiration layer so historical probability never becomes destiny
- uncertainty/explanation layer
- strong child/privacy governance

## 10. Product differentiation
The experience should feel like:
- less "take this personality quiz"
- less "browse 200 pages"
- less "here is a magical 73% chance"
- more "here is your exact situation and the next decision that changes it"

## 11. Trust design
Every important result must be inspectable:
- Source: official university/government page
- Verified: YYYY-MM-DD
- Requirement text: normalized structured rule
- Interpretation: what the rule means for this student
- Confidence: VERIFIED / NEEDS HUMAN REVIEW / STALE

If a source is stale or ambiguous, say so instead of guessing.

## 12. Monetization experiments
Do not lock core requirement checking behind a paywall initially.

Test:
- Free: profile + eligibility + limited targets
- Paid one-time "Application Plan": detailed prioritized strategy/export
- Premium later: unlimited targets, deadlines, scholarships, scenario history, AI grounded advisor
- B2B school contracts later

Never use high-pressure sales, fake scarcity, hidden pricing, or guarantees of acceptance/scholarships.

## 13. North-star metrics
Early:
- % onboarding users who add >=3 target programs
- % who run >=1 what-if simulation
- % who click official sources
- % returning within 14 days
- user-reported "I know what to do next"
- number of corrections reported per 1,000 program views

Later:
- paid conversion
- application-plan completion
- school pilots
- verified program-data freshness

## 14. MVP acceptance criteria
A BC Grade 11/12 student can:
1. enter a realistic course/grade profile,
2. save at least 5 seeded Canadian programs,
3. see correct rule-by-rule eligibility,
4. see missing prerequisites,
5. run a what-if grade/course scenario,
6. receive an action plan,
7. open the official source for every rule,
8. see when each requirement was verified,
9. delete their account/data.
