-- Pathfinder Canada — core schema
-- Applies in order after 000000 (none) — see README.md for how to run this.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ============================================================
-- profiles: role table, separate from academic data (privacy)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'admin', 'reviewer')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- student_profiles: academic profile, separate from auth identity
-- ============================================================
create table if not exists student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  province text not null,
  curriculum text not null,
  grade_level text not null check (grade_level in ('grade_11', 'grade_12', 'graduated_upgrading')),
  graduation_year int not null check (graduation_year between 2020 and 2100),
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_student_profiles_user_id on student_profiles(user_id);

-- ============================================================
-- courses: canonical catalog, province/curriculum scoped
-- ============================================================
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  province text not null,
  curriculum text not null,
  code text not null,
  name text not null,
  grade_level text not null check (grade_level in ('10', '11', '12')),
  subject_group text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (province, curriculum, code)
);

create index if not exists idx_courses_province_curriculum on courses(province, curriculum);
create index if not exists idx_courses_name_trgm on courses using gin (name gin_trgm_ops);

-- ============================================================
-- student_courses: a student's course + status + grade
-- ============================================================
create table if not exists student_courses (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references student_profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete restrict,
  status text not null check (status in ('completed', 'in_progress', 'planned')),
  grade_percent numeric check (grade_percent between 0 and 100),
  predicted_grade_percent numeric check (predicted_grade_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_profile_id, course_id)
);

create index if not exists idx_student_courses_profile on student_courses(student_profile_id);

-- ============================================================
-- institutions
-- ============================================================
create table if not exists institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text not null,
  city text,
  country text not null default 'Canada',
  official_url text not null,
  logo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_institutions_name_trgm on institutions using gin (name gin_trgm_ops);

-- ============================================================
-- programs
-- ============================================================
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id) on delete cascade,
  name text not null,
  credential text not null,
  faculty text,
  campus text,
  subject_area text not null check (subject_area in (
    'Health Sciences', 'Business', 'Engineering', 'Computer Science',
    'Arts', 'Sciences', 'Education', 'Undecided'
  )),
  intake_year int not null,
  application_url text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_programs_institution on programs(institution_id);
create index if not exists idx_programs_subject_area on programs(subject_area);
create index if not exists idx_programs_name_trgm on programs using gin (name gin_trgm_ops);

-- ============================================================
-- source_snapshots: provenance for every requirement
-- ============================================================
create table if not exists source_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  official_domain text not null,
  page_title text not null,
  captured_text_excerpt text,
  verified_by text,
  verified_at date not null,
  expires_at date,
  source_hash text,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- program_requirements: structured deterministic rules
-- ============================================================
create table if not exists program_requirements (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  requirement_type text not null check (requirement_type in (
    'required_course', 'course_minimum', 'overall_average_minimum',
    'choose_n_from_group', 'graduation_requirement', 'supplemental',
    'language', 'notes'
  )),
  rule_json jsonb not null,
  display_text text not null,
  source_snapshot_id uuid references source_snapshots(id),
  effective_cycle text not null,
  status text not null default 'needs_review' check (status in ('verified', 'needs_review', 'stale')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verified_requires_source check (status <> 'verified' or source_snapshot_id is not null)
);

create index if not exists idx_program_requirements_program on program_requirements(program_id);
create index if not exists idx_program_requirements_status on program_requirements(status);

-- ============================================================
-- supplemental_requirements
-- ============================================================
create table if not exists supplemental_requirements (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  type text not null check (type in (
    'personal_profile', 'supplementary_application', 'interview', 'portfolio', 'audition'
  )),
  required boolean not null default true,
  title text not null,
  description text,
  deadline date,
  source_snapshot_id uuid references source_snapshots(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_supplemental_requirements_program on supplemental_requirements(program_id);

-- ============================================================
-- saved_programs
-- ============================================================
create table if not exists saved_programs (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references student_profiles(id) on delete cascade,
  program_id uuid not null references programs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_profile_id, program_id)
);

create index if not exists idx_saved_programs_profile on saved_programs(student_profile_id);
create index if not exists idx_saved_programs_program on saved_programs(program_id);

-- ============================================================
-- evaluations: audit/cache only — engine always recomputes from source rules
-- ============================================================
create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references student_profiles(id) on delete cascade,
  program_id uuid not null references programs(id) on delete cascade,
  result text not null check (result in ('eligible', 'missing', 'needs_review')),
  result_json jsonb not null,
  evaluated_at timestamptz not null default now(),
  rules_version text not null
);

create index if not exists idx_evaluations_profile on evaluations(student_profile_id);

-- ============================================================
-- scenarios: saved what-if scenarios
-- ============================================================
create table if not exists scenarios (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references student_profiles(id) on delete cascade,
  name text not null,
  scenario_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_scenarios_profile on scenarios(student_profile_id);

-- ============================================================
-- feedback: data-quality reports
-- ============================================================
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  program_id uuid references programs(id) on delete set null,
  feedback_type text not null check (feedback_type in (
    'incorrect_requirement', 'stale_source', 'confusing', 'feature_request', 'other'
  )),
  body text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_feedback_status on feedback(status);

-- ============================================================
-- admin_audit_log: tracks admin edits to requirements/catalog
-- ============================================================
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null check (action in ('create', 'update', 'delete')),
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_log_entity on admin_audit_log(entity_type, entity_id);
