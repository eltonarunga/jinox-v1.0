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
type Item = { id: string; clinical_asset_id: string; status: string; assigned_to: string | null; created_at: string };
type Annotation = { id: string; dataset_item_id: string; status: string; revision: number; updated_at: string };
type CurationEvent = { id: string; dataset_item_id: string; decision: "include" | "exclude" | "remediation_required"; rationale: string; curator_id: string; created_at: string };
type Release = { id: string; release_number: number; record_count: number; manifest_sha256: string; created_at: string };
type ProjectRole = "owner" | "principal_investigator" | "researcher" | "reviewer" | "viewer";

const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (part) => part.toUpperCase());
const date = (value: string) => new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export default function DatasetDetailPage() {
  const params = useParams<{ datasetId: string }>();
  const datasetId = params.datasetId;
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [curationEvents, setCurationEvents] = useState<CurationEvent[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [projectRole, setProjectRole] = useState<ProjectRole | null>(null);
  const [selectedCurationItemId, setSelectedCurationItemId] = useState("");
  const [curationDecision, setCurationDecision] = useState<"include" | "exclude" | "remediation_required">("include");
  const [curationRationale, setCurationRationale] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
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
        .select("id,clinical_asset_id,status,assigned_to,created_at").eq("dataset_id", datasetId).order("created_at", { ascending: false });
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
  const latestCurationByItem = useMemo(() => {
    const latest = new Map<string, CurationEvent>();
    for (const event of curationEvents) {
      if (!latest.has(event.dataset_item_id)) latest.set(event.dataset_item_id, event);
    }
    return latest;
  }, [curationEvents]);
  const canCurate = projectRole === "owner" || projectRole === "principal_investigator" || projectRole === "reviewer";
  const canCreateRelease = projectRole === "owner" || projectRole === "principal_investigator";
  const annotationCounts = useMemo(() => latestAnnotations.reduce<Record<string, number>>((counts, annotation) => {
    counts[annotation.status] = (counts[annotation.status] ?? 0) + 1;
    return counts;
  }, {}), [latestAnnotations]);


  async function recordCuration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !selectedCurationItemId) return;
    if (curationDecision !== "include" && curationRationale.trim().length < 3) {
      setError("Add a concise rationale when excluding an item or requesting remediation.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    const { error: rpcError } = await supabase.rpc("curate_dataset_item", {
      p_dataset_item_id: selectedCurationItemId,
      p_decision: curationDecision,
      p_rationale: curationRationale.trim(),
    });
    if (rpcError) {
      setError("The curation decision was not recorded. Check item eligibility and your project permissions.");
      setBusy(false);
      return;
    }
    setCurationRationale("");
    const { data } = await supabase.from("dataset_item_curation_events")
      .select("id,dataset_item_id,decision,rationale,curator_id,created_at")
      .in("dataset_item_id", items.map((item) => item.id)).order("created_at", { ascending: false });
    setCurationEvents((data ?? []) as CurationEvent[]);
    setNotice("Curation decision recorded in the append-only history.");
    setBusy(false);
  }

  async function createRelease() {
    if (!supabase || !canCreateRelease) return;
    setBusy(true); setError(""); setNotice("");
    const { data, error: rpcError } = await supabase.rpc("create_dataset_release", { p_dataset_id: datasetId });
    if (rpcError) {
      setError("A release could not be created. Confirm rights, approved assets, accepted annotations, checksums and included curation decisions.");
      setBusy(false);
      return;
    }
    const { data: releaseData } = await supabase.from("dataset_releases")
      .select("id,release_number,record_count,manifest_sha256,created_at")
      .eq("dataset_id", datasetId).order("release_number", { ascending: false });
    setReleases((releaseData ?? []) as Release[]);
    setNotice(data?.release_number ? `Release v${data.release_number} sealed with ${data.record_count} eligible records.` : "Dataset release manifest sealed.");
    setBusy(false);
  }

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

        {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">{notice}</p>}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Estimated records</p><p className="mt-2 text-3xl font-semibold tabular-nums">{dataset.record_count == null ? "—" : dataset.record_count.toLocaleString()}</p><p className="mt-1 text-xs text-neutral-500">Declared metadata, not a verified item count</p></div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Registered work items</p><p className="mt-2 text-3xl font-semibold tabular-nums">{items.length}</p><p className="mt-1 text-xs text-neutral-500">Current dataset item records</p></div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Annotations</p><p className="mt-2 text-3xl font-semibold tabular-nums">{annotations.length}</p><p className="mt-1 text-xs text-neutral-500">Annotation revisions visible to your role</p></div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Latest annotation states</p><p className="mt-2 text-xl font-semibold tabular-nums">{latestAnnotations.length}</p><p className="mt-1 text-xs text-neutral-500">One latest revision per work item</p></div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.8fr)]">
          <section className="min-w-0"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">Work item queue</h2><p className="mt-1 text-sm text-neutral-600">Current item states from the authorized dataset workspace.</p></div><Link href="/annotate" className="inline-flex min-h-10 items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700">Open annotation operations</Link></div>
            <div className="mt-4 flex flex-wrap gap-2">{Object.entries(statusCounts).sort(([a], [b]) => a.localeCompare(b)).map(([status, count]) => <span key={status} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700">{pretty(status)} <strong className="ml-1 tabular-nums">{count}</strong></span>)}</div>
            {items.length === 0 ? <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-white p-8"><h3 className="font-semibold">No work items registered</h3><p className="mt-2 text-sm text-neutral-600">Work items are created when approved source assets are added to an annotation dataset.</p></div> : <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500"><tr><th className="px-4 py-3 font-semibold">Work item</th><th className="px-4 py-3 font-semibold">Assignment</th><th className="px-4 py-3 font-semibold">Task state</th><th className="px-4 py-3 font-semibold">Curation</th><th className="px-4 py-3 font-semibold">Created</th></tr></thead><tbody className="divide-y divide-neutral-100">{items.map((item, index) => <tr key={item.id}><td className="px-4 py-3 font-medium">Item {String(index + 1).padStart(2, "0")}</td><td className="px-4 py-3 text-neutral-600">{item.assigned_to ? "Assigned" : "Unassigned"}</td><td className="px-4 py-3 text-neutral-700">{pretty(item.status)}</td><td className="px-4 py-3 text-neutral-600">{pretty(latestCurationByItem.get(item.id)?.decision ?? "not reviewed")}</td><td className="px-4 py-3 text-neutral-500">{date(item.created_at)}</td></tr>)}</tbody></table></div>}
          </section>

          <aside className="space-y-4">
            {canCurate && <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold">Curation decision</h2>
              <p className="mt-1 text-xs leading-5 text-neutral-500">Include only independently accepted items with approved source assets, consent evidence and checksums.</p>
              <form className="mt-4 space-y-3" onSubmit={recordCuration}>
                <label className="block text-sm font-medium">Work item<select className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm" value={selectedCurationItemId} onChange={(event) => setSelectedCurationItemId(event.target.value)}>{items.map((item, index) => <option key={item.id} value={item.id}>Item {String(index + 1).padStart(2, "0")} · {pretty(item.status)}</option>)}</select></label>
                <label className="block text-sm font-medium">Decision<select className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm" value={curationDecision} onChange={(event) => setCurationDecision(event.target.value as typeof curationDecision)}><option value="include">Include in release candidate</option><option value="exclude">Exclude</option><option value="remediation_required">Require remediation</option></select></label>
                <label className="block text-sm font-medium">Rationale{curationDecision !== "include" && <span className="ml-1 text-xs text-neutral-500">(required)</span>}<textarea className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm" rows={3} maxLength={5000} value={curationRationale} onChange={(event) => setCurationRationale(event.target.value)} placeholder="Document the evidence or reason for this decision." /></label>
                <button type="submit" disabled={busy || !items.length} className="w-full rounded-lg bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Record curation decision"}</button>
              </form>
            </section>}
            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">Versioned releases</h2><span className="text-xs text-neutral-500">{releases.length}</span></div>
              <p className="mt-1 text-xs leading-5 text-neutral-500">Sealed metadata manifests preserve the eligible item set and SHA-256 integrity hash. They do not export clinical files or annotation labels.</p>
              {canCreateRelease && <button type="button" onClick={() => void createRelease()} disabled={busy} className="mt-4 w-full rounded-lg bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Working…" : "Create immutable release"}</button>}
              {releases.length ? <ul className="mt-4 divide-y divide-neutral-100">{releases.map((release) => <li key={release.id} className="py-3 first:pt-0"><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">Release v{release.release_number}</span><span className="text-xs text-neutral-500">{release.record_count} records</span></div><p className="mt-1 break-all font-mono text-[10px] text-neutral-500">SHA-256 {release.manifest_sha256}</p><p className="mt-1 text-xs text-neutral-500">{date(release.created_at)}</p></li>)}</ul> : <p className="mt-3 text-sm text-neutral-500">No immutable release manifests have been created.</p>}
            </section>
            <section className="rounded-xl border border-neutral-200 bg-white p-5"><h2 className="text-sm font-semibold">Dataset provenance</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-xs text-neutral-500">Source type</dt><dd className="mt-1 font-medium">{pretty(dataset.source_type)}</dd></div><div><dt className="text-xs text-neutral-500">Consent / rights basis</dt><dd className="mt-1 font-medium">{pretty(dataset.consent_basis)}</dd></div><div><dt className="text-xs text-neutral-500">License reference</dt><dd className="mt-1 font-medium">{dataset.license || "Not recorded"}</dd></div><div><dt className="text-xs text-neutral-500">Registered</dt><dd className="mt-1 font-medium">{date(dataset.created_at)}</dd></div></dl></section>
            <section className="rounded-xl border border-neutral-200 bg-white p-5"><h2 className="text-sm font-semibold">Annotation revisions</h2><p className="mt-1 text-xs text-neutral-500">Latest visible revision per item</p>{Object.entries(annotationCounts).length ? <ul className="mt-3 space-y-2">{Object.entries(annotationCounts).sort(([a], [b]) => a.localeCompare(b)).map(([status, count]) => <li key={status} className="flex items-center justify-between text-sm"><span className="text-neutral-600">{pretty(status)}</span><span className="font-semibold tabular-nums">{count}</span></li>)}</ul> : <p className="mt-3 text-sm text-neutral-500">No annotation revisions are visible yet.</p>}</section>
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="text-sm font-semibold text-amber-950">Release status</h2><p className="mt-2 text-sm leading-6 text-amber-900">Versioned dataset releases and controlled delivery are not implemented in this workspace. This view reports live metadata and work-item records only.</p></section>
          </aside>
        </div>
      </div>
    </main>
  );
}
