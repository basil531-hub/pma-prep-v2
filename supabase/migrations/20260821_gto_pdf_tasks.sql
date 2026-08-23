alter table public.group_planning add column if not exists pdf_path text;
alter table public.command_tasks add column if not exists pdf_path text;
alter table public.group_tasks add column if not exists pdf_path text;
alter table public.individual_obstacles add column if not exists pdf_path text;
update storage.buckets set allowed_mime_types = array['application/pdf'] where id = 'gto-assets';
