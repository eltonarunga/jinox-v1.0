-- JinoX operational annotation workflow.
-- Enforces approved-asset intake, enables least-privilege project collaboration,
-- and makes annotation submission/review transitions atomic.
-- Apply to staging first and run the role-specific integration suite before production.

-- Dataset membership is a governance gate: pending and quarantined assets cannot enter work queues.
drop policy if exists "project managers can add owned clinical assets to datasets" on public.dataset_items;
create policy "project managers can add approved owned clinical assets to datasets"
on public.dataset_items for insert to authenticated
with check (
  added_by = (select auth.uid())
  and exists (
    select 1 from public.research_datasets d
    where d.id = dataset_items.dataset_id
      and public.research_can_manage_project(d.project_id)
  )
  and exists (
    select 1 from public.clinical_assets a
    where a.id = dataset_items.clinical_asset_id
      and a.owner_id = (select auth.uid())
      and a.status = 'approved'
  )
  and (
    assigned_to is null
    or exists (
      select 1 from public.research_datasets d
      join public.research_project_members m on m.project_id = d.project_id
      where d.id = dataset_items.dataset_id
        and m.user_id = dataset_items.assigned_to
        and m.role = 'researcher'
    )
  )
);

-- Project managers, reviewers, and the researcher assigned to an item may read
-- its asset metadata. Unassigned assets remain visible only to their owner.
drop policy if exists "project collaborators can read dataset assets" on public.clinical_assets;
create policy "project collaborators can read dataset assets"
on public.clinical_assets for select to authenticated
using (
  exists (
    select 1
    from public.dataset_items i
    join public.research_datasets d on d.id = i.dataset_id
    where i.clinical_asset_id = clinical_assets.id
      and (
        public.research_can_manage_project(d.project_id)
        or public.research_current_user_has_project_role(d.project_id, array['reviewer']::text[])
        or (
          i.assigned_to = (select auth.uid())
          and public.research_current_user_has_project_role(d.project_id, array['researcher']::text[])
        )
      )
  )
);

-- Storage access follows the same project/item authorization as asset metadata.
drop policy if exists "project collaborators can read assigned private clinical files" on storage.objects;
create policy "project collaborators can read assigned private clinical files"
on storage.objects for select to authenticated
using (
  bucket_id = 'jinox-clinical-assets'
  and exists (
    select 1
    from public.clinical_assets a
    join public.dataset_items i on i.clinical_asset_id = a.id
    join public.research_datasets d on d.id = i.dataset_id
    where a.storage_path = storage.objects.name
      and (
        public.research_can_manage_project(d.project_id)
        or public.research_current_user_has_project_role(d.project_id, array['reviewer']::text[])
        or (
          i.assigned_to = (select auth.uid())
          and public.research_current_user_has_project_role(d.project_id, array['researcher']::text[])
        )
      )
  )
);

-- Submit/update an annotation and transition its work item in one transaction.
-- SECURITY INVOKER preserves table grants and RLS policies for the caller.
create or replace function public.save_dataset_annotation(
  p_dataset_item_id uuid,
  p_labels jsonb,
  p_notes text,
  p_submit boolean default false
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_item public.dataset_items%rowtype;
  v_project_id uuid;
  v_annotation public.dataset_annotations%rowtype;
  v_revision integer;
begin
  if v_actor is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_labels is null or jsonb_typeof(p_labels) <> 'object' then
    raise exception 'Annotation labels must be a JSON object' using errcode = '22023';
  end if;
  if char_length(coalesce(p_notes, '')) > 5000 then
    raise exception 'Annotation notes exceed 5000 characters' using errcode = '22023';
  end if;

  select i.* into v_item
  from public.dataset_items i
  where i.id = p_dataset_item_id
  for update;

  if not found then
    raise exception 'Dataset item not found or inaccessible' using errcode = '42501';
  end if;

  select d.project_id into v_project_id
  from public.research_datasets d
  where d.id = v_item.dataset_id;

  if v_item.assigned_to is distinct from v_actor
     or v_item.status not in ('queued', 'in_progress', 'submitted')
     or not public.research_current_user_has_project_role(v_project_id, array['researcher']::text[]) then
    raise exception 'Only the assigned project researcher can annotate this item' using errcode = '42501';
  end if;

  select a.* into v_annotation
  from public.dataset_annotations a
  where a.dataset_item_id = p_dataset_item_id
    and a.annotator_id = v_actor
    and a.status = 'draft'
  order by a.revision desc
  limit 1
  for update;

  if found then
    update public.dataset_annotations
    set labels = p_labels,
        notes = coalesce(p_notes, ''),
        status = case when coalesce(p_submit, false) then 'submitted' else 'draft' end,
        updated_at = now()
    where id = v_annotation.id
    returning * into v_annotation;
  else
    select coalesce(max(a.revision), 0) + 1 into v_revision
    from public.dataset_annotations a
    where a.dataset_item_id = p_dataset_item_id
      and a.annotator_id = v_actor;

    insert into public.dataset_annotations (
      dataset_item_id, annotator_id, schema_version, labels, notes, status, revision
    ) values (
      p_dataset_item_id, v_actor, 'oral-health-v1', p_labels, coalesce(p_notes, ''),
      case when coalesce(p_submit, false) then 'submitted' else 'draft' end, v_revision
    )
    returning * into v_annotation;
  end if;

  update public.dataset_items
  set status = case when coalesce(p_submit, false) then 'submitted' else 'in_progress' end
  where id = p_dataset_item_id;

  return to_jsonb(v_annotation);
end;
$$;

revoke all on function public.save_dataset_annotation(uuid, jsonb, text, boolean) from public, anon;
grant execute on function public.save_dataset_annotation(uuid, jsonb, text, boolean) to authenticated;

-- Record an independent review and move the work item atomically.
-- SECURITY DEFINER is narrowly scoped; project role, submission state, and
-- reviewer/annotator separation are checked explicitly before any write.
create or replace function public.review_dataset_annotation(
  p_annotation_id uuid,
  p_decision text,
  p_review_notes text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_annotation public.dataset_annotations%rowtype;
  v_item public.dataset_items%rowtype;
  v_project_id uuid;
  v_review public.annotation_reviews%rowtype;
  v_next_item_status text;
begin
  if v_actor is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_decision not in ('accepted', 'changes_requested', 'rejected') then
    raise exception 'Unsupported review decision' using errcode = '22023';
  end if;
  if char_length(coalesce(p_review_notes, '')) > 5000 then
    raise exception 'Review notes exceed 5000 characters' using errcode = '22023';
  end if;

  select a.* into v_annotation
  from public.dataset_annotations a
  where a.id = p_annotation_id
  for update;

  if not found then
    raise exception 'Annotation not found' using errcode = 'P0002';
  end if;

  select i.* into v_item
  from public.dataset_items i
  where i.id = v_annotation.dataset_item_id
  for update;

  select d.project_id into v_project_id
  from public.research_datasets d
  where d.id = v_item.dataset_id;

  if v_annotation.status <> 'submitted' or v_item.status <> 'submitted' then
    raise exception 'Only submitted annotations can be reviewed' using errcode = '22023';
  end if;
  if v_annotation.annotator_id = v_actor then
    raise exception 'An annotator cannot review their own work' using errcode = '42501';
  end if;
  if not (
    public.research_can_manage_project(v_project_id)
    or public.research_current_user_has_project_role(v_project_id, array['reviewer']::text[])
  ) then
    raise exception 'Reviewer or project manager access required' using errcode = '42501';
  end if;

  insert into public.annotation_reviews (
    annotation_id, reviewer_id, decision, review_notes
  ) values (
    p_annotation_id, v_actor, p_decision, coalesce(p_review_notes, '')
  )
  returning * into v_review;

  v_next_item_status := case p_decision
    when 'accepted' then 'accepted'
    when 'rejected' then 'rejected'
    else 'in_progress'
  end;

  update public.dataset_items
  set status = v_next_item_status
  where id = v_item.id;

  return jsonb_build_object(
    'review_id', v_review.id,
    'annotation_id', v_review.annotation_id,
    'decision', v_review.decision,
    'item_status', v_next_item_status,
    'created_at', v_review.created_at
  );
end;
$$;

revoke all on function public.review_dataset_annotation(uuid, text, text) from public, anon;
grant execute on function public.review_dataset_annotation(uuid, text, text) to authenticated;
