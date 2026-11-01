"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Dataset = { id: string; name: string; modality: string; project_id: string; status: string };
type Asset = { id: string; case_id: string; modality: string; original_filename: string; storage_path: string; status: string; uploaded_at: string };
type Item = { id: string; dataset_id: string; clinical_asset_id: string; status: string; created_at: string };
type Annotation = { id: string; dataset_item_id: string; labels: Record<string, unknown>; notes: string; status: string; revision: number; updated_at: string };

const field = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-900/5";
const button = "inline-flex min-h-10 items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const secondary = "inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50";
const panel = "rounded-2xl border border-slate-200 bg-white p-5";

export default function AnnotatePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState("");
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [datasetId, setDatasetId] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [signedUrl, setSignedUrl] = useState("");
  const [labelValue, setLabelValue] = useState("unreviewed");
  const [finding, setFinding] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async (preferred?: string) => {
    if (!supabase || !userId) return;
    setError("");
    const [ds, as] = await Promise.all([
      supabase.from("research_datasets").select("id,name,modality,project_id,status").order("created_at", { ascending: false }),
      supabase.from("clinical_assets").select("id,case_id,modality,original_filename,storage_path,status,uploaded_at").order("uploaded_at", { ascending: false }),
    ]);
    if (ds.error) { setError(ds.error.message); return; }
    if (as.error) { setError(as.error.message); return; }
    const nextDatasets = (ds.data ?? []) as Dataset[];
    const nextAssets = (as.data ?? []) as Asset[];
    setDatasets(nextDatasets); setAssets(nextAssets);
    const nextDataset = preferred ?? (nextDatasets.some(d => d.id === datasetId) ? datasetId : nextDatasets[0]?.id ?? "");
    setDatasetId(nextDataset);
    const { data: itemData, error: itemError } = nextDataset
      ? await supabase.from("dataset_items").select("id,dataset_id,clinical_asset_id,status,created_at").eq("dataset_id", nextDataset).order("created_at", { ascending: false })
      : { data: [], error: null };
    if (itemError) { setError(itemError.message); return; }
    const nextItems = (itemData ?? []) as Item[];
    setItems(nextItems);
    const itemIds = nextItems.map(i => i.id);
    if (itemIds.length) {
      const { data: annotationData, error: annotationError } = await supabase.from("dataset_annotations").select("id,dataset_item_id,labels,notes,status,revision,updated_at").in("dataset_item_id", itemIds).order("updated_at", { ascending: false });
      if (annotationError) { setError(annotationError.message); return; }
      setAnnotations((annotationData ?? []) as Annotation[]);
    } else setAnnotations([]);
    setSelectedItemId(current => preferred && nextItems.some(i => i.id === current) ? current : nextItems[0]?.id ?? "");
  }, [supabase, userId, datasetId]);

  useEffect(() => {
    let alive = true;
    async function init() {
      if (!supabase) { setError("Supabase is not configured."); return; }
      const { data, error: authError } = await supabase.auth.getUser();
      if (!alive) return;
      if (authError || !data.user) { setError("Sign in to access the annotation workspace."); return; }
      setUserId(data.user.id);
    }
    void init();
    return () => { alive = false; };
  }, [supabase]);

  useEffect(() => { if (userId) void refresh(); }, [userId]); // initial load after authentication

  const selectedItem = items.find(i => i.id === selectedItemId);
  const selectedAsset = assets.find(a => a.id === selectedItem?.clinical_asset_id);
  const currentAnnotation = annotations.find(a => a.dataset_item_id === selectedItemId && a.status !== "superseded");
  const counts = { queued: items.filter(i => i.status === "queued").length, submitted: items.filter(i => i.status === "submitted").length, accepted: items.filter(i => i.status === "accepted").length };

  useEffect(() => {
    let alive = true;
    async function loadPreview() {
      setSignedUrl("");
      if (!supabase || !selectedAsset?.storage_path) return;
      const { data } = await supabase.storage.from("jinox-clinical-assets").createSignedUrl(selectedAsset.storage_path, 300);
      if (alive && data?.signedUrl) setSignedUrl(data.signedUrl);
    }
    void loadPreview();
    return () => { alive = false; };
  }, [supabase, selectedAsset?.storage_path]);

  useEffect(() => {
    setLabelValue(typeof currentAnnotation?.labels?.label === "string" ? currentAnnotation.labels.label : "unreviewed");
    setFinding(typeof currentAnnotation?.labels?.finding === "string" ? currentAnnotation.labels.finding : "");
    setNotes(currentAnnotation?.notes ?? "");
  }, [selectedItemId, currentAnnotation?.id]);

  async function addAsset(assetId: string) {
    if (!supabase || !datasetId || !userId) return;
    setBusy(true); setError(""); setNotice("");
    const { error: insertError } = await supabase.from("dataset_items").insert({ dataset_id: datasetId, clinical_asset_id: assetId, added_by: userId });
    setBusy(false);
    if (insertError) { setError(insertError.code === "23505" ? "This asset is already in the selected dataset." : insertError.message); return; }
    setNotice("Asset added to dataset queue."); await refresh(datasetId);
  }

  async function saveAnnotation(submit: boolean) {
    if (!supabase || !userId || !selectedItemId) { setError("Select a dataset item first."); return; }
    setBusy(true); setError(""); setNotice("");
    const latestRevision = annotations.filter(a => a.dataset_item_id === selectedItemId).reduce((max, a) => Math.max(max, a.revision), 0);
    const { error: saveError } = await supabase.from("dataset_annotations").insert({
      dataset_item_id: selectedItemId, annotator_id: userId, schema_version: "oral-health-v1",
      labels: { label: labelValue, finding }, notes, status: submit ? "submitted" : "draft", revision: latestRevision + 1,
    });
    if (saveError) { setBusy(false); setError(saveError.message); return; }
    await supabase.from("dataset_items").update({ status: submit ? "submitted" : "in_progress", updated_at: new Date().toISOString() }).eq("id", selectedItemId);
    setBusy(false); setNotice(submit ? "Annotation submitted for review." : "Draft annotation saved."); await refresh(datasetId);
  }

  async function updateItemStatus(status: Item["status"]) {
    if (!supabase || !selectedItemId) return;
    setBusy(true); setError(""); setNotice("");
    const { error: updateError } = await supabase.from("dataset_items").update({ status, updated_at: new Date().toISOString() }).eq("id", selectedItemId);
    setBusy(false);
    if (updateError) setError(updateError.message); else { setNotice("Queue status updated."); await refresh(datasetId); }
  }

  const includedIds = new Set(items.map(i => i.clinical_asset_id));
  const eligibleAssets = assets.filter(a => !includedIds.has(a.id) && ["approved", "pending_review"].includes(a.status));

  return <main className="min-h-screen bg-[#f7f7f7] text-slate-900">

    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      
      <section className="py-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Dataset operations</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Annotation workspace</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Label dataset items and submit annotations for review.</p>
      </section>
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}
      <section className="grid gap-4 sm:grid-cols-3">
        {[["Items", items.length], ["Queued", counts.queued], ["Submitted", counts.submitted], ["Accepted", counts.accepted]].map(([title, value]) => <div key={title} className={panel}><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}
      </section>
      <section className="mt-6 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={panel}>
          <label className="text-sm font-semibold">Active dataset<select className={field} value={datasetId} onChange={e => { setDatasetId(e.target.value); void refresh(e.target.value); }}><option value="">Select a dataset</option>{datasets.map(d => <option key={d.id} value={d.id}>{d.name} · {d.modality.replaceAll("_", " ")}</option>)}</select></label>
          <div className="mt-5 flex items-center justify-between"><h2 className="font-semibold">Annotation queue</h2><button type="button" className={secondary} onClick={() => void refresh(datasetId)}>Refresh</button></div>
          <div className="mt-3 space-y-2">{items.map(item => { const asset = assets.find(a => a.id === item.clinical_asset_id); return <button key={item.id} type="button" onClick={() => setSelectedItemId(item.id)} className={`w-full rounded-xl border p-3 text-left ${selectedItemId === item.id ? "border-black bg-slate-50" : "border-slate-200"}`}><span className="block truncate text-sm font-medium">{asset?.original_filename ?? "Source asset"}</span><span className="mt-1 block text-xs capitalize text-slate-500">{item.status.replaceAll("_", " ")} · {asset?.modality.replaceAll("_", " ")}</span></button>; })}{!items.length && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">No items yet. Add source assets below.</p>}</div>
          <div className="mt-5 border-t border-slate-100 pt-4"><h3 className="font-semibold">Available source assets</h3><p className="mt-1 text-xs leading-5 text-slate-500">Only assets you own are available in this first release.</p><div className="mt-3 space-y-2">{eligibleAssets.map(asset => <div key={asset.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-2.5"><div className="min-w-0"><p className="truncate text-xs font-medium">{asset.original_filename}</p><p className="text-[11px] text-slate-500">{asset.modality.replaceAll("_", " ")}</p></div><button type="button" className={secondary} disabled={busy || !datasetId} onClick={() => void addAsset(asset.id)}>Add</button></div>)}{!eligibleAssets.length && <p className="text-xs text-slate-500">No unassigned assets available. Upload assets on the Collect data page.</p>}</div></div>
        </aside>
        <section className={panel}>
          {!selectedItem || !selectedAsset ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><p className="font-semibold">Select a dataset item</p><p className="mt-2 max-w-sm text-sm text-slate-500">Choose an item from the queue or add an uploaded asset to begin annotating.</p></div> : <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
            <div><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-slate-500">Source asset</p><h2 className="mt-1 break-words text-lg font-semibold">{selectedAsset.original_filename}</h2><p className="mt-1 text-sm text-slate-500">{selectedAsset.modality.replaceAll("_", " ")} · {selectedAsset.status.replaceAll("_", " ")}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{selectedItem.status.replaceAll("_", " ")}</span></div>
              {signedUrl ? <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2"><img src={signedUrl} alt="Private source asset preview" className="max-h-[620px] w-full object-contain" /></div> : <div className="mt-4 flex min-h-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">Preview is unavailable for this file type. The private source file remains linked to this item.</div>}
              <p className="mt-3 text-xs text-slate-500">Preview URL expires after five minutes. Non-image files may not render in the browser.</p>
            </div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); void saveAnnotation(false); }}>
              <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Annotation schema · oral-health-v1</p><h2 className="mt-1 text-lg font-semibold">Label this asset</h2><p className="mt-1 text-sm text-slate-500">Record a research label, not an automated clinical conclusion.</p></div>
              <label className="block text-sm font-medium">Primary label<select className={field} value={labelValue} onChange={e => setLabelValue(e.target.value)}><option value="unreviewed">Unreviewed / uncertain</option><option value="caries_present">Caries present</option><option value="caries_absent">Caries absent</option><option value="fluorosis_present">Fluorosis present</option><option value="fluorosis_absent">Fluorosis absent</option><option value="periodontal_findings">Periodontal findings</option><option value="oral_mucosal_finding">Oral mucosal finding</option><option value="not_assessable">Not assessable</option><option value="other">Other</option></select></label>
              <label className="block text-sm font-medium">Structured finding<textarea className={field} rows={4} maxLength={3000} value={finding} onChange={e => setFinding(e.target.value)} placeholder="Describe visible findings, region, uncertainty, or annotation rationale." /></label>
              <label className="block text-sm font-medium">Annotator notes<textarea className={field} rows={3} maxLength={5000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional context; do not include direct identifiers." /></label>
              {currentAnnotation && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Latest saved revision: {currentAnnotation.revision} · {currentAnnotation.status}</p>}
              <div className="flex flex-wrap gap-2"><button className={button} type="submit" disabled={busy}>{busy ? "Saving…" : "Save draft"}</button><button className={secondary} type="button" disabled={busy} onClick={() => void saveAnnotation(true)}>Submit for review</button></div>
              <div className="border-t border-slate-100 pt-4"><p className="text-xs leading-5 text-slate-500">Submitting records your annotation for review; it does not independently validate the label. Do not upload identifiable clinical material. Use data covered by the documented consent or ethics basis.</p></div>
            </form>
          </div>}
        </section>
      </section>
    </div>
  </main>;
}
