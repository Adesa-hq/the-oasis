begin;
create table public.early_access_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  phone text not null check (phone ~ '^\+?[0-9]{7,15}$'),
  email text not null check (email = lower(btrim(email)) and char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'),
  registered_at timestamptz not null default now(),
  constraint early_access_email_unique unique (email)
);
alter table public.early_access_registrations enable row level security;
-- Only server-side service-role requests and authorized Supabase project administrators.
-- No public or authenticated-user policies are intentionally created.
revoke all on public.early_access_registrations from anon, authenticated, service_role;
grant select, insert on public.early_access_registrations to service_role;
create index early_access_registered_at_idx on public.early_access_registrations (registered_at desc);
commit;
