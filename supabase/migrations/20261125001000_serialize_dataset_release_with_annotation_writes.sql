-- Serialize release creation against item-level annotation workflow writes.
-- This migration only replaces create_dataset_release; it does not alter data.

create or replace function public.create_dataset_release(p_dataset_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_dataset public.research_datasets%rowtype;
  v_release_number integer;
  v_manifest jsonb;
  v_record_count integer;
  v_checksum text;
  v_release public.dataset_releases%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into v_dataset
  from public.research_datasets
  where id = p_dataset_id
  for update;

  if not found then
    raise exception 'Dataset not found' using errcode = 'P0002';
  end if;
  if not public.research_can_manage_project(v_dataset.project_id) then
    raise exception 'Project manager access required to create a dataset release' using errcode = '42501';
  end if;
  if v_dataset.consent_basis = 'pending_review'
     or v_dataset.status in ('restricted', 'archived')
     or (v_dataset.consent_basis = 'public_licensed' and nullif(btrim(v_dataset.license), '') is null) then
    raise exception 'Dataset rights and status must be resolved before release' using errcode = '22023';
  end if;

  -- Serialize release eligibility against annotation saves and reviews.
  -- Both save_dataset_annotation and review_dataset_annotation lock the item
  -- before touching its annotation. Lock all items in stable order before
  -- reading the manifest so the release has a consistent workflow snapshot.
  perform 1
  from public.dataset_items i
  where i.dataset_id = p_dataset_id
  order by i.id
  for update;

  select coalesce(max(release_number), 0) + 1 into v_release_number
  from public.dataset_releases
  where dataset_id = p_dataset_id;

  select jsonb_build_object(
    'manifest_version', 'jinox-dataset-manifest-v1',
    'dataset_id', p_dataset_id,
    'dataset_name', v_dataset.name,
    'modality', v_dataset.modality,
    'release_number', v_release_number,
    'generated_at', now(),
    'records', coalesce(jsonb_agg(
      jsonb_build_object(
        'dataset_item_id', eligible.dataset_item_id,
        'asset_id', eligible.asset_id,
        'modality', eligible.modality,
        'recorded_checksum_sha256', eligible.recorded_checksum_sha256,
        'annotation_id', eligible.annotation_id,
        'annotation_schema_version', eligible.annotation_schema_version
      ) order by eligible.dataset_item_id
    ), '[]'::jsonb)
  ) into v_manifest
  from (
    select
      i.id as dataset_item_id,
      a.id as asset_id,
      a.modality,
      a.checksum_sha256 as recorded_checksum_sha256,
      annotation.id as annotation_id,
      annotation.schema_version as annotation_schema_version
    from public.dataset_items i
    join public.clinical_assets a on a.id = i.clinical_asset_id
    join public.clinical_cases c on c.id = a.case_id
    join lateral (
      select e.decision
      from public.dataset_item_curation_events e
      where e.dataset_item_id = i.id
      order by e.created_at desc, e.id desc
      limit 1
    ) latest_curation on latest_curation.decision = 'include'
    join lateral (
      select an.id, an.schema_version
      from public.dataset_annotations an
      where an.dataset_item_id = i.id
        and an.annotator_id = i.assigned_to
        and an.status = 'submitted'
        and not exists (
          select 1
          from public.dataset_annotations newer
          where newer.dataset_item_id = an.dataset_item_id
            and newer.annotator_id = an.annotator_id
            and newer.revision > an.revision
        )
    ) annotation on true
    join lateral (
      select r.decision
      from public.annotation_reviews r
      where r.annotation_id = annotation.id
      order by r.created_at desc, r.id desc
      limit 1
    ) latest_review on latest_review.decision = 'accepted'
    where i.dataset_id = p_dataset_id
      and i.status = 'accepted'
      and a.status = 'approved'
      and a.checksum_sha256 is not null
      and c.status = 'open'
      and c.consent_status in ('obtained', 'ethics_waiver')
  ) eligible;

  v_record_count := jsonb_array_length(v_manifest -> 'records');
  if v_record_count = 0 then
    raise exception 'No eligible included records are available for release' using errcode = '22023';
  end if;

  v_checksum := encode(public.digest(convert_to(v_manifest::text, 'UTF8'), 'sha256'), 'hex');

  insert into public.dataset_releases (
    dataset_id, release_number, record_count, manifest, manifest_sha256, created_by
  ) values (
    p_dataset_id, v_release_number, v_record_count, v_manifest, v_checksum, v_actor
  )
  returning * into v_release;

  insert into public.research_audit_logs (
    project_id, actor_id, action, resource_type, resource_id, details
  ) values (
    v_dataset.project_id, v_actor, 'dataset.release_created', 'dataset_release', v_release.id::text,
    jsonb_build_object(
      'dataset_id', p_dataset_id,
      'release_number', v_release_number,
      'record_count', v_record_count,
      'manifest_sha256', v_checksum
    )
  );

  return jsonb_build_object(
    'id', v_release.id,
    'dataset_id', v_release.dataset_id,
    'release_number', v_release.release_number,
    'record_count', v_release.record_count,
    'manifest_sha256', v_release.manifest_sha256,
    'created_at', v_release.created_at
  );
end;
$$;

revoke all on function public.create_dataset_release(uuid) from public, anon;
grant execute on function public.create_dataset_release(uuid) to authenticated;
