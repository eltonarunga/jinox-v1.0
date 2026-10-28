-- Collaborative dataset annotation access.
-- Adds explicit project membership and item assignment without changing clinical records.
-- Apply in a staging Supabase project first; validate RLS with separate test users before production.

create table if not exists public.research_project_members (
  project_id uuid not null references public.research_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','principal_investigator','researcher','reviewer','viewer')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index if not exists idx_research_project_members_user_project
  on public.research_project_members(user_id, project_id);

-- Only return authorization facts about the current caller; do not expose arbitrary-user membership lookups.
create or replace function public.research_current_user_has_project_role(
  p_project_id uuid,
  p_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.research_project_members m
    where m.project_id = p_project_id
      and m.user_id = (select auth.uid())
      and m.role = any(p_roles)
  );
$$;

create or replace function public.research_is_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.research_current_user_has_project_role(
    p_project_id,
    array['owner','principal_investigator','researcher','reviewer','viewer']::text[]
  );
$$;

create or replace function public.research_can_manage_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.research_current_user_has_project_role(
    p_project_id,
    array['owner','principal_investigator']::text[]
  );
$$;

revoke all on function public.research_current_user_has_project_role(uuid, text[]) from public, anon;
revoke all on function public.research_is_project_member(uuid) from public, anon;
revoke all on function public.research_can_manage_project(uuid) from public, anon;
grant execute on function public.research_current_user_has_project_role(uuid, text[]) to authenticated;
grant execute on function public.research_is_project_member(uuid) to authenticated;
grant execute on function public.research_can_manage_project(uuid) to authenticated;

-- Backfill owners and ensure future project creators receive owner membership.
insert into public.research_project_members(project_id, user_id, role)
select p.id, p.owner_id, 'owner'
from public.research_projects p
on conflict (project_id, user_id) do nothing;

create or replace function public.research_add_project_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.research_project_members(project_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (project_id, user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.research_add_project_owner_membership() from public, anon, authenticated;
drop trigger if exists research_projects_add_owner_membership on public.research_projects;
create trigger research_projects_add_owner_membership
after insert on public.research_projects
for each row execute function public.research_add_project_owner_membership();

alter table public.research_project_members enable row level security;

drop policy if exists "project members can read memberships" on public.research_project_members;
create policy "project members can read memberships"
on public.research_project_members for select to authenticated
using (
  user_id = (select auth.uid())
  or public.research_can_manage_project(project_id)
);

drop policy if exists "project owners can add memberships" on public.research_project_members;
create policy "project owners can add memberships"
on public.research_project_members for insert to authenticated
with check (public.research_current_user_has_project_role(project_id, array['owner']::text[]));

drop policy if exists "project owners can change membership roles" on public.research_project_members;
create policy "project owners can change membership roles"
on public.research_project_members for update to authenticated
using (public.research_current_user_has_project_role(project_id, array['owner']::text[]))
with check (public.research_current_user_has_project_role(project_id, array['owner']::text[]));

drop policy if exists "project owners can remove memberships" on public.research_project_members;
create policy "project owners can remove memberships"
on public.research_project_members for delete to authenticated
using (public.research_current_user_has_project_role(project_id, array['owner']::text[]));

grant select, insert, delete on public.research_project_members to authenticated;
revoke update on public.research_project_members from authenticated;
grant update (role) on public.research_project_members to authenticated;

-- Project members may see project/dataset metadata, while management remains role-gated.
drop policy if exists "project members can read projects" on public.research_projects;
create policy "project members can read projects"
on public.research_projects for select to authenticated
using (public.research_is_project_member(id));

drop policy if exists "project members can read datasets" on public.research_datasets;
create policy "project members can read datasets"
on public.research_datasets for select to authenticated
using (public.research_is_project_member(project_id));

drop policy if exists "project managers can create datasets" on public.research_datasets;
create policy "project managers can create datasets"
on public.research_datasets for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.research_can_manage_project(project_id)
);

drop policy if exists "project managers can update datasets" on public.research_datasets;
create policy "project managers can update datasets"
on public.research_datasets for update to authenticated
using (public.research_can_manage_project(project_id))
with check (public.research_can_manage_project(project_id));

-- Assign each item to at most one researcher. No patient data is copied by this migration.
alter table public.dataset_items
  add column if not exists assigned_to uuid references auth.users(id) on delete set null,
  add column if not exists assigned_at timestamptz;

create index if not exists idx_dataset_items_assignee_status
  on public.dataset_items(assigned_to, status, created_at)
  where assigned_to is not null;

drop policy if exists "dataset owners can read dataset items" on public.dataset_items;
drop policy if exists "dataset owners can add own assets" on public.dataset_items;
drop policy if exists "dataset owners can update dataset items" on public.dataset_items;

create policy "members can read assigned items and reviewers can inspect"
on public.dataset_items for select to authenticated
using (
  exists (
    select 1 from public.research_datasets d
    where d.id = dataset_items.dataset_id
      and (
        public.research_can_manage_project(d.project_id)
        or public.research_current_user_has_project_role(d.project_id, array['reviewer']::text[])
        or (
          dataset_items.assigned_to = (select auth.uid())
          and public.research_current_user_has_project_role(d.project_id, array['researcher']::text[])
        )
      )
  )
);

create policy "project managers can add owned clinical assets to datasets"
on public.dataset_items for insert to authenticated
with check (
  added_by = (select auth.uid())
  and exists (
    select 1 from public.research_datasets d
    where d.id = dataset_items.dataset_id
      and public.research_can_manage_project(d.project_id)
  )
  and exists (
    select 1 from public.clinical_assets a
    where a.id = dataset_items.clinical_asset_id
      and a.owner_id = (select auth.uid())
  )
  and (
    assigned_to is null
    or exists (
      select 1 from public.research_datasets d
      join public.research_project_members m on m.project_id = d.project_id
      where d.id = dataset_items.dataset_id
        and m.user_id = dataset_items.assigned_to
        and m.role = 'researcher'
    )
  )
);

create policy "managers assign items and researchers update own status"
on public.dataset_items for update to authenticated
using (
  exists (
    select 1 from public.research_datasets d
    where d.id = dataset_items.dataset_id
      and (
        public.research_can_manage_project(d.project_id)
        or (
          dataset_items.assigned_to = (select auth.uid())
          and public.research_current_user_has_project_role(d.project_id, array['researcher']::text[])
        )
      )
  )
)
with check (
  exists (
    select 1 from public.research_datasets d
    where d.id = dataset_items.dataset_id
      and (
        public.research_can_manage_project(d.project_id)
        or (
          dataset_items.assigned_to = (select auth.uid())
          and public.research_current_user_has_project_role(d.project_id, array['researcher']::text[])
          and status in ('queued','in_progress','submitted')
        )
      )
  )
  and (
    assigned_to is null
    or exists (
      select 1 from public.research_datasets d
      join public.research_project_members m on m.project_id = d.project_id
      where d.id = dataset_items.dataset_id
        and m.user_id = dataset_items.assigned_to
        and m.role = 'researcher'
    )
  )
);

-- Restrict column-level writes so authenticated users cannot move an item to another dataset
-- or swap the underlying clinical asset after insertion.
revoke update on public.dataset_items from authenticated;
grant update (assigned_to, assigned_at, status) on public.dataset_items to authenticated;

drop policy if exists "annotators can read dataset annotations" on public.dataset_annotations;
drop policy if exists "annotators can create dataset annotations" on public.dataset_annotations;
drop policy if exists "annotators can update own dataset annotations" on public.dataset_annotations;

create policy "annotators and reviewers can read annotations"
on public.dataset_annotations for select to authenticated
using (
  (
    annotator_id = (select auth.uid())
    and exists (
      select 1 from public.dataset_items i
      join public.research_datasets d on d.id = i.dataset_id
      where i.id = dataset_annotations.dataset_item_id
        and public.research_is_project_member(d.project_id)
    )
  )
  or exists (
    select 1 from public.dataset_items i
    join public.research_datasets d on d.id = i.dataset_id
    where i.id = dataset_annotations.dataset_item_id
      and (
        public.research_can_manage_project(d.project_id)
        or public.research_current_user_has_project_role(d.project_id, array['reviewer']::text[])
      )
  )
);

create policy "assigned researchers can create annotations"
on public.dataset_annotations for insert to authenticated
with check (
  annotator_id = (select auth.uid())
  and exists (
    select 1 from public.dataset_items i
    join public.research_datasets d on d.id = i.dataset_id
    where i.id = dataset_annotations.dataset_item_id
      and i.assigned_to = (select auth.uid())
      and i.status in ('queued','in_progress','submitted')
      and public.research_current_user_has_project_role(d.project_id, array['researcher']::text[])
  )
);

create policy "researchers can edit own drafts"
on public.dataset_annotations for update to authenticated
using (
  annotator_id = (select auth.uid())
  and status = 'draft'
  and exists (
    select 1 from public.dataset_items i
    where i.id = dataset_annotations.dataset_item_id
      and i.assigned_to = (select auth.uid())
  )
)
with check (
  annotator_id = (select auth.uid())
  and status in ('draft','submitted')
  and exists (
    select 1 from public.dataset_items i
    where i.id = dataset_annotations.dataset_item_id
      and i.assigned_to = (select auth.uid())
  )
);

drop policy if exists "project owners can read annotation reviews" on public.annotation_reviews;
drop policy if exists "project owners can add annotation reviews" on public.annotation_reviews;

create policy "reviewers and managers can read annotation reviews"
on public.annotation_reviews for select to authenticated
using (
  exists (
    select 1 from public.dataset_annotations a
    join public.dataset_items i on i.id = a.dataset_item_id
    join public.research_datasets d on d.id = i.dataset_id
    where a.id = annotation_reviews.annotation_id
      and (
        public.research_can_manage_project(d.project_id)
        or public.research_current_user_has_project_role(d.project_id, array['reviewer']::text[])
      )
  )
);

create policy "reviewers can review submitted work"
on public.annotation_reviews for insert to authenticated
with check (
  reviewer_id = (select auth.uid())
  and exists (
    select 1 from public.dataset_annotations a
    join public.dataset_items i on i.id = a.dataset_item_id
    join public.research_datasets d on d.id = i.dataset_id
    where a.id = annotation_reviews.annotation_id
      and a.status = 'submitted'
      and a.annotator_id <> (select auth.uid())
      and (
        public.research_can_manage_project(d.project_id)
        or public.research_current_user_has_project_role(d.project_id, array['reviewer']::text[])
      )
  )
);

grant select, insert on public.dataset_items to authenticated;
revoke update on public.dataset_annotations from authenticated;
grant update (labels, notes, status) on public.dataset_annotations to authenticated;
grant select, insert on public.annotation_reviews to authenticated;
