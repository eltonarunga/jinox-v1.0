-- JinoX privileged clinical asset review workflow.
-- Only a global administrator who is not the uploader may make a one-time
-- pending_review -> approved/rejected/quarantined transition.
-- The audit row and asset transition must occur in the same transaction.

create table if not exists public.clinical_asset_reviews (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null unique references public.clinical_assets(id) on delete restrict,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  decision text not null check (decision in ('approve', 'reject', 'quarantine')),
  reason text not null default '' check (char_length(reason) <= 2000),
  previous_status text not null check (previous_status = 'pending_review'),
  new_status text not null check (new_status in ('approved', 'rejected', 'quarantined')),
  transaction_id bigint not null,
  created_at timestamptz not null default now(),
  constraint clinical_asset_review_decision_status_check check (
    (decision = 'approve' and new_status = 'approved')
    or (decision = 'reject' and new_status = 'rejected')
    or (decision = 'quarantine' and new_status = 'quarantined')
  ),
  constraint clinical_asset_review_reason_required check (
    decision = 'approve' or char_length(btrim(reason)) > 0
  )
);

create index if not exists idx_clinical_asset_reviews_reviewer_created
  on public.clinical_asset_reviews(reviewer_id, created_at desc);

alter table public.clinical_asset_reviews enable row level security;

drop policy if exists "admins can read clinical asset review history"
  on public.clinical_asset_reviews;
create policy "admins can read clinical asset review history"
on public.clinical_asset_reviews
for select to authenticated
using ((select public.current_profile_role()) = 'admin');

revoke all on public.clinical_asset_reviews from public, anon;
grant select on public.clinical_asset_reviews to authenticated;

create or replace function public.prevent_clinical_asset_review_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Clinical asset review history is append-only'
    using errcode = '42501';
end;
$$;

revoke all on function public.prevent_clinical_asset_review_mutation() from public, anon, authenticated;

drop trigger if exists prevent_clinical_asset_review_mutation
  on public.clinical_asset_reviews;
create trigger prevent_clinical_asset_review_mutation
before update or delete on public.clinical_asset_reviews
for each row execute function public.prevent_clinical_asset_review_mutation();

-- Administrators may inspect pending asset metadata. The normal owner and
-- assigned-project policies remain in place for their existing use cases.
drop policy if exists "admins can read clinical assets for review"
  on public.clinical_assets;
create policy "admins can read clinical assets for review"
on public.clinical_assets
for select to authenticated
using ((select public.current_profile_role()) = 'admin');

-- Signed URL creation checks storage.objects SELECT policies. This grants
-- administrator review access only to this private JinoX bucket.
drop policy if exists "admins can read private clinical files for review"
  on storage.objects;
create policy "admins can read private clinical files for review"
on storage.objects
for select to authenticated
using (
  bucket_id = 'jinox-clinical-assets'
  and (select public.current_profile_role()) = 'admin'
);

-- Preserve the existing intake protections, while permitting a very narrow
-- review transition backed by a same-transaction, admin-authored audit row.
create or replace function public.guard_clinical_asset_intake()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_case_owner uuid;
  v_case_consent text;
  v_case_status text;
  v_object_metadata jsonb;
  v_object_size bigint;
  v_object_mime text;
  v_max_bytes bigint;
  v_expected_prefix text;
begin
  -- Trusted server-side administrative operations run without an end-user JWT.
  if v_actor is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if coalesce(public.current_profile_role(), '') <> 'admin'
       or old.owner_id = v_actor
       or old.status <> 'pending_review'
       or new.status not in ('approved', 'rejected', 'quarantined')
       or new.reviewed_at is null
       or (to_jsonb(new) - array['status','reviewed_at','validation_notes'])
          is distinct from
          (to_jsonb(old) - array['status','reviewed_at','validation_notes'])
       or not exists (
         select 1
         from public.clinical_asset_reviews r
         where r.asset_id = old.id
           and r.reviewer_id = v_actor
           and r.previous_status = old.status
           and r.new_status = new.status
           and r.reason = new.validation_notes
           and r.transaction_id = txid_current()
       ) then
      raise exception 'Asset review transition requires a matching administrator audit record'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if new.owner_id is distinct from v_actor then
    raise exception 'Asset owner must match the authenticated user'
      using errcode = '42501';
  end if;

  if new.status <> 'pending_review'
     or new.reviewed_at is not null
     or coalesce(new.validation_notes, '') <> '' then
    raise exception 'New assets must enter pending review; clients cannot approve or pre-review uploads'
      using errcode = '42501';
  end if;

  select c.owner_id, c.consent_status, c.status
    into v_case_owner, v_case_consent, v_case_status
  from public.clinical_cases c
  where c.id = new.case_id
  for key share;

  if not found
     or v_case_owner is distinct from v_actor
     or v_case_status <> 'open'
     or v_case_consent not in ('obtained', 'ethics_waiver') then
    raise exception 'An open case owned by the uploader with documented consent or an ethics waiver is required'
      using errcode = '42501';
  end if;

  if new.original_filename !~ '^[a-z_]+-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9a-f]{8}\.[a-z0-9]{1,8}$' then
    raise exception 'Asset filename must use the generated pseudonymous filename format'
      using errcode = '22023';
  end if;

  v_expected_prefix := v_actor::text || '/' || new.case_id::text || '/';
  if left(new.storage_path, char_length(v_expected_prefix)) <> v_expected_prefix
     or split_part(new.storage_path, '/', 3) !~ '^[0-9a-fA-F-]{36}-[A-Za-z0-9._-]{1,255}$'
     or split_part(new.storage_path, '/', 4) <> ''
     or right(new.storage_path, char_length(new.original_filename)) <> new.original_filename then
    raise exception 'Storage path must be a generated object under the uploader and case prefixes'
      using errcode = '22023';
  end if;

  if not public.clinical_asset_mime_allowed(new.modality, new.content_type) then
    raise exception 'Content type is not allowed for the selected asset modality'
      using errcode = '22023';
  end if;

  v_max_bytes := case
    when new.modality = 'intraoral_photo' then 26214400
    when new.modality in ('clinical_record', 'environmental_dataset') then 10485760
    else 104857600
  end;

  if new.byte_size > v_max_bytes then
    raise exception 'Asset exceeds the modality-specific upload size limit'
      using errcode = '22023';
  end if;

  if new.modality in ('clinical_record', 'environmental_dataset')
     and new.checksum_sha256 is null then
    raise exception 'Structured data imports require a SHA-256 checksum'
      using errcode = '22023';
  end if;

  if new.metadata - array['filename_redacted','client_extension'] <> '{}'::jsonb
     or new.metadata -> 'filename_redacted' is distinct from 'true'::jsonb
     or new.metadata ->> 'client_extension' is distinct from '.' || substring(new.original_filename from '\.([^.]+)$') then
    raise exception 'Asset metadata must contain only the generated filename-redaction fields'
      using errcode = '22023';
  end if;

  select o.metadata
    into v_object_metadata
  from storage.objects o
  where o.bucket_id = 'jinox-clinical-assets'
    and o.name = new.storage_path;

  if not found then
    raise exception 'Private storage object must exist before asset metadata is registered'
      using errcode = '23503';
  end if;

  if coalesce(v_object_metadata ->> 'size', '') !~ '^[0-9]+$' then
    raise exception 'Storage object is missing valid size metadata'
      using errcode = '22023';
  end if;

  v_object_size := (v_object_metadata ->> 'size')::bigint;
  v_object_mime := v_object_metadata ->> 'mimetype';

  if v_object_size <> new.byte_size
     or v_object_mime is distinct from new.content_type then
    raise exception 'Asset metadata must match the uploaded storage object size and content type'
      using errcode = '22023';
  end if;

  return new;
end;
$$;

revoke all on function public.guard_clinical_asset_intake() from public, anon, authenticated;

-- A SECURITY DEFINER RPC is the only authenticated write path. It checks the
-- global admin role, uploader separation, pending state and decision rationale.
create or replace function public.review_clinical_asset(
  p_asset_id uuid,
  p_decision text,
  p_reason text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_asset public.clinical_assets%rowtype;
  v_new_status text;
  v_reason text := btrim(coalesce(p_reason, ''));
  v_review public.clinical_asset_reviews%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if coalesce(public.current_profile_role(), '') <> 'admin' then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if p_decision not in ('approve', 'reject', 'quarantine') then
    raise exception 'Unsupported asset review decision' using errcode = '22023';
  end if;

  if char_length(v_reason) > 2000 then
    raise exception 'Review reason exceeds 2000 characters' using errcode = '22023';
  end if;

  if p_decision <> 'approve' and char_length(v_reason) = 0 then
    raise exception 'A reason is required when rejecting or quarantining an asset' using errcode = '22023';
  end if;

  select a.* into v_asset
  from public.clinical_assets a
  where a.id = p_asset_id
  for update;

  if not found then
    raise exception 'Asset not found' using errcode = 'P0002';
  end if;

  if v_asset.owner_id = v_actor then
    raise exception 'An uploader cannot review their own asset' using errcode = '42501';
  end if;

  if v_asset.status <> 'pending_review' or v_asset.reviewed_at is not null then
    raise exception 'Only pending assets can receive a review decision' using errcode = '22023';
  end if;

  v_new_status := case p_decision
    when 'approve' then 'approved'
    when 'reject' then 'rejected'
    when 'quarantine' then 'quarantined'
  end;

  insert into public.clinical_asset_reviews (
    asset_id, reviewer_id, decision, reason, previous_status, new_status, transaction_id
  ) values (
    v_asset.id, v_actor, p_decision, v_reason, v_asset.status, v_new_status, txid_current()
  )
  returning * into v_review;

  update public.clinical_assets
  set status = v_new_status,
      reviewed_at = now(),
      validation_notes = v_reason
  where id = v_asset.id;

  return jsonb_build_object(
    'review_id', v_review.id,
    'asset_id', v_review.asset_id,
    'decision', v_review.decision,
    'status', v_review.new_status,
    'reviewed_at', v_review.created_at
  );
end;
$$;

revoke all on function public.review_clinical_asset(uuid, text, text) from public, anon;
grant execute on function public.review_clinical_asset(uuid, text, text) to authenticated;
