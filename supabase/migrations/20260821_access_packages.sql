-- Time-limited course passes plus a starter credit wallet.
alter table public.users add column if not exists credit_balance integer not null default 100 check (credit_balance >= 0);
alter table public.payments add column if not exists plan_code text not null default 'complete' check (plan_code in ('initial', 'issb', 'complete'));

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  scope text not null check (scope in ('initial', 'issb')),
  source_payment_id uuid references public.payments(id) on delete set null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, scope)
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount integer not null check (amount <> 0),
  reason text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists entitlements_user_expiry_idx on public.user_entitlements(user_id, scope, expires_at desc);
create index if not exists credit_transactions_user_idx on public.credit_transactions(user_id, created_at desc);

-- Keep this migration usable for databases created before the psychology tables
-- were added to the baseline schema.
create table if not exists public.psychology_participation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  test_type text not null check (test_type in ('WAT', 'SCT', 'TAT', 'SelfDescription')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
create index if not exists psychology_participation_user_idx on public.psychology_participation(user_id, started_at desc);

alter table public.psychology_participation enable row level security;
drop policy if exists "Users read own psychology participation" on public.psychology_participation;
create policy "Users read own psychology participation" on public.psychology_participation for select using (auth.uid() = user_id);
drop policy if exists "Users create own psychology participation" on public.psychology_participation;
create policy "Users create own psychology participation" on public.psychology_participation for insert with check (auth.uid() = user_id);
drop policy if exists "Users finish own psychology participation" on public.psychology_participation;
create policy "Users finish own psychology participation" on public.psychology_participation for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.user_entitlements enable row level security;
alter table public.credit_transactions enable row level security;
drop policy if exists "Users read own entitlements" on public.user_entitlements;
create policy "Users read own entitlements" on public.user_entitlements for select using (auth.uid() = user_id);
drop policy if exists "Users read own credits" on public.credit_transactions;
create policy "Users read own credits" on public.credit_transactions for select using (auth.uid() = user_id);

-- Record starter credits for existing accounts once.
insert into public.credit_transactions (user_id, amount, reason)
select id, 100, 'Welcome credits' from public.users u
where not exists (select 1 from public.credit_transactions ct where ct.user_id = u.id and ct.reason = 'Welcome credits');

create or replace function public.has_course_access(candidate uuid, requested_scope text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_entitlements
    where user_id = candidate and scope = requested_scope and expires_at > now()
  ) or exists (select 1 from public.users where id = candidate and premium_status = true);
$$;

create or replace function public.charge_practice_credits()
returns trigger language plpgsql security definer set search_path = public as $$
declare charge integer; requested_scope text; current_balance integer;
begin
  requested_scope := case when lower(new.module) like 'initial%' then 'initial' else 'issb' end;
  charge := case when requested_scope = 'initial' then 25 else 15 end;
  if public.has_course_access(new.user_id, requested_scope) then return new; end if;
  select credit_balance into current_balance from public.users where id = new.user_id for update;
  if coalesce(current_balance, 0) < charge then raise exception 'Not enough practice credits'; end if;
  update public.users set credit_balance = credit_balance - charge where id = new.user_id;
  insert into public.credit_transactions(user_id, amount, reason, reference_id) values (new.user_id, -charge, new.module || ' practice', new.id);
  return new;
end;
$$;

drop trigger if exists charge_attempt_credits on public.practice_attempts;
create trigger charge_attempt_credits after insert on public.practice_attempts for each row execute procedure public.charge_practice_credits();

create or replace function public.charge_psychology_credits()
returns trigger language plpgsql security definer set search_path = public as $$
declare current_balance integer;
begin
  if public.has_course_access(new.user_id, 'issb') then return new; end if;
  select credit_balance into current_balance from public.users where id = new.user_id for update;
  if coalesce(current_balance, 0) < 15 then raise exception 'Not enough practice credits'; end if;
  update public.users set credit_balance = credit_balance - 15 where id = new.user_id;
  insert into public.credit_transactions(user_id, amount, reason, reference_id) values (new.user_id, -15, new.test_type || ' session', new.id);
  return new;
end;
$$;

drop trigger if exists charge_psychology_session_credits on public.psychology_participation;
create trigger charge_psychology_session_credits after insert on public.psychology_participation for each row execute procedure public.charge_psychology_credits();
