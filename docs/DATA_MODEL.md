# Data Model

## Core entities

### User
- id
- email
- created_at
- deleted_at

### StudentProfile
- id
- user_id
- province
- grade_level
- graduation_year
- curriculum
- created_at
- updated_at

### Course
Canonical high-school course catalog.
- id
- province
- curriculum
- code
- name
- grade_level
- subject_group

### StudentCourse
- id
- student_profile_id
- course_id
- status: completed | in_progress | planned
- grade_percent nullable
- predicted_grade_percent nullable

### Institution
- id
- name
- province
- official_url

### Program
- id
- institution_id
- name
- credential
- faculty
- campus
- intake_year
- application_url
- active

### ProgramRequirement
Structured deterministic rule.
- id
- program_id
- requirement_type
- rule_json
- display_text
- source_snapshot_id
- effective_cycle
- status: verified | needs_review | stale

Suggested requirement types:
- required_course
- course_minimum
- overall_average_minimum
- choose_n_from_group
- graduation_requirement
- supplemental
- language
- notes

### SourceSnapshot
- id
- source_url
- official_domain
- page_title
- captured_text_excerpt
- verified_by
- verified_at
- expires_at
- source_hash

### SupplementalRequirement
- id
- program_id
- type
- required
- deadline
- source_snapshot_id

### SavedProgram
- id
- student_profile_id
- program_id
- created_at

### Evaluation
Cache/audit trail only; source of truth is rules + profile.
- id
- student_profile_id
- program_id
- result: eligible | missing | needs_review
- result_json
- evaluated_at
- rules_version

### ActionRecommendation
- id
- student_profile_id
- program_id nullable
- action_type
- priority
- title
- explanation
- basis_json
- source_snapshot_id nullable

### Feedback
- id
- user_id
- program_id nullable
- type: incorrect_requirement | stale_source | confusing | feature_request
- body
- created_at

## Rule JSON examples

Required course:
```json
{
  "courseCodes": ["PREC12"],
  "operator": "ANY_OF",
  "minimumGrade": 80
}
```

Choose two:
```json
{
  "operator": "AT_LEAST_N",
  "n": 2,
  "courseCodes": ["CHEM12", "PHYS12", "BIOL12"]
}
```

Overall minimum:
```json
{
  "operator": "AVERAGE_OF_SELECTED",
  "courseCodes": ["ENG12", "PREC12", "CHEM12", "BIOL12"],
  "minimum": 85
}
```

## Architecture rule
The LLM NEVER decides whether the student satisfies these rules.
A pure TypeScript evaluator does.
The LLM may only turn the evaluator output into clearer natural-language explanations.
