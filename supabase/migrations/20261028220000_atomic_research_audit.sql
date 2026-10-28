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
