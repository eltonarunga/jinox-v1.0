-- JinoX AI: clinician-entered assessment records and metadata-only genetics study planning.
-- This migration deliberately does not implement autonomous diagnosis or genetic risk scores.

create table if not exists public.clinical_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.clinical_cases(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  assessment_type text not null check (assessment_type in (
    'caries','periodontal','oral_mucosa','fluorosis','endodontic','occlusion','other'
  )),
  clinician_impression text not null check (char_length(clinician_impression) between 1 and 3000),
  differential_notes text not null default '' check (char_length(differential_notes) <= 5000),
  urgency text not null default 'not_recorded'
    check (urgency in ('routine','prompt_review','urgent_review','emergency_referral','not_recorded')),
  clinician_role_attested boolean not null default false check (clinician_role_attested = true),
  assessment_source text not null default 'clinician_entered'
    check (assessment_source = 'clinician_entered'),
  status text not null default 'draft' check (status in ('draft','finalized','amended')),
  assessed_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clinical_assessments_case_date
  on public.clinical_assessments(case_id, assessed_on desc);

create table if not exists public.genetic_risk_studies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  study_name text not null check (char_length(study_name) between 3 and 160),
  target_phenotype text not null check (target_phenotype in (
    'dental_caries','periodontal_disease','dental_fluorosis','craniofacial_development','other'
  )),
  population_description text not null check (char_length(population_description) between 3 and 2000),
  cohort_size integer check (cohort_size is null or cohort_size >= 0),
  evidence_source text not null default '' check (char_length(evidence_source) <= 2000),
  consent_and_ethics_status text not null default 'pending_review'
    check (consent_and_ethics_status in ('approved','pending_review','not_approved')),
  analysis_plan text not null default '' check (char_length(analysis_plan) <= 10000),
  status text not null default 'planning'
    check (status in ('planning','protocol_review','data_ready','analysis','validated','paused')),
  individual_risk_prediction_enabled boolean not null default false
    check (individual_risk_prediction_enabled = false),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_genetic_risk_studies_owner_created
  on public.genetic_risk_studies(owner_id, created_at desc);

alter table public.clinical_assessments enable row level security;
alter table public.genetic_risk_studies enable row level security;

drop policy if exists "owners can read assessments for own cases" on public.clinical_assessments;
create policy "owners can read assessments for own cases" on public.clinical_assessments
  for select to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "owners can create assessments for own cases" on public.clinical_assessments;
create policy "owners can create assessments for own cases" on public.clinical_assessments
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and clinician_role_attested = true and exists (
      select 1 from public.clinical_cases c where c.id = case_id and c.owner_id = (select auth.uid())
    )
  );
drop policy if exists "owners can update assessments for own cases" on public.clinical_assessments;
create policy "owners can update assessments for own cases" on public.clinical_assessments
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and clinician_role_attested = true);
drop policy if exists "owners can delete assessments for own cases" on public.clinical_assessments;
create policy "owners can delete assessments for own cases" on public.clinical_assessments
  for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "owners can read own genetic risk studies" on public.genetic_risk_studies;
create policy "owners can read own genetic risk studies" on public.genetic_risk_studies
  for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists "owners can create own genetic risk studies" on public.genetic_risk_studies;
create policy "owners can create own genetic risk studies" on public.genetic_risk_studies
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and individual_risk_prediction_enabled = false
  );
drop policy if exists "owners can update own genetic risk studies" on public.genetic_risk_studies;
create policy "owners can update own genetic risk studies" on public.genetic_risk_studies
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and individual_risk_prediction_enabled = false);
drop policy if exists "owners can delete own genetic risk studies" on public.genetic_risk_studies;
create policy "owners can delete own genetic risk studies" on public.genetic_risk_studies
  for delete to authenticated using (owner_id = (select auth.uid()));

grant select, insert, update, delete on public.clinical_assessments to authenticated;
grant select, insert, update, delete on public.genetic_risk_studies to authenticated;
