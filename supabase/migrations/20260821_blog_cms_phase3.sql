create table if not exists public.blog_subscribers (id uuid primary key default gen_random_uuid(),email text not null unique,name text not null default '',source text not null default 'blog',status text not null default 'active' check(status in ('active','unsubscribed')),consent_at timestamptz not null default now(),unsubscribe_token uuid not null default gen_random_uuid(),created_at timestamptz not null default now());
create table if not exists public.blog_redirects (id uuid primary key default gen_random_uuid(),from_path text not null unique,to_path text not null,status_code integer not null default 301 check(status_code in (301,302)),hits bigint not null default 0,created_at timestamptz not null default now());
alter table public.blog_subscribers enable row level security;
alter table public.blog_redirects enable row level security;
drop policy if exists "Public redirects" on public.blog_redirects;
create policy "Public redirects" on public.blog_redirects for select using(true);
create or replace function public.resolve_blog_redirect(source_path text) returns table(to_path text,status_code integer) language sql security definer set search_path=public as $$ update public.blog_redirects set hits=hits+1 where from_path=source_path returning blog_redirects.to_path,blog_redirects.status_code; $$;
grant execute on function public.resolve_blog_redirect(text) to anon,authenticated;
