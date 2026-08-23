create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(trim(code))),
  discount_percent integer not null check (discount_percent between 1 and 100),
  plan_code text not null check (plan_code in ('initial','issb','complete')),
  access_days integer not null check (access_days > 0),
  max_redemptions integer not null check (max_redemptions > 0),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete cascade,
  plan_code text not null check (plan_code in ('initial','issb','complete')),
  original_amount numeric(10,2) not null check (original_amount >= 0),
  discount_amount numeric(10,2) not null check (discount_amount >= 0),
  final_amount numeric(10,2) not null check (final_amount >= 0),
  redeemed_at timestamptz not null default now(),
  unique (coupon_id, user_id)
);

create index if not exists coupon_redemptions_coupon_idx on public.coupon_redemptions(coupon_id, redeemed_at);
create index if not exists coupon_redemptions_user_idx on public.coupon_redemptions(user_id, redeemed_at desc);
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
create policy "Users read available coupons" on public.coupons for select to authenticated using (is_active and starts_at <= now() and expires_at > now());
create policy "Users read own coupon redemptions" on public.coupon_redemptions for select to authenticated using (auth.uid() = user_id);

insert into public.coupons(code,discount_percent,plan_code,access_days,max_redemptions,expires_at)
values ('PMA100',100,'complete',30,500,now() + interval '14 days')
on conflict (code) do nothing;

create or replace function public.redeem_coupon(coupon_code text)
returns table(plan_code text, access_days integer, expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  candidate uuid := auth.uid();
  offer public.coupons%rowtype;
  used_count integer;
  plan_price numeric(10,2);
  entitlement_expiry timestamptz;
  requested_scope text;
begin
  if candidate is null then raise exception 'Sign in to redeem a coupon.'; end if;
  select * into offer from public.coupons where code = upper(trim(coupon_code)) for update;
  if not found then raise exception 'Coupon code is invalid.'; end if;
  if not offer.is_active or offer.starts_at > now() or offer.expires_at <= now() then raise exception 'This coupon is not active.'; end if;
  if exists(select 1 from public.coupon_redemptions r where r.coupon_id=offer.id and r.user_id=candidate) then raise exception 'You have already redeemed this coupon.'; end if;
  select count(*) into used_count from public.coupon_redemptions r where r.coupon_id=offer.id;
  if used_count >= offer.max_redemptions then raise exception 'This coupon has reached its redemption limit.'; end if;
  plan_price := case offer.plan_code when 'initial' then 1499 when 'issb' then 2999 else 3999 end;
  insert into public.coupon_redemptions(coupon_id,user_id,plan_code,original_amount,discount_amount,final_amount)
  values(offer.id,candidate,offer.plan_code,plan_price,round(plan_price*offer.discount_percent/100,2),round(plan_price*(100-offer.discount_percent)/100,2));
  foreach requested_scope in array (case when offer.plan_code='complete' then array['initial','issb'] else array[offer.plan_code] end) loop
    insert into public.user_entitlements(user_id,scope,starts_at,expires_at)
    values(candidate,requested_scope,now(),now() + make_interval(days=>offer.access_days))
    on conflict(user_id,scope) do update set expires_at = greatest(public.user_entitlements.expires_at, excluded.expires_at);
  end loop;
  entitlement_expiry := now() + make_interval(days=>offer.access_days);
  return query select offer.plan_code, offer.access_days, entitlement_expiry;
end;
$$;
grant execute on function public.redeem_coupon(text) to authenticated;
