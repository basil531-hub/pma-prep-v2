create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  description text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.blog_media (
  id uuid primary key default gen_random_uuid(), file_path text not null unique, alt_text text not null default '',
  caption text not null default '', mime_type text not null, size_bytes bigint not null default 0,
  uploaded_by uuid references public.users(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  excerpt text not null default '', content_json jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','scheduled','published')),
  author_id uuid references public.users(id) on delete set null,
  category_id uuid references public.blog_categories(id) on delete set null,
  featured_image_id uuid references public.blog_media(id) on delete set null,
  seo_title text not null default '', seo_description text not null default '', canonical_url text not null default '',
  social_title text not null default '', social_description text not null default '', allow_indexing boolean not null default true,
  is_featured boolean not null default false, published_at timestamptz, scheduled_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.blog_post_tags (
  post_id uuid references public.blog_posts(id) on delete cascade,
  tag_id uuid references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);
create index if not exists blog_posts_public_idx on public.blog_posts(status, published_at desc);
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_media enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_tags enable row level security;
drop policy if exists "Public categories" on public.blog_categories;
create policy "Public categories" on public.blog_categories for select using (true);
drop policy if exists "Public tags" on public.blog_tags;
create policy "Public tags" on public.blog_tags for select using (true);
drop policy if exists "Public media" on public.blog_media;
create policy "Public media" on public.blog_media for select using (true);
drop policy if exists "Public published posts" on public.blog_posts;
create policy "Public published posts" on public.blog_posts for select using (
  status = 'published' or (status = 'scheduled' and scheduled_at <= now())
);
drop policy if exists "Public post tags" on public.blog_post_tags;
create policy "Public post tags" on public.blog_post_tags for select using (
  exists (select 1 from public.blog_posts p where p.id = post_id and (p.status='published' or (p.status='scheduled' and p.scheduled_at <= now())))
);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('blog-media','blog-media',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true, file_size_limit=5242880, allowed_mime_types=excluded.allowed_mime_types;
insert into public.blog_categories(name,slug,description) values
  ('PMA Initial','pma-initial','Initial test and interview preparation'),
  ('ISSB','issb','ISSB psychology, GTO and interview preparation')
on conflict (slug) do nothing;
