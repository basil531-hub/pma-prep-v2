-- Repair payment/profile integrity and ensure every Auth user has a public profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(coalesce(new.email, ''), '@', 1), 'Candidate'),
    coalesce(new.email, new.id::text || '@pending.local')
  )
  on conflict (id) do update set
    name = coalesce(nullif(public.users.name, ''), excluded.name),
    email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute procedure public.handle_new_user();

-- Backfill accounts created before the profile trigger existed.
insert into public.users (id, name, email)
select
  au.id,
  coalesce(nullif(au.raw_user_meta_data ->> 'name', ''), split_part(coalesce(au.email, ''), '@', 1), 'Candidate'),
  coalesce(au.email, au.id::text || '@pending.local')
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null
on conflict (id) do nothing;

create index if not exists payments_user_created_idx on public.payments (user_id, created_at desc);
create index if not exists payments_status_created_idx on public.payments (status, created_at desc);
