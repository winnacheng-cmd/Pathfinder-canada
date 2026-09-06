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
