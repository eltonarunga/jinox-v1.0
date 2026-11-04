-- JinoX asset intake governance hardening.
-- Authenticated owners may upload assets, but cannot approve or rewrite review state.
-- Apply to staging first; this does not provide malware scanning or DICOM/image de-identification.

create or replace function public.clinical_asset_mime_allowed(
  p_modality text,
  p_content_type text
)
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select case p_modality
    when 'intraoral_photo' then p_content_type = any (array['image/jpeg','image/png','image/webp']::text[])
    when 'panoramic_xray' then p_content_type = any (array['application/dicom','image/jpeg','image/png','image/tiff']::text[])
    when 'periapical_xray' then p_content_type = any (array['application/dicom','image/jpeg','image/png','image/tiff']::text[])
    when 'bitewing_xray' then p_content_type = any (array['application/dicom','image/jpeg','image/png','image/tiff']::text[])
    when 'cbct' then p_content_type = any (array['application/dicom','application/zip']::text[])
    when 'intraoral_scan' then p_content_type = any (array['model/stl','application/sla','model/obj','model/ply','application/zip']::text[])
    when 'clinical_record' then p_content_type = any (array['text/csv','application/json']::text[])
    when 'environmental_dataset' then p_content_type = any (array['text/csv','application/json']::text[])
    when 'other' then p_content_type = any (array[
      'image/jpeg','image/png','image/webp','image/tiff','application/dicom',
      'application/zip','model/stl','application/sla','model/obj','model/ply',
      'text/csv','application/json'
    ]::text[])
    else false
  end;
$$;

revoke all on function public.clinical_asset_mime_allowed(text, text) from public, anon;
grant execute on function public.clinical_asset_mime_allowed(text, text) to authenticated;

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
  -- They remain subject to the application's privileged review procedure.
  if v_actor is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    raise exception 'Asset metadata and review state cannot be changed by an authenticated client'
      using errcode = '42501';
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

drop trigger if exists guard_clinical_asset_intake on public.clinical_assets;
create trigger guard_clinical_asset_intake
before insert or update on public.clinical_assets
for each row execute function public.guard_clinical_asset_intake();

-- The upload owner may create and remove their own records, but cannot mutate
-- approval, review timestamps, metadata, checksums or storage references.
drop policy if exists "owners can update own assets" on public.clinical_assets;
revoke update on public.clinical_assets from authenticated;
grant select, insert, delete on public.clinical_assets to authenticated;

-- Enforce storage-level MIME and size limits before an object is accepted.
-- MIME metadata is client-supplied, so this is an allowlist, not content sniffing.
drop policy if exists "case owners can upload private clinical files" on storage.objects;
create policy "case owners can upload private clinical files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'jinox-clinical-assets'
  and split_part(name, '/', 1) = (select auth.uid())::text
  and split_part(name, '/', 3) ~ '^[0-9a-fA-F-]{36}-[A-Za-z0-9._-]{1,255}$'
  and split_part(name, '/', 4) = ''
  and exists (
    select 1
    from public.clinical_cases c
    where c.id::text = split_part(name, '/', 2)
      and c.owner_id = (select auth.uid())
      and c.status = 'open'
      and c.consent_status in ('obtained','ethics_waiver')
  )
  and coalesce(metadata ->> 'mimetype', '') = any (array[
    'image/jpeg','image/png','image/webp','image/tiff','application/dicom',
    'application/zip','model/stl','application/sla','model/obj','model/ply',
    'text/csv','application/json'
  ]::text[])
  and case
    when coalesce(metadata ->> 'size', '') ~ '^[0-9]+$'
      then (metadata ->> 'size')::bigint between 1 and 104857600
    else false
  end
);
