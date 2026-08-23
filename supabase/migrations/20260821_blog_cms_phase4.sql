alter table public.blog_posts add column if not exists rich_content_json jsonb;
alter table public.blog_posts add column if not exists content_format text not null default 'blocks' check(content_format in ('blocks','rich'));
alter table public.blog_post_revisions add column if not exists rich_content_json jsonb;
alter table public.blog_post_revisions add column if not exists content_format text not null default 'blocks';
