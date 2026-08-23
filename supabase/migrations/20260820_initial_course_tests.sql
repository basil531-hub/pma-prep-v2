-- Course-specific Initial Preparation test bank.
-- Uses initial_* names because this project already has generic tests/results tables.
do $$ begin
  create type public.initial_test_type as enum ('Academic', 'Verbal', 'Non-Verbal');
exception when duplicate_object then null;
end $$;
create table if not exists public.initial_tests (
  id uuid primary key default gen_random_uuid(),
  type public.initial_test_type not null unique,
  total_questions integer not null check (total_questions > 0),
  time_limit integer not null check (time_limit > 0),
  passing_marks numeric(5,2) not null default 50 check (passing_marks between 0 and 100),
  created_at timestamptz not null default now()
);
create table if not exists public.initial_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.initial_tests(id) on delete cascade,
  question_text text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  correct_answer text not null,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.initial_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  test_id uuid not null references public.initial_tests(id) on delete cascade,
  score integer not null check (score >= 0),
  percentage numeric(5,2) not null check (percentage between 0 and 100),
  time_taken integer not null check (time_taken >= 0),
  passed boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists initial_questions_test_idx on public.initial_questions(test_id, sort_order);
create index if not exists initial_results_user_idx on public.initial_results(user_id, created_at desc);
alter table public.initial_tests enable row level security;
alter table public.initial_questions enable row level security;
alter table public.initial_results enable row level security;
drop policy if exists "Authenticated users read initial tests" on public.initial_tests;
create policy "Authenticated users read initial tests" on public.initial_tests for select to authenticated using (true);
drop policy if exists "Authenticated users read initial questions" on public.initial_questions;
create policy "Authenticated users read initial questions" on public.initial_questions for select to authenticated using (true);
drop policy if exists "Users read own initial results" on public.initial_results;
create policy "Users read own initial results" on public.initial_results for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users create own initial results" on public.initial_results;
create policy "Users create own initial results" on public.initial_results for insert to authenticated with check (auth.uid() = user_id);

insert into public.initial_tests (type, total_questions, time_limit, passing_marks) values
('Academic', 50, 1500, 50), ('Verbal', 84, 1800, 50), ('Non-Verbal', 64, 1500, 50)
on conflict (type) do update set total_questions = excluded.total_questions, time_limit = excluded.time_limit, passing_marks = excluded.passing_marks;

insert into public.initial_questions (test_id, question_text, options, correct_answer, sort_order)
select t.id, q.question_text, q.options::jsonb, q.correct_answer, q.sort_order
from public.initial_tests t
cross join (values
  ('Academic', 'Choose the closest meaning of brief.', '["Short","Bright","Heavy","Loud"]', 'Short', 1),
  ('Academic', 'What is 15% of 200?', '["15","20","30","40"]', '30', 2),
  ('Academic', 'Which planet is known as the Red Planet?', '["Venus","Mars","Jupiter","Mercury"]', 'Mars', 3),
  ('Academic', 'Pakistan was created in which year?', '["1940","1947","1956","1971"]', '1947', 4),
  ('Academic', 'What is the basic unit of life?', '["Atom","Cell","Tissue","Organ"]', 'Cell', 5),
  ('Verbal', 'Book is to reading as fork is to:', '["Writing","Eating","Cutting","Sleeping"]', 'Eating', 1),
  ('Verbal', 'Find the next number: 3, 6, 12, 24, ?', '["36","42","48","54"]', '48', 2),
  ('Verbal', 'If CAT is coded as DBU, how is DOG coded?', '["EPH","CNE","EOG","FPH"]', 'EPH', 3),
  ('Non-Verbal', 'A shape turns 90 degrees clockwise four times. It now faces:', '["The original direction","Left","Right","Down"]', 'The original direction', 1),
  ('Non-Verbal', 'A pattern adds one dot in every step. After three steps, how many dots were added?', '["One","Two","Three","Four"]', 'Three', 2),
  ('Non-Verbal', 'Which sequence shows a shape growing by one side each step?', '["Triangle, square, pentagon","Circle, circle, circle","Square, triangle, line","Star, circle, square"]', 'Triangle, square, pentagon', 3)
) as q(test_type, question_text, options, correct_answer, sort_order)
where q.test_type = t.type::text
  and not exists (
    select 1
    from public.initial_questions existing
    where existing.test_id = t.id
      and existing.sort_order = q.sort_order
  );
