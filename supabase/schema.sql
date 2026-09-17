-- JinoX AI — Supabase schema
-- Run against a Supabase project to move the app from in-memory mock data
-- (lib/data.ts) to a persisted backend. API route shapes are designed to
-- match these tables one-to-one.

create extension if not exists "pgcrypto";

-- County-level groundwater fluoride readings and rollup screening stats.
create table if not exists counties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  fluoride_ppm numeric(4,2) not null,
  risk_tier text not null check (risk_tier in ('low', 'mod', 'high')),
  source text default 'WRMA water quality survey',
  updated_at timestamptz not null default now()
);

-- Individual screening events captured by CHPs in the field.
create table if not exists screenings (
  id uuid primary key default gen_random_uuid(),
  county_id uuid references counties(id),
  patient_age int,
  imaging_signal numeric(5,2) not null,
  environmental_signal numeric(5,2) not null,
  genetic_signal numeric(5,2) not null,
  fused_fluorosis_risk numeric(5,2) not null,
  risk_tier text not null check (risk_tier in ('low', 'mod', 'high')),
  referred_for_review boolean default false,
  created_at timestamptz not null default now()
);

-- Model version history, used by /api/model/performance.
create table if not exists model_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  auc numeric(4,3) not null,
  min_subgroup_auc numeric(4,3),
  evaluated_subgroups text[] default '{}',
  released_at timestamptz not null default now()
);

-- Dataset composition snapshot, used by /api/dataset/summary.
create table if not exists dataset_snapshots (
  id uuid primary key default gen_random_uuid(),
  record_count int not null,
  counties_covered int not null,
  modalities text[] not null,
  license text default 'open-academic-use',
  captured_at timestamptz not null default now()
);

-- Row Level Security: enable and allow read-only anon access, matching the
-- proposal's "Research API free for academic and non-commercial use" model.
-- Writes (screenings) should go through a service-role key from the CHP app,
-- never the anon key.
alter table counties enable row level security;
alter table screenings enable row level security;
alter table model_versions enable row level security;
alter table dataset_snapshots enable row level security;

create policy "public read counties" on counties for select using (true);
create policy "public read model_versions" on model_versions for select using (true);
create policy "public read dataset_snapshots" on dataset_snapshots for select using (true);
-- screenings intentionally has no public select policy: patient-level data
-- is not exposed through the anon key, per the proposal's consent model.

-- Seed data mirroring lib/data.ts, so a fresh Supabase project matches the app's defaults.
insert into counties (name, fluoride_ppm, risk_tier) values
  ('Nakuru', 4.8, 'high'),
  ('Baringo', 6.1, 'high'),
  ('Kajiado', 5.2, 'high'),
  ('Kericho', 2.1, 'mod'),
  ('Nairobi', 0.8, 'low'),
  ('Turkana', 3.6, 'mod'),
  ('Kisumu', 1.1, 'low'),
  ('Machakos', 2.6, 'mod')
on conflict (name) do nothing;

insert into model_versions (version, auc, min_subgroup_auc, evaluated_subgroups) values
  ('jinox-mm-0.3', 0.85, 0.79, array['county', 'age_band', 'gender'])
on conflict (version) do nothing;

insert into dataset_snapshots (record_count, counties_covered, modalities) values
  (52340, 22, array['imaging', 'clinical', 'environmental', 'genomic']);
