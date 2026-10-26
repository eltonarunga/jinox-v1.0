-- Support idempotent structured imports from validated source assets.
alter table public.clinical_observations
  add column if not exists source_asset_id uuid references public.clinical_assets(id) on delete set null,
  add column if not exists source_row_number integer check (source_row_number is null or source_row_number > 0);

alter table public.environmental_measurements
  add column if not exists source_asset_id uuid references public.clinical_assets(id) on delete set null,
  add column if not exists source_row_number integer check (source_row_number is null or source_row_number > 0);

create unique index if not exists idx_clinical_observations_source_row
  on public.clinical_observations(source_asset_id, source_row_number)
  where source_asset_id is not null and source_row_number is not null;

create unique index if not exists idx_environmental_measurements_source_row
  on public.environmental_measurements(source_asset_id, source_row_number)
  where source_asset_id is not null and source_row_number is not null;

create unique index if not exists idx_clinical_assets_case_checksum
  on public.clinical_assets(case_id, checksum_sha256)
  where checksum_sha256 is not null;
