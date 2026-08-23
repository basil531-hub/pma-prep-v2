-- Reinstall credit charging rules and make failures explicit.
create or replace function public.charge_practice_credits()
returns trigger language plpgsql security definer set search_path = public as $$
declare charge integer; requested_scope text; current_balance integer;
begin
  requested_scope := case when lower(new.module) like 'initial%' then 'initial' else 'issb' end;
  charge := case when requested_scope = 'initial' then 25 else 15 end;
  if public.has_course_access(new.user_id, requested_scope) then return new; end if;
  select credit_balance into current_balance from public.users where id = new.user_id for update;
  if current_balance is null then raise exception 'Candidate profile not found'; end if;
  if current_balance < charge then raise exception 'Not enough practice credits'; end if;
  update public.users set credit_balance = credit_balance - charge where id = new.user_id;
  insert into public.credit_transactions(user_id,amount,reason,reference_id)
  values(new.user_id,-charge,new.module || ' practice',new.id);
  return new;
end;
$$;
drop trigger if exists charge_attempt_credits on public.practice_attempts;
create trigger charge_attempt_credits after insert on public.practice_attempts for each row execute procedure public.charge_practice_credits();

create or replace function public.charge_psychology_credits()
returns trigger language plpgsql security definer set search_path = public as $$
declare current_balance integer;
begin
  if public.has_course_access(new.user_id,'issb') then return new; end if;
  select credit_balance into current_balance from public.users where id = new.user_id for update;
  if current_balance is null then raise exception 'Candidate profile not found'; end if;
  if current_balance < 15 then raise exception 'Not enough practice credits'; end if;
  update public.users set credit_balance = credit_balance - 15 where id = new.user_id;
  insert into public.credit_transactions(user_id,amount,reason,reference_id)
  values(new.user_id,-15,new.test_type || ' session',new.id);
  return new;
end;
$$;
drop trigger if exists charge_psychology_session_credits on public.psychology_participation;
create trigger charge_psychology_session_credits after insert on public.psychology_participation for each row execute procedure public.charge_psychology_credits();
