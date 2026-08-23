-- Dedicated image-based Non-Verbal Intelligence question bank.
create table if not exists public.non_verbal_mcqs (
  id uuid primary key default gen_random_uuid(),
  question text,
  image_url text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  correct_answer text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.non_verbal_mcqs
  add column if not exists question text;
create table if not exists public.non_verbal_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  mcq_id uuid not null references public.non_verbal_mcqs(id) on delete cascade,
  selected_option text not null,
  is_correct boolean not null,
  time_taken integer not null check (time_taken >= 0),
  created_at timestamptz not null default now()
);
create index if not exists non_verbal_results_user_idx on public.non_verbal_results(user_id, created_at desc);
alter table public.non_verbal_mcqs enable row level security;
alter table public.non_verbal_results enable row level security;
drop policy if exists "Authenticated users read non-verbal MCQs" on public.non_verbal_mcqs;
create policy "Authenticated users read non-verbal MCQs" on public.non_verbal_mcqs for select to authenticated using (true);
drop policy if exists "Users create own profile" on public.users;
create policy "Users create own profile" on public.users for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Users update own profile" on public.users;
create policy "Users update own profile" on public.users for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Users read own non-verbal results" on public.non_verbal_results;
create policy "Users read own non-verbal results" on public.non_verbal_results for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users create own non-verbal results" on public.non_verbal_results;
create policy "Users create own non-verbal results" on public.non_verbal_results for insert to authenticated with check (auth.uid() = user_id);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('non-verbal-mcqs', 'non-verbal-mcqs', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "Authenticated users read non-verbal images" on storage.objects;
drop policy if exists "Admins manage non-verbal images" on storage.objects;

create policy "Authenticated users read non-verbal images" on storage.objects for select to authenticated using (bucket_id = 'non-verbal-mcqs');
create policy "Admins manage non-verbal images" on storage.objects for all to authenticated using (bucket_id = 'non-verbal-mcqs' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')) with check (bucket_id = 'non-verbal-mcqs' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
