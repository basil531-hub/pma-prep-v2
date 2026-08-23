create table if not exists public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 5 and 180),
  subject text not null check (char_length(subject) between 3 and 160),
  message text not null check (char_length(message) between 20 and 3000),
  status text not null default 'new' check (status in ('new','in_progress','resolved','spam')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_enquiries_status_created_idx on public.contact_enquiries(status,created_at desc);
alter table public.contact_enquiries enable row level security;
-- The public form writes through a validated server action using the service role.
-- No anonymous table policy is intentionally created; only administrators can read records.
