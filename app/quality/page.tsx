"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Dataset = { id: string; name: string; project_id: string; modality: string };
type Item = { id: string; dataset_id: string; clinical_asset_id: string; status: string; assigned_to: string | null; created_at: string };
type Member = { project_id: string; user_id: string; role: "owner" | "principal_investigator" | "researcher" | "reviewer" | "viewer" };
type Annotation = { id: string; dataset_item_id: string; annotator_id: string; labels: Record<string, unknown>; notes: string; status: string; revision: number; updated_at: string };
type Asset = { id: string; original_filename: string; modality: string; content_type: string; storage_path: string; status: string };
type QueueEntry = { dataset: Dataset; item: Item; annotation: Annotation; asset: Asset | undefined };

const field = "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-4 focus:ring-neutral-900/5";
const button = "inline-flex min-h-10 items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50";
const secondary = "inline-flex min-h-10 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50";
const pretty = (value: string) => value.replaceAll("_", " ").replace(/\\b\\w/g, (part) => part.toUpperCase());

export default function QualityWorkspacePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [decision, setDecision] = useState<"accepted" | "changes_requested" | "rejected">("accepted");
  const [rationale, setRationale] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!supabase) { setError("Authentication is not configured."); setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Sign in to access quality assurance.");

      const { data: datasetData, error: datasetError } = await supabase.from("research_datasets")
        .select("id,name,project_id,modality").order("created_at", { ascending: false });
      if (datasetError) throw new Error("Could not load datasets available to your account.");
      const datasets = (datasetData ?? []) as Dataset[];
      if (!datasets.length) { setQueue([]); setSelectedId(""); return; }

      const projectIds = [...new Set(datasets.map((dataset) => dataset.project_id))];
      const [memberResult, itemResult] = await Promise.all([
        supabase.from("research_project_members").select("project_id,user_id,role").in("project_id", projectIds),
        supabase.from("dataset_items").select("id,dataset_id,clinical_asset_id,status,assigned_to,created_at")
          .in("dataset_id", datasets.map((dataset) => dataset.id)).eq("status", "submitted").order("created_at", { ascending: true }),
      ]);
      if (memberResult.error || itemResult.error) throw new Error("Could not load the permitted review queue.");
      const members = (memberResult.data ?? []) as Member[];
      const items = (itemResult.data ?? []) as Item[];
      const authorizedProjectIds = new Set(members.filter((member) =>
        member.user_id === auth.user.id && ["owner", "principal_investigator", "reviewer"].includes(member.role)
      ).map((member) => member.project_id));
      const reviewableDatasets = datasets.filter((dataset) => authorizedProjectIds.has(dataset.project_id));
      const reviewableDatasetIds = new Set(reviewableDatasets.map((dataset) => dataset.id));
      const reviewableItems = items.filter((item) => reviewableDatasetIds.has(item.dataset_id));
      if (!reviewableItems.length) { setQueue([]); setSelectedId(""); return; }

      const itemIds = reviewableItems.map((item) => item.id);
      const assetIds = [...new Set(reviewableItems.map((item) => item.clinical_asset_id))];
      const [annotationResult, assetResult] = await Promise.all([
        supabase.from("dataset_annotations").select("id,dataset_item_id,annotator_id,labels,notes,status,revision,updated_at")
          .in("dataset_item_id", itemIds).eq("status", "submitted").order("updated_at", { ascending: false }),
        supabase.from("clinical_assets").select("id,original_filename,modality,content_type,storage_path,status").in("id", assetIds),
      ]);
      if (annotationResult.error || assetResult.error) throw new Error("Could not load submitted annotations or their authorized source metadata.");
      const annotations = (annotationResult.data ?? []) as Annotation[];
      const assets = (assetResult.data ?? []) as Asset[];
      const datasetById = new Map(datasets.map((dataset) => [dataset.id, dataset]));
      const itemById = new Map(reviewableItems.map((item) => [item.id, item]));
      const assetById = new Map(assets.map((asset) => [asset.id, asset]));
      const seen = new Set<string>();
      const nextQueue: QueueEntry[] = [];
      for (const annotation of annotations) {
        const item = itemById.get(annotation.dataset_item_id);
        const dataset = item ? datasetById.get(item.dataset_id) : undefined;
        if (!item || !dataset || annotation.annotator_id === auth.user.id || seen.has(item.id)) continue;
        seen.add(item.id);
        nextQueue.push({ dataset, item, annotation, asset: assetById.get(item.clinical_asset_id) });
      }
      setQueue(nextQueue);
      setSelectedId((current) => nextQueue.some((entry) => entry.annotation.id === current) ? current : nextQueue[0]?.annotation.id ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Quality queue could not be loaded.");
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  const selected = queue.find((entry) => entry.annotation.id === selectedId);
  useEffect(() => {
    let active = true;
    async function preview() {
      setPreviewUrl("");
      if (!supabase || !selected?.asset?.storage_path) return;
      const { data, error: previewError } = await supabase.storage.from("jinox-clinical-assets").createSignedUrl(selected.asset.storage_path, 300);
      if (active && !previewError && data?.signedUrl) setPreviewUrl(data.signedUrl);
    }
    void preview();
    return () => { active = false; };
  }, [supabase, selected?.asset?.storage_path]);

  const visibleQueue = queue.filter((entry) => filter === "all" || entry.dataset.id === filter);
  const selectedIsVisible = selected && visibleQueue.some((entry) => entry.annotation.id === selected.annotation.id);
  const datasetOptions = [...new Map(queue.map((entry) => [entry.dataset.id, entry.dataset])).values()];

  async function recordDecision() {
    if (!supabase || !selected || !selectedIsVisible) return;
    if (decision !== "accepted" && rationale.trim().length < 3) {
      setError("Add a concise rationale for a change request or rejection.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    const { error: reviewError } = await supabase.rpc("review_dataset_annotation", {
      p_annotation_id: selected.annotation.id,
      p_decision: decision,
      p_review_notes: rationale.trim(),
    });
    setBusy(false);
    if (reviewError) {
      setError("The review was not recorded. Confirm the annotation is still submitted and that you are an authorized independent reviewer.");
      return;
    }
    setNotice(decision === "accepted" ? "Annotation accepted and the decision recorded." : decision === "changes_requested" ? "Changes requested. The task has returned to the annotator." : "Annotation rejected and the decision recorded.");
    setRationale("");
    await load();
  }

  if (loading) return <main className="min-h-[60vh] p-8 text-sm text-neutral-500">Loading quality assurance queue…</main>;

  return (
    <main className="min-h-screen px-4 py-8 text-neutral-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6">
          <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">Data operations / independent review</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Quality assurance</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">Review submitted annotations against their source evidence. Decisions are recorded through the existing review workflow.</p></div>
          <button type="button" className={secondary} onClick={() => void load()}>Refresh queue</button>
        </header>
        {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">{notice}</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-4"><p className="text-xs uppercase tracking-wide text-neutral-500">Awaiting independent review</p><p className="mt-2 text-2xl font-semibold tabular-nums">{queue.length}</p></div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4"><p className="text-xs uppercase tracking-wide text-neutral-500">Projects represented</p><p className="mt-2 text-2xl font-semibold tabular-nums">{new Set(queue.map((entry) => entry.dataset.project_id)).size}</p></div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4"><p className="text-xs uppercase tracking-wide text-neutral-500">Datasets represented</p><p className="mt-2 text-2xl font-semibold tabular-nums">{datasetOptions.length}</p></div>
        </div>
        <div className="mt-6 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Review queue</h2><span className="text-xs text-neutral-500">{visibleQueue.length} shown</span></div>
            <label className="mt-4 block text-sm font-medium">Filter by dataset<select className={field} value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All datasets</option>{datasetOptions.map((dataset) => <option key={dataset.id} value={dataset.id}>{dataset.name}</option>)}</select></label>
            <ul className="mt-4 space-y-2">
              {visibleQueue.map((entry) => <li key={entry.annotation.id}><button type="button" onClick={() => setSelectedId(entry.annotation.id)} aria-current={selectedId === entry.annotation.id ? "true" : undefined} className={`w-full rounded-lg border p-3 text-left ${selectedId === entry.annotation.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"}`}><span className="block truncate text-sm font-semibold">{entry.asset?.original_filename ?? "Authorized source item"}</span><span className="mt-1 block text-xs text-neutral-500">{entry.dataset.name} · Revision {entry.annotation.revision}</span><span className="mt-1 block text-[11px] text-neutral-500">Submitted {new Date(entry.annotation.updated_at).toLocaleString()}</span></button></li>)}
            </ul>
            {!visibleQueue.length && <p className="mt-4 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">{queue.length ? "No submitted work matches this dataset filter." : "No submitted annotations are currently available for independent review in your projects."}</p>}
          </aside>

          <section className="min-w-0 rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
            {!selected || !selectedIsVisible ? <div className="grid min-h-72 place-items-center text-center"><div><h2 className="font-semibold">Select submitted work</h2><p className="mt-2 max-w-md text-sm text-neutral-500">Only work from another annotator in a project where you have review permission appears here.</p></div></div> : <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-neutral-500">Submitted annotation · Revision {selected.annotation.revision}</p><h2 className="mt-1 break-words text-lg font-semibold">{selected.asset?.original_filename ?? "Source item"}</h2><p className="mt-1 text-sm text-neutral-500">{selected.dataset.name} · {pretty(selected.asset?.modality ?? selected.dataset.modality)}</p></div><span className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs">Submitted</span></div>
              {previewUrl && selected.asset?.content_type?.startsWith("image/") ? <div className="relative h-[420px] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 p-2"><Image src={previewUrl} alt="Authorized source asset for annotation review" fill unoptimized sizes="(max-width: 1280px) 100vw, 60vw" className="object-contain" /></div> : <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">{previewUrl ? <a href={previewUrl} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">Open authorized source file preview</a> : "Source preview is unavailable. Confirm your project access and file modality."}</div>}
              <p className="text-xs text-neutral-500">Private preview link expires after five minutes. Do not download or redistribute source data outside approved project workflows.</p>
              <div className="rounded-lg border border-neutral-200 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Annotator submission</p><p className="mt-2 text-sm font-semibold">{String(selected.annotation.labels.label ?? "No primary label")}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">{String(selected.annotation.labels.finding ?? "No structured finding recorded.")}</p>{selected.annotation.notes && <p className="mt-3 whitespace-pre-wrap border-t border-neutral-100 pt-3 text-sm text-neutral-600">{selected.annotation.notes}</p>}<p className="mt-3 text-xs text-neutral-500">Annotator ID: {selected.annotation.annotator_id}</p></div>
              <form className="space-y-4 border-t border-neutral-100 pt-5" onSubmit={(event) => { event.preventDefault(); void recordDecision(); }}>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Independent quality decision</p><h3 className="mt-1 text-base font-semibold">Review this annotation</h3></div>
                <label className="block text-sm font-medium">Decision<select className={field} value={decision} onChange={(event) => setDecision(event.target.value as typeof decision)}><option value="accepted">Accept</option><option value="changes_requested">Request changes</option><option value="rejected">Reject</option></select></label>
                <label className="block text-sm font-medium">Rationale{decision !== "accepted" && <span className="ml-1 text-xs font-normal text-neutral-500">(required)</span>}<textarea className={field} rows={4} maxLength={5000} value={rationale} onChange={(event) => setRationale(event.target.value)} placeholder="Record evidence-based reasoning, uncertainty or specific corrections." /></label>
                <div className="flex flex-wrap gap-2"><button type="submit" className={button} disabled={busy}>{busy ? "Recording…" : "Record review decision"}</button><button type="button" className={secondary} disabled={busy} onClick={() => { setDecision("accepted"); setRationale(""); }}>Reset form</button></div>
              </form>
            </div>}
          </section>
        </div>
        <p className="mt-6 text-xs leading-5 text-neutral-500">The server-side review procedure enforces authorization and independence. This screen filters out your own submissions for convenience; it is not the security boundary. Sampling design, adjudication and inter-annotator agreement reporting are not implemented here.</p>
      </div>
    </main>
  );
}
