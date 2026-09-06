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
