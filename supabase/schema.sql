-- Run this entire file in Supabase SQL Editor only on a new project.
-- For an existing project, run supabase/migrations/20260820_content_managers.sql instead.
create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  enrolled_course text not null default 'PMA Initial' check (enrolled_course in ('PMA Initial', 'ISSB')),
  progress numeric(5,2) not null default 0 check (progress >= 0 and progress <= 100),
  avatar_url text,
  preferences jsonb not null default '{"language":"en","weekly_goal":5}'::jsonb,
  premium_status boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(), title text not null unique,
  description text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.lessons (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
  title text not null, type text not null check (type in ('MCQ', 'Test', 'Task', 'Note')),
  content jsonb not null default '{}'::jsonb, sort_order integer not null default 0, created_at timestamptz not null default now()
);
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
create policy "Authenticated users read courses" on public.courses for select to authenticated using (true);
create policy "Authenticated users read lessons" on public.lessons for select to authenticated using (true);
insert into public.courses (title, description) values
('PMA Initial', 'Academic, intelligence and personality preparation for the initial assessment.'),
('ISSB', 'Psychological, GTO and interview preparation for ISSB.')
on conflict (title) do nothing;

create type public.mcq_difficulty as enum ('easy', 'medium', 'hard');
create table public.mcqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  correct_answer text not null,
  category text not null check (category in ('Math', 'English', 'GK', 'Psychology')),
  difficulty public.mcq_difficulty not null,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mcqs_options_are_object check (jsonb_typeof(options) = 'object')
);
create index mcqs_category_idx on public.mcqs(category);
create index mcqs_difficulty_idx on public.mcqs(difficulty);
create or replace function public.set_mcqs_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger mcqs_updated_at before update on public.mcqs for each row execute procedure public.set_mcqs_updated_at();

create type public.payment_status as enum ('pending', 'verified', 'rejected');
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  transaction_id text not null unique,
  screenshot_url text not null,
  amount numeric(10,2) not null check (amount > 0),
  plan_code text not null default 'complete' check (plan_code in ('initial', 'issb', 'complete')),
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  text_content text not null,
  language text not null default 'en' check (language in ('en', 'ur')),
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create type public.test_type as enum ('MCQ', 'Intelligence', 'Personality', 'WAT', 'Interview');
create table public.tests (
  id uuid primary key default gen_random_uuid(),
  type public.test_type not null,
  content jsonb not null,
  time_limit integer not null check (time_limit > 0),
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  test_id uuid not null references public.tests(id) on delete cascade,
  score numeric(6,2) not null,
  feedback text,
  created_at timestamptz not null default now()
);

-- Automatically create the public profile requested by the app after signup.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, name, email)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)), new.email);
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.mcqs enable row level security;
alter table public.payments enable row level security;
alter table public.notes enable row level security;
alter table public.tests enable row level security;
alter table public.results enable row level security;

create policy "Users read own profile" on public.users for select using (auth.uid() = id);
create policy "Users create own profile" on public.users for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on public.users for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Authenticated users read MCQs" on public.mcqs for select to authenticated using (true);
create policy "Users read own payments" on public.payments for select using (auth.uid() = user_id);
create policy "Users submit own payments" on public.payments for insert with check (auth.uid() = user_id and status = 'pending');
create policy "Authenticated users read allowed notes" on public.notes for select to authenticated using (
  not is_premium or exists (select 1 from public.users u where u.id = auth.uid() and u.premium_status)
);
create policy "Authenticated users read allowed tests" on public.tests for select to authenticated using (
  not is_premium or exists (select 1 from public.users u where u.id = auth.uid() and u.premium_status)
);
create policy "Users read own results" on public.results for select using (auth.uid() = user_id);
create policy "Users submit own results" on public.results for insert with check (
  auth.uid() = user_id
);

-- Private screenshot bucket. Admin pages create short-lived signed links server-side.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-screenshots', 'payment-screenshots', false, 5000000, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5000000;
create policy "Users upload own payment screenshot" on storage.objects for insert to authenticated
with check (bucket_id = 'payment-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users remove own payment screenshot" on storage.objects for delete to authenticated
using (bucket_id = 'payment-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

-- Starter free and premium content.
insert into public.notes (category, text_content, language, is_premium) values
('ISSB Basics', 'Selection assesses intelligence, personality, teamwork and leadership potential.', 'en', false),
('آئی ایس ایس بی', 'انتخاب میں ذہانت، شخصیت، ٹیم ورک اور قائدانہ صلاحیت دیکھی جاتی ہے۔', 'ur', false),
('Interview', 'Use concise examples that show responsibility, honesty and reflection.', 'en', true);
insert into public.tests (type, content, time_limit, is_premium) values
('MCQ', '{"question":"Complete the series: 2, 4, 8, 16, ?","options":[24,30,32,36],"answer":32}', 30, false),
('WAT', '{"word":"Responsibility","instruction":"Write the first constructive sentence that comes to mind."}', 10, true),
('Interview', '{"question":"Describe a time you led a team through a setback."}', 120, true);

insert into public.tests (type, content, time_limit, is_premium) values
('MCQ', '{"subject":"Math","question":"If 15% of a number is 30, what is the number?","options":[150,180,200,225],"answer":200}', 45, false),
('MCQ', '{"subject":"English","question":"Choose the closest meaning of ''brief''.","options":["Short","Bright","Heavy","Loud"],"answer":"Short"}', 30, false),
('MCQ', '{"subject":"General Knowledge","question":"Which planet is known as the Red Planet?","options":["Venus","Mars","Jupiter","Mercury"],"answer":"Mars"}', 30, false),
('Intelligence', '{"category":"Verbal reasoning","question":"Book is to reading as fork is to:","options":["Writing","Eating","Cutting","Cooking"],"answer":"Eating"}', 35, false),
('Intelligence', '{"category":"Series","question":"Find the next number: 3, 6, 12, 24, ?","options":[36,42,48,54],"answer":48}', 35, false),
('Intelligence', '{"category":"Coding-decoding","question":"If CAT is coded as DBU, how is DOG coded?","options":["EPH","CNE","EOG","FPH"],"answer":"EPH"}', 40, false),
('Intelligence', '{"category":"Non-verbal reasoning","question":"A shape turns 90 degrees clockwise each step. After four steps it faces:","options":["The original direction","Left","Right","Down"],"answer":"The original direction"}', 40, false),
('Personality', '{"statement":"I remain calm and constructive when a team member disagrees with me.","scale":["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"]}', 90, false),
('Personality', '{"statement":"I take responsibility for mistakes and focus on improving the process.","scale":["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"]}', 90, false);

insert into public.notes (category, text_content, language, is_premium) values
('Initial Preparation - Mathematics', 'Revise percentages, ratios, averages, fractions, speed-distance-time and basic algebra. Work without a calculator and estimate first.', 'en', false),
('Initial Preparation - English', 'Build vocabulary through synonyms, antonyms, sentence completion and short reading passages. Read the full sentence before choosing an answer.', 'en', false),
('Initial Preparation - Intelligence', 'For series, compare differences and ratios. For analogies, identify the exact relationship between the first pair before applying it to the second.', 'en', false),
('ابتدائی تیاری - ذہانت', 'سلسلہ وار سوالات میں فرق اور تناسب دیکھیں۔ مماثلت کے سوالات میں پہلے جوڑے کا تعلق سمجھ کر دوسرے جوڑے پر لاگو کریں۔', 'ur', false),
('Initial Preparation - Psychology', 'Answer personality statements honestly and consistently. The goal is self-awareness, not choosing an artificial perfect image.', 'en', false);

-- Learning telemetry and gamification.
create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade,
  test_id uuid references public.tests(id) on delete set null, module text not null, score numeric(6,2) not null,
  completed_at timestamptz not null default now()
);
create table public.daily_activity (
  user_id uuid not null references public.users(id) on delete cascade, activity_date date not null default current_date,
  minutes integer not null default 0, primary key (user_id, activity_date)
);
create table public.badges (
  id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, description text not null,
  icon text not null default 'award'
);
create table public.user_badges (
  user_id uuid not null references public.users(id) on delete cascade, badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(), primary key (user_id, badge_id)
);
create table public.module_events (
  id uuid primary key default gen_random_uuid(), user_id uuid references public.users(id) on delete set null,
  module text not null, event_type text not null, score numeric(6,2), created_at timestamptz not null default now()
);
alter table public.practice_attempts enable row level security;
alter table public.daily_activity enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.module_events enable row level security;
create policy "Users manage own attempts" on public.practice_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own activity" on public.daily_activity for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Everyone reads badges" on public.badges for select using (true);
create policy "Users read own badges" on public.user_badges for select using (auth.uid() = user_id);
create policy "Users create own events" on public.module_events for insert with check (auth.uid() = user_id);
create policy "Users read own events" on public.module_events for select using (auth.uid() = user_id);
insert into public.badges (slug, name, description, icon) values
('psychology-starter', 'Psychology Starter', 'Complete your first psychology test.', 'brain'),
('psychology-master', 'Psychology Master', 'Complete five psychology tests.', 'sparkles'),
('seven-day-streak', 'Seven Day Streak', 'Practice for seven consecutive days.', 'flame')
on conflict (slug) do nothing;

-- PDF Notes Management migration. Existing text notes remain supported; PDF rows use file_url.
do $$ begin create type public.note_access_type as enum ('free', 'premium'); exception when duplicate_object then null; end $$;
alter table public.notes add column if not exists title text;
alter table public.notes add column if not exists file_url text;
alter table public.notes add column if not exists access_type public.note_access_type not null default 'free';
alter table public.notes add column if not exists uploaded_by uuid references public.users(id) on delete set null;
update public.notes set title = coalesce(title, category), access_type = case when is_premium then 'premium'::public.note_access_type else 'free'::public.note_access_type end where title is null;
create or replace function public.sync_note_access_type() returns trigger language plpgsql as $$ begin new.is_premium = (new.access_type = 'premium'); return new; end; $$;
drop trigger if exists notes_access_type_sync on public.notes;
create trigger notes_access_type_sync before insert or update on public.notes for each row execute procedure public.sync_note_access_type();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('notes-pdfs', 'notes-pdfs', false, 15728640, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 15728640, allowed_mime_types = array['application/pdf'];
create policy "Authorized users read PDF notes" on storage.objects for select to authenticated using (
  bucket_id = 'notes-pdfs' and exists (select 1 from public.notes n join public.users u on u.id = auth.uid() where n.file_url = name and (n.access_type = 'free' or u.premium_status))
);
create policy "Admins upload PDF notes" on storage.objects for insert to authenticated with check (
  bucket_id = 'notes-pdfs' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy "Admins delete PDF notes" on storage.objects for delete to authenticated using (
  bucket_id = 'notes-pdfs' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- Psychology projector content. Durations are per item, allowing an instructor
-- to tailor a session without changing the application.
create table public.wat (
  id uuid primary key default gen_random_uuid(), word text not null check (char_length(trim(word)) > 0),
  display_seconds integer not null default 10 check (display_seconds > 0), sort_order integer not null default 0,
  is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.sct (
  id uuid primary key default gen_random_uuid(), sentence text not null check (char_length(trim(sentence)) > 0),
  language text not null check (language in ('en', 'ur')), display_seconds integer not null default 18 check (display_seconds > 0),
  sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.tat (
  id uuid primary key default gen_random_uuid(), image_path text not null, observe_seconds integer not null default 30 check (observe_seconds > 0),
  write_seconds integer not null default 210 check (write_seconds > 0), sort_order integer not null default 0,
  is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.self_description (
  id uuid primary key default gen_random_uuid(), prompt text not null check (char_length(trim(prompt)) > 0),
  display_seconds integer not null default 300 check (display_seconds > 0), sort_order integer not null default 0,
  is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.psychology_participation (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade,
  test_type text not null check (test_type in ('WAT', 'SCT', 'TAT', 'SelfDescription')), started_at timestamptz not null default now(), ended_at timestamptz
);
create index psychology_participation_user_idx on public.psychology_participation(user_id, started_at desc);
alter table public.wat enable row level security; alter table public.sct enable row level security; alter table public.tat enable row level security;
alter table public.self_description enable row level security; alter table public.psychology_participation enable row level security;
create policy "Authenticated users read WAT" on public.wat for select to authenticated using (is_active);
create policy "Authenticated users read SCT" on public.sct for select to authenticated using (is_active);
create policy "Authenticated users read TAT" on public.tat for select to authenticated using (is_active);
create policy "Authenticated users read self descriptions" on public.self_description for select to authenticated using (is_active);
create policy "Users read own psychology participation" on public.psychology_participation for select using (auth.uid() = user_id);
create policy "Users create own psychology participation" on public.psychology_participation for insert with check (auth.uid() = user_id);
create policy "Users finish own psychology participation" on public.psychology_participation for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('psychology-images', 'psychology-images', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880;
create policy "Authenticated users read psychology images" on storage.objects for select to authenticated using (bucket_id = 'psychology-images');
create policy "Admins manage psychology images" on storage.objects for all to authenticated using (bucket_id = 'psychology-images' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')) with check (bucket_id = 'psychology-images' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

-- GTO timed scenario library and participation logs.
create table public.group_planning (id uuid primary key default gen_random_uuid(), title text not null, statement text not null, rules text, map_path text, pdf_path text, time_limit integer not null default 600 check (time_limit > 0), sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
create table public.command_tasks (id uuid primary key default gen_random_uuid(), title text not null, statement text not null, rules text, pdf_path text, time_limit integer not null default 300 check (time_limit > 0), sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
create table public.group_tasks (id uuid primary key default gen_random_uuid(), title text not null, statement text not null, rules text, diagram_path text, pdf_path text, time_limit integer not null default 600 check (time_limit > 0), sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
create table public.individual_obstacles (id uuid primary key default gen_random_uuid(), title text not null, statement text not null, rules text, image_path text, pdf_path text, time_limit integer not null default 120 check (time_limit > 0), sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
alter table public.individual_obstacles add column if not exists description text;
alter table public.individual_obstacles add column if not exists image_url text;
alter table public.individual_obstacles add column if not exists marks integer not null default 0 check (marks >= 0);
create table public.gto_participation (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade, task_type text not null check (task_type in ('GroupPlanning','CommandTask','GroupTask','IndividualObstacle')), task_id uuid not null, started_at timestamptz not null default now(), ended_at timestamptz);
create index gto_participation_user_idx on public.gto_participation(user_id, started_at desc);
alter table public.group_planning enable row level security; alter table public.command_tasks enable row level security; alter table public.group_tasks enable row level security; alter table public.individual_obstacles enable row level security; alter table public.gto_participation enable row level security;
create policy "Premium users read group planning" on public.group_planning for select to authenticated using (is_active and exists (select 1 from public.users u where u.id = auth.uid() and u.premium_status));
create policy "Premium users read command tasks" on public.command_tasks for select to authenticated using (is_active and exists (select 1 from public.users u where u.id = auth.uid() and u.premium_status));
create policy "Premium users read group tasks" on public.group_tasks for select to authenticated using (is_active and exists (select 1 from public.users u where u.id = auth.uid() and u.premium_status));
create policy "Premium users read obstacles" on public.individual_obstacles for select to authenticated using (is_active and exists (select 1 from public.users u where u.id = auth.uid() and u.premium_status));
create policy "Users manage own GTO participation" on public.gto_participation for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('gto-assets', 'gto-assets', false, 5242880, array['image/jpeg','image/png','image/webp']) on conflict (id) do update set public = false;
create policy "Authenticated users read GTO assets" on storage.objects for select to authenticated using (bucket_id = 'gto-assets');
create policy "Admins manage GTO assets" on storage.objects for all to authenticated using (bucket_id = 'gto-assets' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')) with check (bucket_id = 'gto-assets' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
