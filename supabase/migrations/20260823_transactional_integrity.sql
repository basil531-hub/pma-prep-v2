-- Keep payment approval and Initial MCQ result recording atomic.
create or replace function public.review_payment(payment_id uuid, review_status text, reviewer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_row public.payments%rowtype;
  plan_days integer;
  approval_time timestamptz := now();
  plan_scope text;
begin
  if review_status not in ('verified', 'rejected') then
    raise exception 'Invalid payment status.';
  end if;

  select * into payment_row from public.payments where id = payment_id for update;
  if not found or payment_row.status <> 'pending' then
    raise exception 'Payment is no longer pending.';
  end if;

  update public.payments
  set status = review_status::public.payment_status,
      reviewed_at = approval_time,
      reviewed_by = reviewer_id
  where id = payment_id;

  if review_status = 'verified' then
    plan_days := case payment_row.plan_code when 'initial' then 45 when 'issb' then 60 else 90 end;
    foreach plan_scope in array (
      case payment_row.plan_code
        when 'initial' then array['initial']
        when 'issb' then array['issb']
        else array['initial', 'issb']
      end
    ) loop
      insert into public.user_entitlements(user_id, scope, starts_at, expires_at, source_payment_id)
      values (payment_row.user_id, plan_scope, approval_time, approval_time + make_interval(days => plan_days), payment_row.id)
      on conflict (user_id, scope) do update
      set expires_at = greatest(public.user_entitlements.expires_at, excluded.expires_at),
          source_payment_id = excluded.source_payment_id;
    end loop;
  end if;
end;
$$;

revoke all on function public.review_payment(uuid, text, uuid) from public;
grant execute on function public.review_payment(uuid, text, uuid) to service_role;

create or replace function public.record_initial_result(
  candidate_user uuid,
  initial_test_id uuid,
  result_score integer,
  result_percentage numeric,
  result_time_taken integer,
  result_passed boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  result_id uuid;
  test_type text;
begin
  select type::text into test_type from public.initial_tests where id = initial_test_id;
  if test_type is null then raise exception 'Test is not available.'; end if;
  if result_score < 0 or result_percentage < 0 or result_percentage > 100 or result_time_taken < 0 then
    raise exception 'Invalid result values.';
  end if;

  insert into public.initial_results(user_id, test_id, score, percentage, time_taken, passed)
  values (candidate_user, initial_test_id, result_score, result_percentage, result_time_taken, result_passed)
  returning id into result_id;

  insert into public.practice_attempts(user_id, module, score)
  values (candidate_user, 'Initial ' || test_type, result_percentage);

  return result_id;
end;
$$;

revoke all on function public.record_initial_result(uuid, uuid, integer, numeric, integer, boolean) from public;
grant execute on function public.record_initial_result(uuid, uuid, integer, numeric, integer, boolean) to service_role;
