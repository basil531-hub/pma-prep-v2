create table if not exists public.gto_lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  category text not null check (category in ('Group Planning','Command Task','PGT / HGT','Individual Obstacles')),
  rich_content_json jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  featured_image_path text not null,
  pdf_path text,
  status text not null default 'draft' check (status in ('draft','published')),
  author_id uuid references public.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.gto_lessons enable row level security;
drop policy if exists "Published GTO lessons are readable" on public.gto_lessons;
create policy "Published GTO lessons are readable" on public.gto_lessons for select using (status = 'published' or exists (select 1 from public.users where id=auth.uid() and role='admin'));
drop policy if exists "Admins manage GTO lessons" on public.gto_lessons;
create policy "Admins manage GTO lessons" on public.gto_lessons for all using (exists (select 1 from public.users where id=auth.uid() and role='admin')) with check (exists (select 1 from public.users where id=auth.uid() and role='admin'));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('gto-assets','gto-assets',false,5242880,array['application/pdf','image/jpeg','image/png','image/webp']) on conflict(id) do update set allowed_mime_types=excluded.allowed_mime_types;
