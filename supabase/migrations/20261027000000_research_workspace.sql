-- JinoX AI research workspace: real, user-owned records with RLS.
create extension if not exists "pgcrypto";

create table if not exists public.research_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  research_area text not null default 'oral_health'
    check (research_area in ('oral_health','environmental_health','genomics','imaging','digital_twin','multimodal','other')),
  status text not null default 'active' check (status in ('active','archived')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_research_projects_owner_created on public.research_projects(owner_id, created_at desc);

create table if not exists public.research_datasets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  modality text not null check (modality in ('panoramic_xray','periapical_xray','bitewing_xray','cbct','intraoral_photo','clinical_text','genomic','environmental','other')),
  source_type text not null default 'research_collection' check (source_type in ('research_collection','public_dataset','synthetic','retrospective','other')),
  consent_basis text not null default 'pending_review' check (consent_basis in ('informed_consent','ethics_waiver','public_licensed','synthetic_data','pending_review')),
  license text check (license is null or char_length(license) <= 300),
  record_count integer check (record_count is null or record_count >= 0),
  status text not null default 'metadata_only' check (status in ('metadata_only','available','restricted','archived')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_research_datasets_project_created on public.research_datasets(project_id, created_at desc);

create table if not exists public.research_experiments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  dataset_id uuid references public.research_datasets(id) on delete set null,
  name text not null check (char_length(name) between 3 and 160),
  hypothesis text not null default '' check (char_length(hypothesis) <= 10000),
  method text not null default '' check (char_length(method) <= 10000),
  model_version text check (model_version is null or char_length(model_version) <= 160),
  status text not null default 'planned' check (status in ('planned','running','completed','failed','cancelled')),
  metrics jsonb not null default '{}'::jsonb check (jsonb_typeof(metrics) = 'object'),
  notes text not null default '' check (char_length(notes) <= 10000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_research_experiments_project_created on public.research_experiments(project_id, created_at desc);

create table if not exists public.research_consents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  participant_code text not null check (participant_code ~ '^[A-Za-z0-9_-]{3,80}$'),
  consent_status text not null default 'pending' check (consent_status in ('pending','granted','withdrawn','not_required')),
  consent_version text not null check (char_length(consent_version) between 1 and 80),
  language text not null default 'en' check (language in ('en','sw','other')),
  consented_at timestamptz,
  withdrawn_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_research_consents_project_created on public.research_consents(project_id, created_at desc);

create table if not exists public.research_audit_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  actor_id uuid not null references auth.users(id),
  action text not null check (char_length(action) between 1 and 120),
  resource_type text not null check (char_length(resource_type) between 1 and 120),
  resource_id uuid,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);
create index if not exists idx_research_audit_project_created on public.research_audit_logs(project_id, created_at desc);

drop trigger if exists set_research_projects_updated_at on public.research_projects;
create trigger set_research_projects_updated_at before update on public.research_projects for each row execute function public.handle_updated_at();
drop trigger if exists set_research_datasets_updated_at on public.research_datasets;
create trigger set_research_datasets_updated_at before update on public.research_datasets for each row execute function public.handle_updated_at();
drop trigger if exists set_research_experiments_updated_at on public.research_experiments;
create trigger set_research_experiments_updated_at before update on public.research_experiments for each row execute function public.handle_updated_at();
drop trigger if exists set_research_consents_updated_at on public.research_consents;
create trigger set_research_consents_updated_at before update on public.research_consents for each row execute function public.handle_updated_at();

alter table public.research_projects enable row level security;
alter table public.research_datasets enable row level security;
alter table public.research_experiments enable row level security;
alter table public.research_consents enable row level security;
alter table public.research_audit_logs enable row level security;

drop policy if exists "owners manage research projects" on public.research_projects;
create policy "owners manage research projects" on public.research_projects
  for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy if exists "owners manage research datasets" on public.research_datasets;
create policy "owners manage research datasets" on public.research_datasets
  for all to authenticated using (
    exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = (select auth.uid()))
    and created_by = (select auth.uid())
  );

drop policy if exists "owners manage research experiments" on public.research_experiments;
create policy "owners manage research experiments" on public.research_experiments
  for all to authenticated using (
    exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = (select auth.uid()))
    and created_by = (select auth.uid())
    and (dataset_id is null or exists (
      select 1 from public.research_datasets d where d.id = public.research_experiments.dataset_id and d.project_id = public.research_experiments.project_id
    ))
  );

drop policy if exists "owners manage research consents" on public.research_consents;
create policy "owners manage research consents" on public.research_consents
  for all to authenticated using (
    exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = (select auth.uid()))
    and created_by = (select auth.uid())
  );

drop policy if exists "owners read research audit logs" on public.research_audit_logs;
create policy "owners read research audit logs" on public.research_audit_logs
  for select to authenticated using (
    exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = (select auth.uid()))
  );
drop policy if exists "owners write research audit logs" on public.research_audit_logs;
create policy "owners write research audit logs" on public.research_audit_logs
  for insert to authenticated with check (
    actor_id = (select auth.uid())
    and exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = (select auth.uid()))
  );
