-- JinoX AI: secure case intake, multimodal assets and structured observations.
-- All uploads are private and pending review; this migration does not enable AI inference.

create table if not exists public.clinical_cases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  case_code text not null check (case_code ~ '^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$'),
  age_band text check (age_band is null or age_band in ('0_5','6_12','13_17','18_29','30_44','45_59','60_plus','unknown')),
  sex_at_birth text check (sex_at_birth is null or sex_at_birth in ('female','male','intersex','unknown','not_recorded')),
  county text not null check (char_length(county) between 2 and 100),
  consent_status text not null default 'pending_review'
    check (consent_status in ('obtained','ethics_waiver','pending_review','not_applicable')),
  consent_version text check (consent_version is null or char_length(consent_version) <= 80),
  purpose text not null default 'research'
    check (purpose in ('research','clinical_review','quality_improvement')),
  status text not null default 'open' check (status in ('open','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, case_code)
);

create index if not exists idx_clinical_cases_owner_created
  on public.clinical_cases(owner_id, created_at desc);

create table if not exists public.clinical_assets (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.clinical_cases(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  modality text not null check (modality in (
    'intraoral_photo','panoramic_xray','periapical_xray','bitewing_xray','cbct',
    'intraoral_scan','clinical_record','environmental_dataset','other'
  )),
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  content_type text not null check (char_length(content_type) <= 150),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 104857600),
  storage_path text not null unique,
  checksum_sha256 text check (checksum_sha256 is null or checksum_sha256 ~ '^[a-f0-9]{64}$'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  status text not null default 'pending_review'
    check (status in ('pending_review','approved','rejected','quarantined')),
  validation_notes text not null default '' check (char_length(validation_notes) <= 2000),
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_clinical_assets_case_uploaded
  on public.clinical_assets(case_id, uploaded_at desc);

create table if not exists public.clinical_observations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.clinical_cases(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in (
    'dental_caries','periodontal','oral_mucosa','fluorosis','pain','occlusion','other'
  )),
  observation_code text not null check (observation_code ~ '^[A-Za-z0-9][A-Za-z0-9_.:-]{1,79}$'),
  finding text not null check (char_length(finding) between 1 and 3000),
  value_numeric numeric,
  unit text check (unit is null or char_length(unit) <= 40),
  observed_on date not null,
  source text not null default 'clinician_entered'
    check (source in ('clinician_entered','imported_record','research_annotation')),
  status text not null default 'unreviewed'
    check (status in ('unreviewed','reviewed','corrected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_clinical_observations_case_date
  on public.clinical_observations(case_id, observed_on desc);

create table if not exists public.environmental_measurements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid references public.clinical_cases(id) on delete set null,
  sample_site_code text not null check (sample_site_code ~ '^[A-Za-z0-9][A-Za-z0-9_-]{1,79}$'),
  county text not null check (char_length(county) between 2 and 100),
  sub_county text check (sub_county is null or char_length(sub_county) <= 100),
  water_source text not null check (water_source in ('borehole','well','piped','surface_water','bottled','other','unknown')),
  sampled_on date not null,
  fluoride_mg_l numeric check (fluoride_mg_l is null or fluoride_mg_l between 0 and 100),
  temperature_c numeric check (temperature_c is null or temperature_c between -20 and 70),
  rainfall_mm numeric check (rainfall_mm is null or rainfall_mm between 0 and 10000),
  source_name text not null check (char_length(source_name) between 2 and 200),
  notes text not null default '' check (char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists idx_environmental_measurements_owner_date
  on public.environmental_measurements(owner_id, sampled_on desc);

alter table public.clinical_cases enable row level security;
alter table public.clinical_assets enable row level security;
alter table public.clinical_observations enable row level security;
alter table public.environmental_measurements enable row level security;

drop policy if exists "case owners can read own cases" on public.clinical_cases;
create policy "case owners can read own cases" on public.clinical_cases
  for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists "users can create own cases" on public.clinical_cases;
create policy "users can create own cases" on public.clinical_cases
  for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "case owners can update own cases" on public.clinical_cases;
create policy "case owners can update own cases" on public.clinical_cases
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
drop policy if exists "case owners can archive own cases" on public.clinical_cases;
create policy "case owners can archive own cases" on public.clinical_cases
  for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "owners can read own assets" on public.clinical_assets;
create policy "owners can read own assets" on public.clinical_assets
  for select to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "owners can register assets for own cases" on public.clinical_assets;
create policy "owners can register assets for own cases" on public.clinical_assets
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "owners can update own assets" on public.clinical_assets;
create policy "owners can update own assets" on public.clinical_assets
  for update to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
    )
  ) with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "owners can delete own assets" on public.clinical_assets;
create policy "owners can delete own assets" on public.clinical_assets
  for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "owners can read own observations" on public.clinical_observations;
create policy "owners can read own observations" on public.clinical_observations
  for select to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "owners can create own observations" on public.clinical_observations;
create policy "owners can create own observations" on public.clinical_observations
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "owners can update own observations" on public.clinical_observations;
create policy "owners can update own observations" on public.clinical_observations
  for update to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
    )
  ) with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "owners can delete own observations" on public.clinical_observations;
create policy "owners can delete own observations" on public.clinical_observations
  for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "owners can read own environmental measurements" on public.environmental_measurements;
create policy "owners can read own environmental measurements" on public.environmental_measurements
  for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists "owners can create own environmental measurements" on public.environmental_measurements;
create policy "owners can create own environmental measurements" on public.environmental_measurements
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and (
      case_id is null or exists (
        select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
      )
    )
  );
drop policy if exists "owners can update own environmental measurements" on public.environmental_measurements;
create policy "owners can update own environmental measurements" on public.environmental_measurements
  for update to authenticated using (
    owner_id = (select auth.uid()) and (
      case_id is null or exists (
        select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
      )
    )
  ) with check (
    owner_id = (select auth.uid()) and (
      case_id is null or exists (
        select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
      )
    )
  );
drop policy if exists "owners can delete own environmental measurements" on public.environmental_measurements;
create policy "owners can delete own environmental measurements" on public.environmental_measurements
  for delete to authenticated using (owner_id = (select auth.uid()));

grant select, insert, update, delete on public.clinical_cases to authenticated;
grant select, insert, update, delete on public.clinical_assets to authenticated;
grant select, insert, update, delete on public.clinical_observations to authenticated;
grant select, insert, update, delete on public.environmental_measurements to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values ('jinox-clinical-assets', 'jinox-clinical-assets', false, 104857600)
on conflict (id) do update set public = false, file_size_limit = 104857600;

drop policy if exists "case owners can read private clinical files" on storage.objects;
create policy "case owners can read private clinical files" on storage.objects
  for select to authenticated using (
    bucket_id = 'jinox-clinical-assets'
    and split_part(name, '/', 1) = (select auth.uid())::text
    and exists (
      select 1 from public.clinical_cases c
      where c.id::text = split_part(name, '/', 2) and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "case owners can upload private clinical files" on storage.objects;
create policy "case owners can upload private clinical files" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'jinox-clinical-assets'
    and split_part(name, '/', 1) = (select auth.uid())::text
    and exists (
      select 1 from public.clinical_cases c
      where c.id::text = split_part(name, '/', 2) and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "case owners can update private clinical files" on storage.objects;
create policy "case owners can update private clinical files" on storage.objects
  for update to authenticated using (
    bucket_id = 'jinox-clinical-assets'
    and split_part(name, '/', 1) = (select auth.uid())::text
    and exists (
      select 1 from public.clinical_cases c
      where c.id::text = split_part(name, '/', 2) and c.owner_id = (select auth.uid())
    )
  ) with check (
    bucket_id = 'jinox-clinical-assets'
    and split_part(name, '/', 1) = (select auth.uid())::text
    and exists (
      select 1 from public.clinical_cases c
      where c.id::text = split_part(name, '/', 2) and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "case owners can delete private clinical files" on storage.objects;
create policy "case owners can delete private clinical files" on storage.objects
  for delete to authenticated using (
    bucket_id = 'jinox-clinical-assets'
    and split_part(name, '/', 1) = (select auth.uid())::text
    and exists (
      select 1 from public.clinical_cases c
      where c.id::text = split_part(name, '/', 2) and c.owner_id = (select auth.uid())
    )
  );
