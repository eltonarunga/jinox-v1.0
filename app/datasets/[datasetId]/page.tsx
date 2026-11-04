"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Dataset = {
  id: string;
  project_id: string;
  name: string;
  description: string;
  modality: string;
  source_type: string;
  consent_basis: string;
  license: string | null;
  record_count: number | null;
  status: string;
  created_at: string;
};
type Item = { id: string; status: string; assigned_to: string | null; created_at: string };
type Annotation = { id: string; dataset_item_id: string; status: string; revision: number; updated_at: string };

const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (part) => part.toUpperCase());
const date = (value: string) => new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export default function DatasetDetailPage() {
  const params = useParams<{ datasetId: string }>();
  const datasetId = params.datasetId;
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setError("Authentication is not configured."); setLoading(false); return; }
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !authData.user) { setError("Sign in to access this dataset."); setLoading(false); return; }

      const { data: datasetData, error: datasetError } = await supabase.from("research_datasets")
        .select("id,project_id,name,description,modality,source_type,consent_basis,license,record_count,status,created_at")
        .eq("id", datasetId).maybeSingle();
      if (!active) return;
      if (datasetError || !datasetData) { setError("This dataset is unavailable or you do not have access."); setLoading(false); return; }
      setDataset(datasetData as Dataset);

      const { data: itemData, error: itemError } = await supabase.from("dataset_items")
        .select("id,status,assigned_to,created_at").eq("dataset_id", datasetId).order("created_at", { ascending: false });
      if (!active) return;
      if (itemError) { setError("Dataset work items could not be loaded."); setLoading(false); return; }
      const nextItems = (itemData ?? []) as Item[];
      setItems(nextItems);

      if (nextItems.length) {
        const { data: annotationData, error: annotationError } = await supabase.from("dataset_annotations")
          .select("id,dataset_item_id,status,revision,updated_at")
          .in("dataset_item_id", nextItems.map((item) => item.id)).order("updated_at", { ascending: false });
        if (!active) return;
        if (annotationError) { setError("Annotation summary could not be loaded."); setLoading(false); return; }
        setAnnotations((annotationData ?? []) as Annotation[]);
      } else {
        setAnnotations([]);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [supabase, datasetId]);

  const statusCounts = useMemo(() => items.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {}), [items]);
  const latestAnnotations = useMemo(() => {
    const latest = new Map<string, Annotation>();
    for (const annotation of annotations) {
      const current = latest.get(annotation.dataset_item_id);
      if (!current || annotation.revision > current.revision) latest.set(annotation.dataset_item_id, annotation);
    }
    return [...latest.values()];
  }, [annotations]);
  const annotationCounts = useMemo(() => latestAnnotations.reduce<Record<string, number>>((counts, annotation) => {
    counts[annotation.status] = (counts[annotation.status] ?? 0) + 1;
    return counts;
  }, {}), [latestAnnotations]);

  if (loading) return <main className="min-h-screen p-8 text-sm text-neutral-500">Loading dataset workspace…</main>;
  if (error || !dataset) return <main className="min-h-screen px-4 py-8 sm:px-8"><div className="mx-auto max-w-4xl rounded-xl border border-neutral-200 bg-white p-6"><p role="alert" className="text-sm text-neutral-700">{error || "Dataset not found."}</p><Link href="/datasets" className="mt-4 inline-flex text-sm font-semibold underline underline-offset-4">Back to datasets</Link></div></main>;

  return (
    <main className="min-h-screen px-4 py-8 text-neutral-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="text-xs text-neutral-500"><Link href="/datasets" className="hover:text-neutral-900">Datasets</Link><span className="mx-2">/</span><span aria-current="page">Dataset workspace</span></nav>
        <header className="mt-6 border-b border-neutral-200 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">Dataset workspace</p><h1 className="mt-2 break-words text-3xl font-semibold tracking-tight">{dataset.name}</h1><p className="mt-2 text-sm text-neutral-600">{pretty(dataset.modality)} <span className="mx-2 text-neutral-300">·</span> {pretty(dataset.source_type)}</p></div><span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">{pretty(dataset.status)}</span></div>
          {dataset.description && <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-neutral-600">{dataset.description}</p>}
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Estimated records</p><p className="mt-2 text-3xl font-semibold tabular-nums">{dataset.record_count == null ? "—" : dataset.record_count.toLocaleString()}</p><p className="mt-1 text-xs text-neutral-500">Declared metadata, not a verified item count</p></div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Registered work items</p><p className="mt-2 text-3xl font-semibold tabular-nums">{items.length}</p><p className="mt-1 text-xs text-neutral-500">Current dataset item records</p></div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Annotations</p><p className="mt-2 text-3xl font-semibold tabular-nums">{annotations.length}</p><p className="mt-1 text-xs text-neutral-500">Annotation revisions visible to your role</p></div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Latest annotation states</p><p className="mt-2 text-xl font-semibold tabular-nums">{latestAnnotations.length}</p><p className="mt-1 text-xs text-neutral-500">One latest revision per work item</p></div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.8fr)]">
          <section className="min-w-0"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">Work item queue</h2><p className="mt-1 text-sm text-neutral-600">Current item states from the authorized dataset workspace.</p></div><Link href="/annotate" className="inline-flex min-h-10 items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700">Open annotation operations</Link></div>
            <div className="mt-4 flex flex-wrap gap-2">{Object.entries(statusCounts).sort(([a], [b]) => a.localeCompare(b)).map(([status, count]) => <span key={status} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700">{pretty(status)} <strong className="ml-1 tabular-nums">{count}</strong></span>)}</div>
            {items.length === 0 ? <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-white p-8"><h3 className="font-semibold">No work items registered</h3><p className="mt-2 text-sm text-neutral-600">Work items are created when approved source assets are added to an annotation dataset.</p></div> : <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500"><tr><th className="px-4 py-3 font-semibold">Work item</th><th className="px-4 py-3 font-semibold">Assignment</th><th className="px-4 py-3 font-semibold">Task state</th><th className="px-4 py-3 font-semibold">Created</th></tr></thead><tbody className="divide-y divide-neutral-100">{items.map((item, index) => <tr key={item.id}><td className="px-4 py-3 font-medium">Item {String(index + 1).padStart(2, "0")}</td><td className="px-4 py-3 text-neutral-600">{item.assigned_to ? "Assigned" : "Unassigned"}</td><td className="px-4 py-3 text-neutral-700">{pretty(item.status)}</td><td className="px-4 py-3 text-neutral-500">{date(item.created_at)}</td></tr>)}</tbody></table></div>}
          </section>

          <aside className="space-y-4">
            <section className="rounded-xl border border-neutral-200 bg-white p-5"><h2 className="text-sm font-semibold">Dataset provenance</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-xs text-neutral-500">Source type</dt><dd className="mt-1 font-medium">{pretty(dataset.source_type)}</dd></div><div><dt className="text-xs text-neutral-500">Consent / rights basis</dt><dd className="mt-1 font-medium">{pretty(dataset.consent_basis)}</dd></div><div><dt className="text-xs text-neutral-500">License reference</dt><dd className="mt-1 font-medium">{dataset.license || "Not recorded"}</dd></div><div><dt className="text-xs text-neutral-500">Registered</dt><dd className="mt-1 font-medium">{date(dataset.created_at)}</dd></div></dl></section>
            <section className="rounded-xl border border-neutral-200 bg-white p-5"><h2 className="text-sm font-semibold">Annotation revisions</h2><p className="mt-1 text-xs text-neutral-500">Latest visible revision per item</p>{Object.entries(annotationCounts).length ? <ul className="mt-3 space-y-2">{Object.entries(annotationCounts).sort(([a], [b]) => a.localeCompare(b)).map(([status, count]) => <li key={status} className="flex items-center justify-between text-sm"><span className="text-neutral-600">{pretty(status)}</span><span className="font-semibold tabular-nums">{count}</span></li>)}</ul> : <p className="mt-3 text-sm text-neutral-500">No annotation revisions are visible yet.</p>}</section>
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="text-sm font-semibold text-amber-950">Release status</h2><p className="mt-2 text-sm leading-6 text-amber-900">Versioned dataset releases and controlled delivery are not implemented in this workspace. This view reports live metadata and work-item records only.</p></section>
          </aside>
        </div>
      </div>
    </main>
  );
}
