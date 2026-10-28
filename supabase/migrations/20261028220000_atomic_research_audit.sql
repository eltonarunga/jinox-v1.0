-- Atomic project/dataset creation and audit event writes.
-- SECURITY INVOKER is intentional: existing grants and RLS policies remain authoritative.
-- Do not apply to production until verified against a staging project and role-specific test users.

create or replace function public.create_research_project_with_audit(
  p_name text,
  p_description text,
  p_research_area text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_project public.research_projects%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.research_projects (name, description, research_area, owner_id)
  values (p_name, coalesce(p_description, ''), coalesce(p_research_area, 'oral_health'), v_actor)
  returning * into v_project;

  insert into public.research_audit_logs (
    project_id, actor_id, action, resource_type, resource_id, details
  ) values (
    v_project.id, v_actor, 'project.created', 'research_project', v_project.id,
    jsonb_build_object('research_area', v_project.research_area)
  );

  return to_jsonb(v_project);
end;
$$;

revoke all on function public.create_research_project_with_audit(text, text, text) from public, anon;
grant execute on function public.create_research_project_with_audit(text, text, text) to authenticated;

create or replace function public.register_research_dataset_with_audit(
  p_project_id uuid,
  p_name text,
  p_description text,
  p_modality text,
  p_source_type text,
  p_consent_basis text,
  p_license text,
  p_record_count integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_dataset public.research_datasets%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.research_datasets (
    project_id, name, description, modality, source_type,
    consent_basis, license, record_count, created_by, status
  ) values (
    p_project_id, p_name, coalesce(p_description, ''), p_modality,
    coalesce(p_source_type, 'research_collection'),
    coalesce(p_consent_basis, 'pending_review'), p_license, p_record_count,
    v_actor, 'metadata_only'
  )
  returning * into v_dataset;

  insert into public.research_audit_logs (
    project_id, actor_id, action, resource_type, resource_id, details
  ) values (
    v_dataset.project_id, v_actor, 'dataset.registered', 'research_dataset', v_dataset.id,
    jsonb_build_object(
      'modality', v_dataset.modality,
      'source_type', v_dataset.source_type,
      'consent_basis', v_dataset.consent_basis
    )
  );

  return to_jsonb(v_dataset);
end;
$$;

revoke all on function public.register_research_dataset_with_audit(uuid, text, text, text, text, text, text, integer) from public, anon;
grant execute on function public.register_research_dataset_with_audit(uuid, text, text, text, text, text, text, integer) to authenticated;


create or replace function public.create_research_experiment_with_audit(
  p_project_id uuid,
  p_dataset_id uuid,
  p_name text,
  p_hypothesis text,
  p_method text,
  p_model_version text,
  p_status text,
  p_metrics jsonb,
  p_notes text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_experiment public.research_experiments%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.research_experiments (
    project_id, dataset_id, name, hypothesis, method, model_version,
    status, metrics, notes, created_by
  ) values (
    p_project_id, p_dataset_id, p_name, coalesce(p_hypothesis, ''),
    coalesce(p_method, ''), p_model_version, coalesce(p_status, 'planned'),
    coalesce(p_metrics, '{}'::jsonb), coalesce(p_notes, ''), v_actor
  )
  returning * into v_experiment;

  insert into public.research_audit_logs (
    project_id, actor_id, action, resource_type, resource_id, details
  ) values (
    v_experiment.project_id, v_actor, 'experiment.created', 'research_experiment',
    v_experiment.id, jsonb_build_object('status', v_experiment.status)
  );

  return to_jsonb(v_experiment);
end;
$$;

revoke all on function public.create_research_experiment_with_audit(uuid, uuid, text, text, text, text, text, jsonb, text) from public, anon;
grant execute on function public.create_research_experiment_with_audit(uuid, uuid, text, text, text, text, text, jsonb, text) to authenticated;

create or replace function public.record_research_consent_with_audit(
  p_project_id uuid,
  p_participant_code text,
  p_consent_status text,
  p_consent_version text,
  p_language text,
  p_consented_at timestamptz,
  p_withdrawn_at timestamptz
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_consent public.research_consents%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.research_consents (
    project_id, participant_code, consent_status, consent_version, language,
    consented_at, withdrawn_at, created_by
  ) values (
    p_project_id, p_participant_code, coalesce(p_consent_status, 'pending'),
    p_consent_version, coalesce(p_language, 'en'), p_consented_at,
    p_withdrawn_at, v_actor
  )
  returning * into v_consent;

  insert into public.research_audit_logs (
    project_id, actor_id, action, resource_type, resource_id, details
  ) values (
    v_consent.project_id, v_actor, 'consent.recorded', 'research_consent',
    v_consent.id, jsonb_build_object('consent_status', v_consent.consent_status, 'language', v_consent.language)
  );

  return to_jsonb(v_consent);
end;
$$;

revoke all on function public.record_research_consent_with_audit(uuid, text, text, text, text, timestamptz, timestamptz) from public, anon;
grant execute on function public.record_research_consent_with_audit(uuid, text, text, text, text, timestamptz, timestamptz) to authenticated;
