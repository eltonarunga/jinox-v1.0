-- ==============================================================================
-- JinoX AI — Production Supabase Schema
-- Multimodal Oral & Craniofacial Health Platform (Kenya Pilot Build)
-- ==============================================================================

create extension if not exists "pgcrypto";

-- Automatic updated_at timestamp trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------------------------
-- 1. Counties: Regional groundwater fluoride readings & demographic stats
-- ------------------------------------------------------------------------------
create table if not exists counties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  fluoride_ppm numeric(5,2) not null check (fluoride_ppm >= 0),
  risk_tier text not null check (risk_tier in ('low', 'mod', 'high')),
  screened_count int not null default 0,
  referral_rate text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_counties_name on counties (name);
create index if not exists idx_counties_tier on counties (risk_tier);

drop trigger if exists set_counties_updated_at on counties;
create trigger set_counties_updated_at
  before update on counties
  for each row execute function handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. Screenings: Individual triage events captured by Community Health Promoters
-- ------------------------------------------------------------------------------
create table if not exists screenings (
  id uuid primary key default gen_random_uuid(),
  county_id uuid references counties(id) on delete set null,
  patient_age int check (patient_age >= 0 and patient_age <= 125),
  imaging_signal numeric(5,2) not null check (imaging_signal >= 0 and imaging_signal <= 100),
  environmental_signal numeric(5,2) not null check (environmental_signal >= 0 and environmental_signal <= 100),
  genetic_signal numeric(5,2) not null check (genetic_signal >= 0 and genetic_signal <= 100),
  fused_fluorosis_risk numeric(5,2) not null check (fused_fluorosis_risk >= 0 and fused_fluorosis_risk <= 100),
  risk_tier text not null check (risk_tier in ('low', 'mod', 'high')),
  referred_for_review boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_screenings_county_id on screenings (county_id);
create index if not exists idx_screenings_tier on screenings (risk_tier);
create index if not exists idx_screenings_created_at on screenings (created_at desc);

-- ------------------------------------------------------------------------------
-- 3. Model Versions: Model registry and fairness/equity validation audits
-- ------------------------------------------------------------------------------
create table if not exists model_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  auc numeric(4,3) not null check (auc >= 0 and auc <= 1),
  min_subgroup_auc numeric(4,3) check (min_subgroup_auc >= 0 and min_subgroup_auc <= 1),
  sensitivity numeric(4,3) check (sensitivity >= 0 and sensitivity <= 1),
  specificity numeric(4,3) check (specificity >= 0 and specificity <= 1),
  evaluated_subgroups text[] default '{}',
  released_at timestamptz not null default now()
);

create index if not exists idx_model_versions_version on model_versions (version);

-- ------------------------------------------------------------------------------
-- 4. Dataset Snapshots: Multimodal registry audit trail for academic governance
-- ------------------------------------------------------------------------------
create table if not exists dataset_snapshots (
  id uuid primary key default gen_random_uuid(),
  record_count int not null check (record_count >= 0),
  counties_covered int not null check (counties_covered >= 0),
  modalities text[] not null,
  license text,
  captured_at timestamptz not null default now()
);

-- ==============================================================================
-- Row Level Security (RLS) & Privacy Controls
-- ==============================================================================
alter table counties enable row level security;
alter table screenings enable row level security;
alter table model_versions enable row level security;
alter table dataset_snapshots enable row level security;

-- Public read policies for open public health intelligence & academic research
create policy "public read counties" on counties for select using (true);
create policy "public read model_versions" on model_versions for select using (true);
create policy "public read dataset_snapshots" on dataset_snapshots for select using (true);

-- Anonymous insert allowed for low-resource field triage telemetry, no public select
create policy "anon insert screenings" on screenings for insert with check (true);
-- Notice: screenings has NO public select policy, enforcing strict patient privacy
