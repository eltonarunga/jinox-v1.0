-- Governed dataset curation and immutable metadata releases.
-- A release is a frozen eligibility manifest, not a data export or model-ready package.
-- Apply to staging first and validate with distinct project roles before production.

create table if not exists public.dataset_item_curation_events (
  id uuid primary key default gen_random_uuid(),
  dataset_item_id uuid not null references public.dataset_items(id) on delete restrict,
  curator_id uuid not null references auth.users(id) on delete restrict,
  decision text not null check (decision in ('include', 'exclude', 'remediation_required')),
  rationale text not null default '' check (char_length(rationale) <= 5000),
  created_at timestamptz not null default now(),
  constraint dataset_item_curation_rationale_required check (
    decision = 'include' or char_length(btrim(rationale)) >= 3
  )
);

create index if not exists idx_dataset_item_curation_latest
  on public.dataset_item_curation_events(dataset_item_id, created_at desc, id desc);

create table if not exists public.dataset_releases (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.research_datasets(id) on delete restrict,
  release_number integer not null check (release_number > 0),
  record_count integer not null check (record_count > 0),
  manifest jsonb not null check (jsonb_typeof(manifest) = 'object'),
  manifest_sha256 text not null check (manifest_sha256 ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (dataset_id, release_number),
  unique (dataset_id, manifest_sha256)
);

create index if not exists idx_dataset_releases_dataset_created
  on public.dataset_releases(dataset_id, created_at desc);

alter table public.dataset_item_curation_events enable row level security;
alter table public.dataset_releases enable row level security;

-- Reviews must be written through the atomic review RPC. Direct table inserts
-- would otherwise allow a reviewer to manufacture an accepted QA decision.
drop policy if exists "project owners can add annotation reviews" on public.annotation_reviews;
drop policy if exists "reviewers can review submitted work" on public.annotation_reviews;
revoke insert on public.annotation_reviews from authenticated;


drop policy if exists "project reviewers and managers can read curation history"
  on public.dataset_item_curation_events;
create policy "project reviewers and managers can read curation history"
on public.dataset_item_curation_events
for select to authenticated
using (
  exists (
    select 1
    from public.dataset_items i
    join public.research_datasets d on d.id = i.dataset_id
    where i.id = dataset_item_curation_events.dataset_item_id
      and (
        public.research_can_manage_project(d.project_id)
        or public.research_current_user_has_project_role(d.project_id, array['reviewer']::text[])
      )
  )
);

drop policy if exists "project members can read dataset release manifests"
  on public.dataset_releases;
create policy "project members can read dataset release manifests"
on public.dataset_releases
for select to authenticated
using (
  exists (
    select 1 from public.research_datasets d
    where d.id = dataset_releases.dataset_id
      and public.research_is_project_member(d.project_id)
  )
);

revoke all on public.dataset_item_curation_events from public, anon, authenticated;
grant select on public.dataset_item_curation_events to authenticated;
revoke all on public.dataset_releases from public, anon, authenticated;
grant select on public.dataset_releases to authenticated;

create or replace function public.prevent_dataset_governance_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Dataset curation history and release manifests are append-only'
    using errcode = '42501';
end;
$$;

revoke all on function public.prevent_dataset_governance_mutation() from public, anon, authenticated;

drop trigger if exists prevent_dataset_curation_event_mutation
  on public.dataset_item_curation_events;
create trigger prevent_dataset_curation_event_mutation
before update or delete on public.dataset_item_curation_events
for each row execute function public.prevent_dataset_governance_mutation();

drop trigger if exists prevent_dataset_release_mutation
  on public.dataset_releases;
create trigger prevent_dataset_release_mutation
before update or delete on public.dataset_releases
for each row execute function public.prevent_dataset_governance_mutation();

-- All curation writes pass through this RPC. Locking the dataset serializes
-- curation changes against release creation for the same dataset.
create or replace function public.curate_dataset_item(
  p_dataset_item_id uuid,
  p_decision text,
  p_rationale text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_item public.dataset_items%rowtype;
  v_dataset public.research_datasets%rowtype;
  v_asset public.clinical_assets%rowtype;
  v_case public.clinical_cases%rowtype;
  v_event public.dataset_item_curation_events%rowtype;
  v_rationale text := btrim(coalesce(p_rationale, ''));
begin
  if v_actor is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_decision is null or p_decision not in ('include', 'exclude', 'remediation_required') then
    raise exception 'Unsupported curation decision' using errcode = '22023';
  end if;
  if char_length(v_rationale) > 5000
     or (p_decision <> 'include' and char_length(v_rationale) < 3) then
    raise exception 'A concise rationale is required for exclusion or remediation' using errcode = '22023';
  end if;

  select d.* into v_dataset
  from public.research_datasets d
  join public.dataset_items i on i.dataset_id = d.id
  where i.id = p_dataset_item_id
  for update of d, i;

  if not found then
    raise exception 'Dataset item not found' using errcode = 'P0002';
  end if;
  if not (
    public.research_can_manage_project(v_dataset.project_id)
    or public.research_current_user_has_project_role(v_dataset.project_id, array['reviewer']::text[])
  ) then
    raise exception 'Reviewer or project manager access required' using errcode = '42501';
  end if;

  select * into v_item
  from public.dataset_items
  where id = p_dataset_item_id;

  if p_decision = 'include' then
    if v_dataset.consent_basis = 'pending_review'
       or v_dataset.status in ('restricted', 'archived')
       or (v_dataset.consent_basis = 'public_licensed' and nullif(btrim(v_dataset.license), '') is null) then
      raise exception 'Dataset rights and status must be resolved before inclusion' using errcode = '22023';
    end if;
    if v_item.status <> 'accepted' then
      raise exception 'Only independently accepted annotation items can be included in this release workflow' using errcode = '22023';
    end if;

    select a.* into v_asset
    from public.clinical_assets a
    where a.id = v_item.clinical_asset_id;

    if not found or v_asset.status <> 'approved' or v_asset.checksum_sha256 is null then
      raise exception 'The source asset must be approved and have a recorded SHA-256 checksum' using errcode = '22023';
    end if;

    select c.* into v_case
    from public.clinical_cases c
    where c.id = v_asset.case_id;

    if not found or v_case.status <> 'open'
       or v_case.consent_status not in ('obtained', 'ethics_waiver') then
      raise exception 'The source case must have current consent or a documented ethics waiver' using errcode = '22023';
    end if;

    if not exists (
      select 1
      from public.dataset_annotations a
      join lateral (
        select r.decision
        from public.annotation_reviews r
        where r.annotation_id = a.id
        order by r.created_at desc, r.id desc
        limit 1
      ) latest_review on latest_review.decision = 'accepted'
      where a.dataset_item_id = v_item.id
        and a.status = 'submitted'
    ) then
      raise exception 'An independently accepted annotation is required' using errcode = '22023';
    end if;
  end if;

  insert into public.dataset_item_curation_events (
    dataset_item_id, curator_id, decision, rationale
  ) values (
    p_dataset_item_id, v_actor, p_decision, v_rationale
  )
  returning * into v_event;

  insert into public.research_audit_logs (
    project_id, actor_id, action, resource_type, resource_id, details
  ) values (
    v_dataset.project_id, v_actor, 'dataset_item.curated', 'dataset_item', v_item.id::text,
    jsonb_build_object('decision', p_decision, 'curation_event_id', v_event.id)
  );

  return jsonb_build_object(
    'id', v_event.id,
    'dataset_item_id', v_event.dataset_item_id,
    'decision', v_event.decision,
    'rationale', v_event.rationale,
    'created_at', v_event.created_at
  );
end;
$$;

revoke all on function public.curate_dataset_item(uuid, text, text) from public, anon;
grant execute on function public.curate_dataset_item(uuid, text, text) to authenticated;

-- Seal an immutable metadata manifest from the latest included, accepted,
-- consent-eligible items. No filenames, storage paths, case codes, labels,
-- clinical notes, or signed URLs are copied into the manifest.
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
      join lateral (
        select r.decision, r.created_at
        from public.annotation_reviews r
        where r.annotation_id = an.id
        order by r.created_at desc, r.id desc
        limit 1
      ) latest_review on latest_review.decision = 'accepted'
      where an.dataset_item_id = i.id and an.status = 'submitted'
      order by an.revision desc, latest_review.created_at desc
      limit 1
    ) annotation on true
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
