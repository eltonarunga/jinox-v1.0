-- JinoX AI secure research MVP (additive migration)
-- Apply in a non-production Supabase project first and review with your data-protection lead.
create extension if not exists pgcrypto;

create table if not exists public.research_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 3 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  research_area text not null default 'oral_health' check (research_area in ('oral_health','environmental_health','genomics','imaging','digital_twin','multimodal','other')),
  status text not null default 'draft' check (status in ('draft','active','paused','archived')),
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_project_members (
  project_id uuid not null references public.research_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','principal_investigator','researcher','reviewer','viewer')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.research_datasets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  modality text not null check (modality in ('panoramic_xray','periapical_xray','bitewing_xray','cbct','intraoral_photo','clinical_text','genomic','environmental','other')),
  source_type text not null default 'research_collection' check (source_type in ('research_collection','public_dataset','synthetic','retrospective','other')),
  consent_basis text not null check (consent_basis in ('informed_consent','ethics_waiver','public_licensed','synthetic_data','pending_review')),
  license text,
  record_count integer check (record_count is null or record_count >= 0),
  storage_uri text,
  data_dictionary_uri text,
  status text not null default 'metadata_only' check (status in ('metadata_only','under_review','approved','restricted','archived')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint storage_uri_must_not_be_public_url check (storage_uri is null or storage_uri !~* '^https?://')
);

create table if not exists public.research_experiments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  dataset_id uuid references public.research_datasets(id) on delete set null,
  name text not null check (char_length(trim(name)) between 3 and 160),
  hypothesis text not null default '' check (char_length(hypothesis) <= 10000),
  method text not null default '' check (char_length(method) <= 10000),
  model_version text,
  status text not null default 'planned' check (status in ('planned','running','completed','failed','cancelled')),
  metrics jsonb not null default '{}'::jsonb check (jsonb_typeof(metrics) = 'object'),
  notes text not null default '' check (char_length(notes) <= 10000),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_consents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  participant_code text not null check (participant_code ~ '^[A-Za-z0-9_-]{3,80}$'),
  consent_status text not null default 'pending' check (consent_status in ('pending','granted','withdrawn','not_required')),
  consent_version text not null,
  language text not null default 'en' check (language in ('en','sw','other')),
  consented_at timestamptz,
  withdrawn_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, participant_code),
  check (consent_status <> 'granted' or consented_at is not null)
);

create table if not exists public.research_audit_logs (
  id bigint generated always as identity primary key,
  project_id uuid references public.research_projects(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(action) between 2 and 120),
  resource_type text not null check (char_length(resource_type) between 2 and 80),
  resource_id text,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists research_projects_owner_idx on public.research_projects(owner_id, created_at desc);
create index if not exists research_members_user_idx on public.research_project_members(user_id, project_id);
create index if not exists research_datasets_project_idx on public.research_datasets(project_id, created_at desc);
create index if not exists research_experiments_project_idx on public.research_experiments(project_id, created_at desc);
create index if not exists research_consents_project_idx on public.research_consents(project_id, consent_status);
create index if not exists research_audit_project_idx on public.research_audit_logs(project_id, created_at desc);

-- SECURITY DEFINER helpers avoid recursive RLS evaluation on membership checks.
create or replace function public.research_is_member(p_project_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.research_project_members m where m.project_id = p_project_id and m.user_id = (select auth.uid()));
$$;

create or replace function public.research_can_manage(p_project_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.research_project_members m where m.project_id = p_project_id and m.user_id = (select auth.uid()) and m.role in ('owner','principal_investigator'));
$$;

revoke all on function public.research_is_member(uuid) from public;
revoke all on function public.research_can_manage(uuid) from public;
grant execute on function public.research_is_member(uuid) to authenticated;
grant execute on function public.research_can_manage(uuid) to authenticated;

-- Automatically grant the creator owner membership; without this, RLS would
-- hide a newly created project from its own creator.
create or replace function public.research_add_project_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.research_project_members (project_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (project_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists research_projects_add_owner on public.research_projects;
create trigger research_projects_add_owner
after insert on public.research_projects
for each row execute function public.research_add_project_owner();

create or replace function public.research_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;

do $$ declare t text; begin
  foreach t in array array['research_projects','research_datasets','research_experiments','research_consents'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_touch_updated_at', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.research_touch_updated_at()', t || '_touch_updated_at', t);
  end loop;
end $$;

alter table public.research_projects enable row level security;
alter table public.research_project_members enable row level security;
alter table public.research_datasets enable row level security;
alter table public.research_experiments enable row level security;
alter table public.research_consents enable row level security;
alter table public.research_audit_logs enable row level security;

drop policy if exists research_projects_read_member on public.research_projects;
create policy research_projects_read_member on public.research_projects for select to authenticated using (public.research_is_member(id));
drop policy if exists research_projects_create_owner on public.research_projects;
create policy research_projects_create_owner on public.research_projects for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists research_projects_update_manager on public.research_projects;
create policy research_projects_update_manager on public.research_projects for update to authenticated using (public.research_can_manage(id)) with check (public.research_can_manage(id));

drop policy if exists research_members_read_project on public.research_project_members;
create policy research_members_read_project on public.research_project_members for select to authenticated using (public.research_is_member(project_id));
drop policy if exists research_members_manage_project on public.research_project_members;
create policy research_members_manage_project on public.research_project_members for all to authenticated using (public.research_can_manage(project_id)) with check (public.research_can_manage(project_id));

drop policy if exists research_datasets_read_member on public.research_datasets;
create policy research_datasets_read_member on public.research_datasets for select to authenticated using (public.research_is_member(project_id));
drop policy if exists research_datasets_create_manager on public.research_datasets;
create policy research_datasets_create_manager on public.research_datasets for insert to authenticated with check (created_by = (select auth.uid()) and public.research_can_manage(project_id));
drop policy if exists research_datasets_update_manager on public.research_datasets;
create policy research_datasets_update_manager on public.research_datasets for update to authenticated using (public.research_can_manage(project_id)) with check (public.research_can_manage(project_id));

drop policy if exists research_experiments_read_member on public.research_experiments;
create policy research_experiments_read_member on public.research_experiments for select to authenticated using (public.research_is_member(project_id));
drop policy if exists research_experiments_create_manager on public.research_experiments;
create policy research_experiments_create_manager on public.research_experiments for insert to authenticated with check (created_by = (select auth.uid()) and public.research_can_manage(project_id));
drop policy if exists research_experiments_update_manager on public.research_experiments;
create policy research_experiments_update_manager on public.research_experiments for update to authenticated using (public.research_can_manage(project_id)) with check (public.research_can_manage(project_id));

drop policy if exists research_consents_read_manager on public.research_consents;
create policy research_consents_read_manager on public.research_consents for select to authenticated using (public.research_can_manage(project_id));
drop policy if exists research_consents_create_manager on public.research_consents;
create policy research_consents_create_manager on public.research_consents for insert to authenticated with check (created_by = (select auth.uid()) and public.research_can_manage(project_id));
drop policy if exists research_consents_update_manager on public.research_consents;
create policy research_consents_update_manager on public.research_consents for update to authenticated using (public.research_can_manage(project_id)) with check (public.research_can_manage(project_id));

drop policy if exists research_audit_read_manager on public.research_audit_logs;
create policy research_audit_read_manager on public.research_audit_logs for select to authenticated using (project_id is not null and public.research_can_manage(project_id));
drop policy if exists research_audit_insert_actor on public.research_audit_logs;
create policy research_audit_insert_actor on public.research_audit_logs for insert to authenticated with check (actor_id = (select auth.uid()) and (project_id is null or public.research_is_member(project_id)));
-- No update/delete policies are created for audit logs: append-only from authenticated clients.
