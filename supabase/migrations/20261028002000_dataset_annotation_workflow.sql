-- JinoX AI dataset-first annotation workflow.
-- Dataset membership is explicit; annotations preserve author, schema version and review state.

create table if not exists public.dataset_items (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.research_datasets(id) on delete cascade,
  clinical_asset_id uuid not null references public.clinical_assets(id) on delete cascade,
  added_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued','in_progress','submitted','accepted','rejected','excluded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dataset_id, clinical_asset_id)
);

create index if not exists idx_dataset_items_dataset_status
  on public.dataset_items(dataset_id, status, created_at);

create table if not exists public.dataset_annotations (
  id uuid primary key default gen_random_uuid(),
  dataset_item_id uuid not null references public.dataset_items(id) on delete cascade,
  annotator_id uuid not null references auth.users(id) on delete cascade,
  schema_version text not null default 'oral-health-v1'
    check (char_length(schema_version) between 1 and 80),
  labels jsonb not null default '{}'::jsonb
    check (jsonb_typeof(labels) = 'object'),
  notes text not null default '' check (char_length(notes) <= 5000),
  status text not null default 'draft'
    check (status in ('draft','submitted','superseded')),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dataset_item_id, annotator_id, revision)
);

create index if not exists idx_dataset_annotations_item_status
  on public.dataset_annotations(dataset_item_id, status, updated_at desc);

create table if not exists public.annotation_reviews (
  id uuid primary key default gen_random_uuid(),
  annotation_id uuid not null references public.dataset_annotations(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (decision in ('accepted','changes_requested','rejected')),
  review_notes text not null default '' check (char_length(review_notes) <= 5000),
  created_at timestamptz not null default now()
);

alter table public.dataset_items enable row level security;
alter table public.dataset_annotations enable row level security;
alter table public.annotation_reviews enable row level security;

drop policy if exists "dataset owners can read dataset items" on public.dataset_items;
create policy "dataset owners can read dataset items" on public.dataset_items for select to authenticated
using (exists (select 1 from public.research_datasets d join public.research_projects p on p.id=d.project_id
  where d.id=dataset_id and p.owner_id=(select auth.uid())));
drop policy if exists "dataset owners can add own assets" on public.dataset_items;
create policy "dataset owners can add own assets" on public.dataset_items for insert to authenticated
with check (
  added_by=(select auth.uid())
  and exists (select 1 from public.research_datasets d join public.research_projects p on p.id=d.project_id
    where d.id=dataset_id and p.owner_id=(select auth.uid()))
  and exists (select 1 from public.clinical_assets a where a.id=clinical_asset_id and a.owner_id=(select auth.uid()))
);
drop policy if exists "dataset owners can update dataset items" on public.dataset_items;
create policy "dataset owners can update dataset items" on public.dataset_items for update to authenticated
using (exists (select 1 from public.research_datasets d join public.research_projects p on p.id=d.project_id
  where d.id=dataset_id and p.owner_id=(select auth.uid())))
with check (exists (select 1 from public.research_datasets d join public.research_projects p on p.id=d.project_id
  where d.id=dataset_id and p.owner_id=(select auth.uid())));

drop policy if exists "annotators can read dataset annotations" on public.dataset_annotations;
create policy "annotators can read dataset annotations" on public.dataset_annotations for select to authenticated
using (exists (select 1 from public.dataset_items i join public.research_datasets d on d.id=i.dataset_id
  join public.research_projects p on p.id=d.project_id where i.id=dataset_item_id and p.owner_id=(select auth.uid())));
drop policy if exists "annotators can create dataset annotations" on public.dataset_annotations;
create policy "annotators can create dataset annotations" on public.dataset_annotations for insert to authenticated
with check (annotator_id=(select auth.uid()) and exists (
  select 1 from public.dataset_items i join public.research_datasets d on d.id=i.dataset_id
  join public.research_projects p on p.id=d.project_id where i.id=dataset_item_id and p.owner_id=(select auth.uid())));
drop policy if exists "annotators can update own dataset annotations" on public.dataset_annotations;
create policy "annotators can update own dataset annotations" on public.dataset_annotations for update to authenticated
using (annotator_id=(select auth.uid()) and exists (
  select 1 from public.dataset_items i join public.research_datasets d on d.id=i.dataset_id
  join public.research_projects p on p.id=d.project_id where i.id=dataset_item_id and p.owner_id=(select auth.uid())))
with check (annotator_id=(select auth.uid()) and exists (
  select 1 from public.dataset_items i join public.research_datasets d on d.id=i.dataset_id
  join public.research_projects p on p.id=d.project_id where i.id=dataset_item_id and p.owner_id=(select auth.uid())));

drop policy if exists "project owners can read annotation reviews" on public.annotation_reviews;
create policy "project owners can read annotation reviews" on public.annotation_reviews for select to authenticated
using (exists (select 1 from public.dataset_annotations a join public.dataset_items i on i.id=a.dataset_item_id
  join public.research_datasets d on d.id=i.dataset_id join public.research_projects p on p.id=d.project_id
  where a.id=annotation_id and p.owner_id=(select auth.uid())));
drop policy if exists "project owners can add annotation reviews" on public.annotation_reviews;
create policy "project owners can add annotation reviews" on public.annotation_reviews for insert to authenticated
with check (reviewer_id=(select auth.uid()) and exists (
  select 1 from public.dataset_annotations a join public.dataset_items i on i.id=a.dataset_item_id
  join public.research_datasets d on d.id=i.dataset_id join public.research_projects p on p.id=d.project_id
  where a.id=annotation_id and p.owner_id=(select auth.uid())));

grant select, insert, update on public.dataset_items to authenticated;
grant select, insert, update on public.dataset_annotations to authenticated;
grant select, insert on public.annotation_reviews to authenticated;
