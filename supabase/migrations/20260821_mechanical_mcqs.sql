create table if not exists public.mechanical_mcqs (
  id uuid primary key default gen_random_uuid(),
  question text,
  image_url text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  correct_answer text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.mechanical_results (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade,
  mcq_id uuid not null references public.mechanical_mcqs(id) on delete cascade, selected_option text not null,
  is_correct boolean not null, time_taken integer not null check (time_taken >= 0), created_at timestamptz not null default now()
);
alter table public.mechanical_mcqs enable row level security;
alter table public.mechanical_results enable row level security;
drop policy if exists "Authenticated users read mechanical MCQs" on public.mechanical_mcqs;
create policy "Authenticated users read mechanical MCQs" on public.mechanical_mcqs for select to authenticated using (true);
drop policy if exists "Users read own mechanical results" on public.mechanical_results;
create policy "Users read own mechanical results" on public.mechanical_results for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users create own mechanical results" on public.mechanical_results;
create policy "Users create own mechanical results" on public.mechanical_results for insert to authenticated with check (auth.uid() = user_id);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('mechanical-mcqs', 'mechanical-mcqs', false, 5242880, array['image/jpeg','image/png','image/webp']) on conflict (id) do nothing;
drop policy if exists "Authenticated users read mechanical images" on storage.objects;
create policy "Authenticated users read mechanical images" on storage.objects for select to authenticated using (bucket_id = 'mechanical-mcqs');
