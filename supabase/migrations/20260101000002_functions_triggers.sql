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
