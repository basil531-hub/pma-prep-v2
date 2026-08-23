-- Referral attribution and milestone-based credit rewards.
create or replace function public.make_referral_code(candidate uuid)
returns text language sql immutable as $$ select upper(substr(md5(candidate::text), 1, 8)); $$;

alter table public.users add column if not exists referral_code text;
alter table public.users add column if not exists referred_by uuid references public.users(id) on delete set null;
update public.users set referral_code = public.make_referral_code(id) where referral_code is null;
alter table public.users alter column referral_code set not null;
create unique index if not exists users_referral_code_unique on public.users(referral_code);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.users(id) on delete cascade,
  referred_user_id uuid not null unique references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'qualified', 'purchased', 'blocked')),
  signup_rewarded_at timestamptz,
  purchase_rewarded_at timestamptz,
  source_payment_id uuid references public.payments(id) on delete set null,
  created_at timestamptz not null default now(),
  check (referrer_id <> referred_user_id)
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id, created_at desc);
alter table public.referrals enable row level security;
create policy "Users read own referral activity" on public.referrals for select using (auth.uid() = referrer_id or auth.uid() = referred_user_id);

create or replace function public.register_referral(invited_user uuid, code text)
returns boolean language plpgsql security definer set search_path = public as $$
declare owner_id uuid;
begin
  if auth.uid() is null or auth.uid() <> invited_user then return false; end if;
  select id into owner_id from public.users where referral_code = upper(trim(code));
  if owner_id is null or owner_id = invited_user then return false; end if;
  update public.users set referred_by = owner_id where id = invited_user and referred_by is null;
  insert into public.referrals(referrer_id, referred_user_id) values(owner_id, invited_user)
  on conflict (referred_user_id) do nothing;
  return true;
end; $$;

create or replace function public.qualify_referral_after_practice()
returns trigger language plpgsql security definer set search_path = public as $$
declare referral_row public.referrals%rowtype;
begin
  select * into referral_row from public.referrals where referred_user_id = new.user_id and status = 'pending' for update;
  if referral_row.id is null then return new; end if;
  update public.users set credit_balance = credit_balance + 25 where id in (referral_row.referrer_id, referral_row.referred_user_id);
  insert into public.credit_transactions(user_id, amount, reason, reference_id) values
    (referral_row.referrer_id, 25, 'Qualified referral reward', referral_row.id),
    (referral_row.referred_user_id, 25, 'Referral welcome bonus', referral_row.id);
  update public.referrals set status = 'qualified', signup_rewarded_at = now() where id = referral_row.id;
  return new;
end; $$;
drop trigger if exists qualify_referral_on_first_attempt on public.practice_attempts;
create trigger qualify_referral_on_first_attempt after insert on public.practice_attempts for each row execute procedure public.qualify_referral_after_practice();

create or replace function public.reward_referral_purchase(referred_user uuid, verified_payment uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare referral_row public.referrals%rowtype;
begin
  if not exists (select 1 from public.payments where id = verified_payment and user_id = referred_user and status = 'verified') then return false; end if;
  select * into referral_row from public.referrals where referred_user_id = referred_user and status = 'qualified' and purchase_rewarded_at is null for update;
  if referral_row.id is null then return false; end if;
  update public.users set credit_balance = credit_balance + 150 where id = referral_row.referrer_id;
  insert into public.credit_transactions(user_id, amount, reason, reference_id) values (referral_row.referrer_id, 150, 'Referred purchase reward', verified_payment);
  update public.referrals set status = 'purchased', purchase_rewarded_at = now(), source_payment_id = verified_payment where id = referral_row.id;
  return true;
end; $$;

-- Ensure future profiles always receive a stable code.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner_id uuid;
begin
  insert into public.users (id, name, email, referral_code)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(coalesce(new.email, ''), '@', 1), 'Candidate'), coalesce(new.email, new.id::text || '@pending.local'), public.make_referral_code(new.id))
  on conflict (id) do update set name = coalesce(nullif(public.users.name, ''), excluded.name), email = excluded.email;
  if nullif(new.raw_user_meta_data ->> 'referral_code', '') is not null then
    select id into owner_id from public.users where referral_code = upper(trim(new.raw_user_meta_data ->> 'referral_code')) and id <> new.id;
    if owner_id is not null then
      update public.users set referred_by = owner_id where id = new.id and referred_by is null;
      insert into public.referrals(referrer_id, referred_user_id) values(owner_id, new.id) on conflict (referred_user_id) do nothing;
    end if;
  end if;
  return new;
end; $$;
