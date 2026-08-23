alter table public.blog_posts add column if not exists assigned_author_id uuid references public.users(id) on delete set null;
alter table public.blog_posts add column if not exists related_post_ids uuid[] not null default '{}';
alter table public.blog_posts add column if not exists comments_enabled boolean not null default true;

create table if not exists public.blog_post_revisions (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.blog_posts(id) on delete cascade,
  editor_id uuid references public.users(id) on delete set null, title text not null, excerpt text not null default '',
  content_json jsonb not null default '[]'::jsonb, change_note text not null default '', created_at timestamptz not null default now()
);
create index if not exists blog_revisions_post_idx on public.blog_post_revisions(post_id,created_at desc);

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null, author_name text not null, author_email text not null,
  body text not null, status text not null default 'pending' check(status in ('pending','approved','spam')),
  created_at timestamptz not null default now(), moderated_at timestamptz
);
create index if not exists blog_comments_moderation_idx on public.blog_comments(status,created_at desc);

create table if not exists public.blog_post_views (
  id bigint generated always as identity primary key, post_id uuid not null references public.blog_posts(id) on delete cascade,
  visitor_hash text not null, viewed_on date not null default current_date, created_at timestamptz not null default now(),
  unique(post_id,visitor_hash,viewed_on)
);
create index if not exists blog_views_post_idx on public.blog_post_views(post_id,created_at desc);

alter table public.blog_post_revisions enable row level security;
alter table public.blog_comments enable row level security;
alter table public.blog_post_views enable row level security;
drop policy if exists "Public approved comments" on public.blog_comments;
create policy "Public approved comments" on public.blog_comments for select using(status='approved');

create or replace function public.record_blog_view(target_post uuid, visitor text)
returns void language sql security definer set search_path=public as $$
  insert into public.blog_post_views(post_id,visitor_hash) values(target_post,visitor)
  on conflict(post_id,visitor_hash,viewed_on) do nothing;
$$;
grant execute on function public.record_blog_view(uuid,text) to anon,authenticated;
