-- Safe migration for an existing PMA Supabase project.
-- This preserves existing users and content. Run this file instead of rerunning schema.sql.

create extension if not exists "pgcrypto";

alter table public.users add column if not exists role text not null default 'user';
alter table public.users add column if not exists enrolled_course text not null default 'PMA Initial';
alter table public.users add column if not exists progress numeric(5,2) not null default 0;
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists preferences jsonb not null default '{"language":"en","weekly_goal":5}'::jsonb;
alter table public.users add column if not exists premium_status boolean not null default false;

do $$ begin
  create type public.mcq_difficulty as enum ('easy', 'medium', 'hard');
exception when duplicate_object then null;
end $$;
create table if not exists public.mcqs (
  id uuid primary key default gen_random_uuid(), question text not null, options jsonb not null,
  correct_answer text not null, category text not null, difficulty public.mcq_difficulty not null,
  created_by uuid references public.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.mcqs enable row level security;
drop policy if exists "Authenticated users read MCQs" on public.mcqs;
create policy "Authenticated users read MCQs" on public.mcqs for select to authenticated using (true);

do $$ begin
  create type public.test_type as enum ('MCQ', 'Intelligence', 'Personality', 'WAT', 'Interview');
exception when duplicate_object then null;
end $$;
alter type public.test_type add value if not exists 'Intelligence';
alter type public.test_type add value if not exists 'Personality';
alter type public.test_type add value if not exists 'WAT';
alter type public.test_type add value if not exists 'Interview';
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(), type public.test_type not null, content jsonb not null,
  time_limit integer not null check (time_limit > 0), is_premium boolean not null default false, created_at timestamptz not null default now()
);
alter table public.tests enable row level security;
drop policy if exists "Authenticated users read allowed tests" on public.tests;
create policy "Authenticated users read allowed tests" on public.tests for select to authenticated using (
  not is_premium or exists (select 1 from public.users u where u.id = auth.uid() and u.premium_status)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(), category text not null, text_content text not null,
  language text not null default 'en', is_premium boolean not null default false, created_at timestamptz not null default now()
);
alter table public.notes add column if not exists title text;
alter table public.notes add column if not exists file_url text;
alter table public.notes add column if not exists access_type text not null default 'free';
alter table public.notes add column if not exists uploaded_by uuid references public.users(id) on delete set null;
alter table public.notes enable row level security;
drop policy if exists "Authenticated users read allowed notes" on public.notes;
create policy "Authenticated users read allowed notes" on public.notes for select to authenticated using (
  not is_premium or exists (select 1 from public.users u where u.id = auth.uid() and u.premium_status)
);

create table if not exists public.wat (
  id uuid primary key default gen_random_uuid(), word text not null, display_seconds integer not null default 10,
  sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.sct (
  id uuid primary key default gen_random_uuid(), sentence text not null, language text not null default 'en', display_seconds integer not null default 18,
  sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.tat (
  id uuid primary key default gen_random_uuid(), image_path text not null, observe_seconds integer not null default 30,
  write_seconds integer not null default 210, sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.self_description (
  id uuid primary key default gen_random_uuid(), prompt text not null, display_seconds integer not null default 300,
  sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.group_planning (
  id uuid primary key default gen_random_uuid(), title text not null, statement text not null, rules text, map_path text,
  time_limit integer not null default 600, sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.command_tasks (
  id uuid primary key default gen_random_uuid(), title text not null, statement text not null, rules text,
  time_limit integer not null default 300, sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.group_tasks (
  id uuid primary key default gen_random_uuid(), title text not null, statement text not null, rules text, diagram_path text,
  time_limit integer not null default 600, sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.individual_obstacles (
  id uuid primary key default gen_random_uuid(), title text not null, statement text not null, rules text, image_path text,
  time_limit integer not null default 120, sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gto-assets', 'gto-assets', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('notes-pdfs', 'notes-pdfs', false, 15728640, array['application/pdf'])
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('psychology-images', 'psychology-images', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Seed one visible MCQ only when the table is empty.
insert into public.mcqs (question, options, correct_answer, category, difficulty)
select 'Complete the series: 2, 4, 8, 16, ?', '{"A":"24","B":"30","C":"32","D":"36"}'::jsonb, 'C', 'Math', 'easy'::public.mcq_difficulty
where not exists (select 1 from public.mcqs);
