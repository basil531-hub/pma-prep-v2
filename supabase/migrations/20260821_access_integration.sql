-- Enforce the pass/credit model at the data layer, not only in the UI.
drop policy if exists "Authenticated users read allowed notes" on public.notes;
create policy "Authenticated users read allowed notes" on public.notes for select to authenticated using (
  not is_premium
  or public.has_course_access(auth.uid(), 'initial')
  or public.has_course_access(auth.uid(), 'issb')
);

drop policy if exists "Authenticated users read allowed tests" on public.tests;
create policy "Authenticated users read allowed tests" on public.tests for select to authenticated using (
  not is_premium
  or public.has_course_access(auth.uid(), case when type in ('WAT', 'Interview') then 'issb' else 'initial' end)
  or exists (select 1 from public.users u where u.id = auth.uid() and u.credit_balance >= case when type in ('WAT', 'Interview') then 15 else 25 end)
);

drop policy if exists "Authenticated users read WAT" on public.wat;
create policy "Authorized users read WAT" on public.wat for select to authenticated using (
  is_active and (public.has_course_access(auth.uid(), 'issb') or exists (select 1 from public.users u where u.id = auth.uid() and u.credit_balance >= 15))
);
drop policy if exists "Authenticated users read SCT" on public.sct;
create policy "Authorized users read SCT" on public.sct for select to authenticated using (
  is_active and (public.has_course_access(auth.uid(), 'issb') or exists (select 1 from public.users u where u.id = auth.uid() and u.credit_balance >= 15))
);
drop policy if exists "Authenticated users read TAT" on public.tat;
create policy "Authorized users read TAT" on public.tat for select to authenticated using (
  is_active and (public.has_course_access(auth.uid(), 'issb') or exists (select 1 from public.users u where u.id = auth.uid() and u.credit_balance >= 15))
);
drop policy if exists "Authenticated users read self descriptions" on public.self_description;
create policy "Authorized users read self descriptions" on public.self_description for select to authenticated using (
  is_active and (public.has_course_access(auth.uid(), 'issb') or exists (select 1 from public.users u where u.id = auth.uid() and u.credit_balance >= 15))
);

drop policy if exists "Premium users read group planning" on public.group_planning;
create policy "Authorized users read group planning" on public.group_planning for select to authenticated using (is_active and (public.has_course_access(auth.uid(), 'issb') or exists (select 1 from public.users u where u.id = auth.uid() and u.credit_balance >= 15)));
drop policy if exists "Premium users read command tasks" on public.command_tasks;
create policy "Authorized users read command tasks" on public.command_tasks for select to authenticated using (is_active and (public.has_course_access(auth.uid(), 'issb') or exists (select 1 from public.users u where u.id = auth.uid() and u.credit_balance >= 15)));
drop policy if exists "Premium users read group tasks" on public.group_tasks;
create policy "Authorized users read group tasks" on public.group_tasks for select to authenticated using (is_active and (public.has_course_access(auth.uid(), 'issb') or exists (select 1 from public.users u where u.id = auth.uid() and u.credit_balance >= 15)));
drop policy if exists "Premium users read obstacles" on public.individual_obstacles;
create policy "Authorized users read obstacles" on public.individual_obstacles for select to authenticated using (is_active and (public.has_course_access(auth.uid(), 'issb') or exists (select 1 from public.users u where u.id = auth.uid() and u.credit_balance >= 15)));

-- Let users read premium PDFs when either course pass is active.
drop policy if exists "Authorized users read PDF notes" on storage.objects;
create policy "Authorized users read PDF notes" on storage.objects for select to authenticated using (
  bucket_id = 'notes-pdfs' and exists (
    select 1 from public.notes n where n.file_url = name and (
      n.access_type = 'free' or public.has_course_access(auth.uid(), 'initial') or public.has_course_access(auth.uid(), 'issb')
    )
  )
);
