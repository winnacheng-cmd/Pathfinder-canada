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
-- Pathfinder Canada — role helper + signup trigger
--
-- Admin bootstrapping note: ADMIN_EMAILS is a Next.js env var, not something
-- Postgres can read. Rather than plumbing it into a database GUC setting,
-- the trigger below always creates a plain 'student' profile row, and the
-- application's signup server action (src/features/auth) checks ADMIN_EMAILS
-- server-side and promotes the row via the service-role client if it matches.
-- Every authorization check downstream reads profiles.role, never the env var.

create or replace function is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = uid and role = 'admin'
  );
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, role) values (new.id, 'student');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on student_profiles;
create trigger set_updated_at before update on student_profiles
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on courses;
create trigger set_updated_at before update on courses
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on student_courses;
create trigger set_updated_at before update on student_courses
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on institutions;
create trigger set_updated_at before update on institutions
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on programs;
create trigger set_updated_at before update on programs
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on program_requirements;
create trigger set_updated_at before update on program_requirements
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on scenarios;
create trigger set_updated_at before update on scenarios
  for each row execute function set_updated_at();
-- Pathfinder Canada — Row Level Security
-- Every student-owned table is scoped to its owner via auth.uid().
-- Catalog tables are public-read, admin-write. Admins do NOT get blanket
-- read access to student academic data — see docs/DATABASE.md.

alter table profiles enable row level security;
alter table student_profiles enable row level security;
alter table courses enable row level security;
alter table student_courses enable row level security;
alter table institutions enable row level security;
alter table programs enable row level security;
alter table source_snapshots enable row level security;
alter table program_requirements enable row level security;
alter table supplemental_requirements enable row level security;
alter table saved_programs enable row level security;
alter table evaluations enable row level security;
alter table scenarios enable row level security;
alter table feedback enable row level security;
alter table admin_audit_log enable row level security;

-- profiles: read own row or any row if admin. Role changes are service-role
-- only (no client UPDATE policy) to prevent self-promotion to admin.
create policy "profiles_select_self_or_admin" on profiles
  for select using (id = auth.uid() or is_admin(auth.uid()));

-- student_profiles: fully owner-scoped
create policy "student_profiles_all_own" on student_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- student_courses: owner-scoped via student_profiles
create policy "student_courses_all_own" on student_courses
  for all using (
    student_profile_id in (select id from student_profiles where user_id = auth.uid())
  ) with check (
    student_profile_id in (select id from student_profiles where user_id = auth.uid())
  );

-- saved_programs: owner-scoped
create policy "saved_programs_all_own" on saved_programs
  for all using (
    student_profile_id in (select id from student_profiles where user_id = auth.uid())
  ) with check (
    student_profile_id in (select id from student_profiles where user_id = auth.uid())
  );

-- evaluations: owner-scoped (read/write from the student's own session; the
-- domain engine recomputes on read regardless of what's cached here)
create policy "evaluations_all_own" on evaluations
  for all using (
    student_profile_id in (select id from student_profiles where user_id = auth.uid())
  ) with check (
    student_profile_id in (select id from student_profiles where user_id = auth.uid())
  );

-- scenarios: owner-scoped
create policy "scenarios_all_own" on scenarios
  for all using (
    student_profile_id in (select id from student_profiles where user_id = auth.uid())
  ) with check (
    student_profile_id in (select id from student_profiles where user_id = auth.uid())
  );

-- catalog tables: public read, admin write
create policy "courses_select_all" on courses for select using (true);
create policy "courses_write_admin" on courses for insert with check (is_admin(auth.uid()));
create policy "courses_update_admin" on courses for update using (is_admin(auth.uid()));
create policy "courses_delete_admin" on courses for delete using (is_admin(auth.uid()));

create policy "institutions_select_all" on institutions for select using (true);
create policy "institutions_write_admin" on institutions for insert with check (is_admin(auth.uid()));
create policy "institutions_update_admin" on institutions for update using (is_admin(auth.uid()));
create policy "institutions_delete_admin" on institutions for delete using (is_admin(auth.uid()));

create policy "programs_select_all" on programs for select using (true);
create policy "programs_write_admin" on programs for insert with check (is_admin(auth.uid()));
create policy "programs_update_admin" on programs for update using (is_admin(auth.uid()));
create policy "programs_delete_admin" on programs for delete using (is_admin(auth.uid()));

create policy "source_snapshots_select_all" on source_snapshots for select using (true);
create policy "source_snapshots_write_admin" on source_snapshots for insert with check (is_admin(auth.uid()));
create policy "source_snapshots_update_admin" on source_snapshots for update using (is_admin(auth.uid()));
create policy "source_snapshots_delete_admin" on source_snapshots for delete using (is_admin(auth.uid()));

create policy "program_requirements_select_all" on program_requirements for select using (true);
create policy "program_requirements_write_admin" on program_requirements for insert with check (is_admin(auth.uid()));
create policy "program_requirements_update_admin" on program_requirements for update using (is_admin(auth.uid()));
create policy "program_requirements_delete_admin" on program_requirements for delete using (is_admin(auth.uid()));

create policy "supplemental_requirements_select_all" on supplemental_requirements for select using (true);
create policy "supplemental_requirements_write_admin" on supplemental_requirements for insert with check (is_admin(auth.uid()));
create policy "supplemental_requirements_update_admin" on supplemental_requirements for update using (is_admin(auth.uid()));
create policy "supplemental_requirements_delete_admin" on supplemental_requirements for delete using (is_admin(auth.uid()));

-- feedback: any authenticated user can report; only admins can read/triage
create policy "feedback_insert_own" on feedback
  for insert with check (user_id = auth.uid() or user_id is null);
create policy "feedback_select_admin" on feedback
  for select using (is_admin(auth.uid()));
create policy "feedback_update_admin" on feedback
  for update using (is_admin(auth.uid()));

-- admin_audit_log: admin-only, both read and write
create policy "admin_audit_log_select_admin" on admin_audit_log
  for select using (is_admin(auth.uid()));
create policy "admin_audit_log_insert_admin" on admin_audit_log
  for insert with check (is_admin(auth.uid()));
-- Billing foundation — inert until Stripe keys are configured. See
-- docs/ARCHITECTURE.md and README.md "Billing". Nothing in the product is
-- paywalled in the MVP; this only tracks the one-time Application Plan
-- unlock so the UI can show accurate status once Stripe is connected.

create table if not exists billing_entitlements (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null unique references student_profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'application_plan', 'premium')),
  stripe_customer_id text,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_billing_entitlements_profile on billing_entitlements(student_profile_id);

drop trigger if exists set_updated_at on billing_entitlements;
create trigger set_updated_at before update on billing_entitlements
  for each row execute function set_updated_at();

alter table billing_entitlements enable row level security;

-- Students can read their own entitlement; only the service role (used by
-- the Stripe webhook handler) can write it — never client-writable, since a
-- forged client write would grant free entitlements.
create policy "billing_entitlements_select_own" on billing_entitlements
  for select using (
    student_profile_id in (select id from student_profiles where user_id = auth.uid())
  );
