"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Dataset = { id: string; name: string; modality: string; project_id: string; status: string };
type Asset = { id: string; case_id: string; modality: string; original_filename: string; storage_path: string; status: string; uploaded_at: string };
type Item = { id: string; dataset_id: string; clinical_asset_id: string; status: string; assigned_to: string | null; created_at: string };
type Member = { user_id: string; role: "owner" | "principal_investigator" | "researcher" | "reviewer" | "viewer" };
type Annotation = { id: string; dataset_item_id: string; annotator_id: string; labels: Record<string, unknown>; notes: string; status: string; revision: number; updated_at: string };

const field = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-900/5";
const button = "inline-flex min-h-10 items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const secondary = "inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50";
const panel = "rounded-2xl border border-slate-200 bg-white p-5";

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function AnnotatePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState<Member["role"] | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [datasetId, setDatasetId] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [signedUrl, setSignedUrl] = useState("");
  const [labelValue, setLabelValue] = useState("unreviewed");
  const [finding, setFinding] = useState("");
  const [notes, setNotes] = useState("");
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState<"researcher" | "reviewer" | "viewer">("researcher");
  const [reviewDecision, setReviewDecision] = useState<"accepted" | "changes_requested" | "rejected">("accepted");
  const [reviewNotes, setReviewNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async (preferredDatasetId?: string) => {
    if (!supabase || !userId) return;
    setError("");
    const [datasetResult, assetResult] = await Promise.all([
      supabase.from("research_datasets").select("id,name,modality,project_id,status").order("created_at", { ascending: false }),
      supabase.from("clinical_assets").select("id,case_id,modality,original_filename,storage_path,status,uploaded_at").order("uploaded_at", { ascending: false }),
    ]);
    if (datasetResult.error) { setError("Could not load datasets. Check project membership."); return; }
    if (assetResult.error) { setError("Could not load authorized source assets."); return; }

    const nextDatasets = (datasetResult.data ?? []) as Dataset[];
    const nextAssets = (assetResult.data ?? []) as Asset[];
    const nextDatasetId = preferredDatasetId && nextDatasets.some((item) => item.id === preferredDatasetId)
      ? preferredDatasetId
      : datasetId && nextDatasets.some((item) => item.id === datasetId)
        ? datasetId
        : nextDatasets[0]?.id ?? "";
    const activeDataset = nextDatasets.find((item) => item.id === nextDatasetId);
    setDatasets(nextDatasets);
    setAssets(nextAssets);
    setDatasetId(nextDatasetId);

    let nextItems: Item[] = [];
    let nextMembers: Member[] = [];
    if (nextDatasetId && activeDataset) {
      const [itemResult, memberResult] = await Promise.all([
        supabase.from("dataset_items").select("id,dataset_id,clinical_asset_id,status,assigned_to,created_at").eq("dataset_id", nextDatasetId).order("created_at", { ascending: false }),
        supabase.from("research_project_members").select("user_id,role").eq("project_id", activeDataset.project_id),
      ]);
      if (itemResult.error) { setError("Could not load dataset tasks."); return; }
      if (memberResult.error) { setError("Could not load project workforce permissions."); return; }
      nextItems = (itemResult.data ?? []) as Item[];
      nextMembers = (memberResult.data ?? []) as Member[];
    }
    setItems(nextItems);
    setMembers(nextMembers);
    setUserRole(nextMembers.find((member) => member.user_id === userId)?.role ?? null);

    const itemIds = nextItems.map((item) => item.id);
    if (itemIds.length) {
      const { data, error: annotationError } = await supabase.from("dataset_annotations")
        .select("id,dataset_item_id,annotator_id,labels,notes,status,revision,updated_at")
        .in("dataset_item_id", itemIds).order("updated_at", { ascending: false });
      if (annotationError) { setError("Could not load permitted annotation records."); return; }
      setAnnotations((data ?? []) as Annotation[]);
    } else {
      setAnnotations([]);
    }
    setSelectedItemId((current) => current && nextItems.some((item) => item.id === current)
      ? current
      : nextItems[0]?.id ?? "");
  }, [supabase, userId, datasetId]);

  useEffect(() => {
    let active = true;
    async function initialize() {
      if (!supabase) { setError("Supabase is not configured."); return; }
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !data.user) { setError("Sign in to access the annotation workspace."); return; }
      setUserId(data.user.id);
    }
    void initialize();
    return () => { active = false; };
  }, [supabase]);

  useEffect(() => { if (userId) void refresh(); }, [userId, refresh]);

  const selectedItem = items.find((item) => item.id === selectedItemId);
  const selectedAsset = assets.find((asset) => asset.id === selectedItem?.clinical_asset_id);
  const canManage = userRole === "owner" || userRole === "principal_investigator";
  const canReview = canManage || userRole === "reviewer";
  const canAnnotate = userRole === "researcher" && selectedItem?.assigned_to === userId;
  const currentAnnotation = annotations
    .filter((annotation) => annotation.dataset_item_id === selectedItemId && annotation.annotator_id === userId && annotation.status === "draft")
    .sort((a, b) => b.revision - a.revision)[0];
  const submittedAnnotation = annotations
    .filter((annotation) => annotation.dataset_item_id === selectedItemId && annotation.status === "submitted")
    .sort((a, b) => b.revision - a.revision)[0];
  const counts = {
    queued: items.filter((item) => item.status === "queued").length,
    inProgress: items.filter((item) => item.status === "in_progress").length,
    submitted: items.filter((item) => item.status === "submitted").length,
    accepted: items.filter((item) => item.status === "accepted").length,
  };

  useEffect(() => {
    let active = true;
    async function loadPreview() {
      setSignedUrl("");
      if (!supabase || !selectedAsset?.storage_path) return;
      const { data, error: urlError } = await supabase.storage.from("jinox-clinical-assets").createSignedUrl(selectedAsset.storage_path, 300);
      if (active && !urlError && data?.signedUrl) setSignedUrl(data.signedUrl);
    }
    void loadPreview();
    return () => { active = false; };
  }, [supabase, selectedAsset?.storage_path]);

  useEffect(() => {
    setLabelValue(typeof currentAnnotation?.labels?.label === "string" ? currentAnnotation.labels.label : "unreviewed");
    setFinding(typeof currentAnnotation?.labels?.finding === "string" ? currentAnnotation.labels.finding : "");
    setNotes(currentAnnotation?.notes ?? "");
  }, [selectedItemId, currentAnnotation?.id, currentAnnotation?.labels?.label, currentAnnotation?.labels?.finding, currentAnnotation?.notes]);

  async function addAsset(assetId: string) {
    if (!supabase || !datasetId || !userId || !canManage) return;
    const asset = assets.find((item) => item.id === assetId);
    if (!asset || asset.status !== "approved") { setError("Only approved assets can enter an annotation dataset."); return; }
    setBusy(true); setError(""); setNotice("");
    const { error: insertError } = await supabase.from("dataset_items").insert({ dataset_id: datasetId, clinical_asset_id: assetId, added_by: userId });
    setBusy(false);
    if (insertError) { setError(insertError.code === "23505" ? "This asset is already in the selected dataset." : "The approved asset could not be added."); return; }
    setNotice("Approved asset added to the unassigned task queue.");
    await refresh(datasetId);
  }

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !canManage || userRole !== "owner") return;
    const normalizedId = memberUserId.trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizedId)) {
      setError("Enter a valid existing Supabase Auth user UUID.");
      return;
    }
    const activeDataset = datasets.find((item) => item.id === datasetId);
    if (!activeDataset) return;
    setBusy(true); setError(""); setNotice("");
    const { error: memberError } = await supabase.from("research_project_members").insert({
      project_id: activeDataset.project_id, user_id: normalizedId, role: memberRole,
    });
    setBusy(false);
    if (memberError) { setError(memberError.code === "23505" ? "That user is already a project member." : "Could not add this project member. Confirm the user exists and you own the project."); return; }
    setMemberUserId("");
    setNotice("Project membership added. The user can now access only the project resources allowed by their role.");
    await refresh(datasetId);
  }

  async function assignItem(itemId: string, assigneeId: string) {
    if (!supabase || !canManage) return;
    setBusy(true); setError(""); setNotice("");
    const { error: assignmentError } = await supabase.from("dataset_items")
      .update({ assigned_to: assigneeId || null, status: "queued" }).eq("id", itemId);
    setBusy(false);
    if (assignmentError) { setError("Task assignment failed. Select a researcher who is a member of this project."); return; }
    setNotice(assigneeId ? "Task assigned to the selected researcher." : "Task returned to the unassigned queue.");
    await refresh(datasetId);
  }

  async function saveAnnotation(submit: boolean) {
    if (!supabase || !selectedItemId || !canAnnotate) { setError("Only the researcher assigned to this task can save its annotation."); return; }
    setBusy(true); setError(""); setNotice("");
    const { error: saveError } = await supabase.rpc("save_dataset_annotation", {
      p_dataset_item_id: selectedItemId,
      p_labels: { label: labelValue, finding },
      p_notes: notes,
      p_submit: submit,
    });
    setBusy(false);
    if (saveError) { setError("The annotation could not be saved. Refresh the task and verify that it is still assigned to you."); return; }
    setNotice(submit ? "Annotation submitted. The task is now awaiting independent review." : "Draft saved.");
    await refresh(datasetId);
  }

  async function reviewAnnotation() {
    if (!supabase || !submittedAnnotation || !canReview || selectedItem?.status !== "submitted") return;
    setBusy(true); setError(""); setNotice("");
    const { error: reviewError } = await supabase.rpc("review_dataset_annotation", {
      p_annotation_id: submittedAnnotation.id,
      p_decision: reviewDecision,
      p_review_notes: reviewNotes,
    });
    setBusy(false);
    if (reviewError) { setError("Review could not be recorded. Confirm this is submitted work from another annotator."); return; }
    setReviewNotes("");
    setNotice(reviewDecision === "accepted" ? "Annotation accepted and item marked ready for dataset curation." : reviewDecision === "rejected" ? "Annotation rejected." : "Changes requested; the item has returned to the annotator.");
    await refresh(datasetId);
  }

  const includedIds = new Set(items.map((item) => item.clinical_asset_id));
  const eligibleAssets = canManage
    ? assets.filter((asset) => asset.status === "approved" && !includedIds.has(asset.id))
    : [];

  return (
    <main className="min-h-screen bg-[#f7f7f7] text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="py-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Data operations</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Annotation operations</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Manage approved dataset items, assign trained project researchers, and independently review submitted annotations.</p>
        </section>
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}

        <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Queue", items.filter((item) => item.status === "queued").length],
            ["In progress", counts.inProgress],
            ["Awaiting QA", counts.submitted],
            ["Accepted", counts.accepted],
          ].map(([title, value]) => <div key={title} className={panel}><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}
        </section>

        <section className={panel}>
          <label className="block max-w-xl text-sm font-semibold">Active dataset
            <select className={field} value={datasetId} onChange={(event) => { setDatasetId(event.target.value); void refresh(event.target.value); }}>
              <option value="">Select a dataset</option>
              {datasets.map((dataset) => <option key={dataset.id} value={dataset.id}>{dataset.name} · {label(dataset.modality)}</option>)}
            </select>
          </label>
          {userRole && <p className="mt-2 text-xs text-slate-500">Project role: {label(userRole)}</p>}
        </section>

        {canManage && userRole === "owner" && datasets.some((dataset) => dataset.id === datasetId) && (
          <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <form onSubmit={addMember} className={panel}>
              <h2 className="font-semibold">Project workforce</h2>
              <p className="mt-1 text-sm text-slate-500">Add an existing Supabase Auth user to this project. Invitations and email lookup are not yet implemented.</p>
              <label className="mt-3 block text-sm font-medium">User UUID<input className={field} value={memberUserId} onChange={(event) => setMemberUserId(event.target.value)} placeholder="00000000-0000-4000-8000-000000000000" /></label>
              <label className="mt-3 block text-sm font-medium">Project role
                <select className={field} value={memberRole} onChange={(event) => setMemberRole(event.target.value as typeof memberRole)}>
                  <option value="researcher">Researcher / annotator</option><option value="reviewer">Independent reviewer</option><option value="viewer">Viewer</option>
                </select>
              </label>
              <button className={button + " mt-4"} type="submit" disabled={busy}>Add project member</button>
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current project members</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {members.map((member) => <li key={member.user_id} className="flex flex-wrap justify-between gap-2"><span className="font-mono">{member.user_id}</span><span>{label(member.role)}</span></li>)}
                </ul>
              </div>
            </form>
            <section className={panel}>
              <h2 className="font-semibold">Approved assets ready for curation</h2>
              <p className="mt-1 text-sm text-slate-500">Only approved assets can be added to this dataset. Pending, rejected, and quarantined files stay outside annotation operations.</p>
              <div className="mt-3 space-y-2">
                {eligibleAssets.map((asset) => <div key={asset.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{asset.original_filename}</p><p className="text-xs text-slate-500">{label(asset.modality)}</p></div><button type="button" className={secondary} disabled={busy || !datasetId} onClick={() => void addAsset(asset.id)}>Add to dataset</button></div>)}
                {!eligibleAssets.length && <p className="text-sm text-slate-500">No approved unassigned assets are available in this workspace.</p>}
              </div>
            </section>
          </section>
        )}

        <section className="mt-5 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className={panel}>
            <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Task queue</h2><button type="button" className={secondary} onClick={() => void refresh(datasetId)}>Refresh</button></div>
            <div className="mt-3 space-y-2">
              {items.map((item) => {
                const asset = assets.find((candidate) => candidate.id === item.clinical_asset_id);
                const assignee = members.find((member) => member.user_id === item.assigned_to);
                return <button key={item.id} type="button" onClick={() => setSelectedItemId(item.id)} className={`w-full rounded-xl border p-3 text-left ${selectedItemId === item.id ? "border-black bg-slate-50" : "border-slate-200"}`}>
                  <span className="block truncate text-sm font-medium">{asset?.original_filename ?? "Authorized source asset"}</span>
                  <span className="mt-1 block text-xs text-slate-500">{label(item.status)} · {assignee ? `Assigned: ${assignee.user_id.slice(0, 8)}…` : "Unassigned"}</span>
                </button>;
              })}
              {!items.length && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">{canManage ? "Add an approved asset to create the first task." : "No tasks are currently assigned or available to your role."}</p>}
            </div>
          </aside>

          <section className={panel}>
            {!selectedItem || !selectedAsset ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><p className="font-semibold">Select an authorized task</p><p className="mt-2 max-w-sm text-sm text-slate-500">Source assets are visible only to their owner and authorized project collaborators.</p></div> : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-xs uppercase tracking-wider text-slate-500">Source asset</p><h2 className="mt-1 break-words text-lg font-semibold">{selectedAsset.original_filename}</h2><p className="mt-1 text-sm text-slate-500">{label(selectedAsset.modality)} · {label(selectedAsset.status)}</p></div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{label(selectedItem.status)}</span>
                </div>

                {canManage && <label className="block max-w-lg text-sm font-medium">Assign to project researcher
                  <select className={field} value={selectedItem.assigned_to ?? ""} disabled={busy} onChange={(event) => void assignItem(selectedItem.id, event.target.value)}>
                    <option value="">Unassigned</option>
                    {members.filter((member) => member.role === "researcher").map((member) => <option key={member.user_id} value={member.user_id}>{member.user_id}</option>)}
                  </select>
                </label>}

                {signedUrl ? <div className="relative mt-2 h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2"><Image src={signedUrl} alt="Authorized private source asset preview" fill unoptimized sizes="(max-width: 1280px) 100vw, 60vw" className="object-contain" /></div> : <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">Preview is unavailable for this file type or your role cannot access its private object.</div>}
                <p className="text-xs text-slate-500">Signed preview URLs expire after five minutes. The source file remains private.</p>

                {canAnnotate ? <form className="space-y-4 border-t border-slate-100 pt-5" onSubmit={(event) => { event.preventDefault(); void saveAnnotation(false); }}>
                  <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Annotation schema · oral-health-v1</p><h2 className="mt-1 text-lg font-semibold">Annotate assigned item</h2><p className="mt-1 text-sm text-slate-500">Record a research label and uncertainty; this is not an automated clinical conclusion.</p></div>
                  <label className="block text-sm font-medium">Primary label<select className={field} value={labelValue} onChange={(event) => setLabelValue(event.target.value)}><option value="unreviewed">Unreviewed / uncertain</option><option value="caries_present">Caries present</option><option value="caries_absent">Caries absent</option><option value="fluorosis_present">Fluorosis present</option><option value="fluorosis_absent">Fluorosis absent</option><option value="periodontal_findings">Periodontal findings</option><option value="oral_mucosal_finding">Oral mucosal finding</option><option value="not_assessable">Not assessable</option><option value="other">Other</option></select></label>
                  <label className="block text-sm font-medium">Structured finding<textarea className={field} rows={4} maxLength={3000} value={finding} onChange={(event) => setFinding(event.target.value)} placeholder="Describe visible findings, region, uncertainty, or annotation rationale." /></label>
                  <label className="block text-sm font-medium">Annotator notes<textarea className={field} rows={3} maxLength={5000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional context; do not include direct identifiers." /></label>
                  {currentAnnotation && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Draft revision: {currentAnnotation.revision}</p>}
                  <div className="flex flex-wrap gap-2"><button className={button} type="submit" disabled={busy}>{busy ? "Saving…" : "Save draft"}</button><button className={secondary} type="button" disabled={busy} onClick={() => void saveAnnotation(true)}>Submit for independent review</button></div>
                </form> : canReview && submittedAnnotation && selectedItem.status === "submitted" ? <form className="space-y-4 border-t border-slate-100 pt-5" onSubmit={(event) => { event.preventDefault(); void reviewAnnotation(); }}>
                  <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Independent quality assurance</p><h2 className="mt-1 text-lg font-semibold">Review submitted annotation</h2><p className="mt-1 text-sm text-slate-500">Revision {submittedAnnotation.revision} · annotator {submittedAnnotation.annotator_id.slice(0, 8)}…</p></div>
                  <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold">{String(submittedAnnotation.labels.label ?? "No primary label")}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{String(submittedAnnotation.labels.finding ?? "")}</p><p className="mt-2 whitespace-pre-wrap text-xs text-slate-500">{submittedAnnotation.notes}</p></div>
                  <label className="block text-sm font-medium">Review decision<select className={field} value={reviewDecision} onChange={(event) => setReviewDecision(event.target.value as typeof reviewDecision)}><option value="accepted">Accept</option><option value="changes_requested">Request changes</option><option value="rejected">Reject</option></select></label>
                  <label className="block text-sm font-medium">Reviewer rationale<textarea className={field} rows={3} maxLength={5000} value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} placeholder="Record the basis for the decision." /></label>
                  <button className={button} type="submit" disabled={busy}>{busy ? "Recording…" : "Record QA decision"}</button>
                </form> : <div className="border-t border-slate-100 pt-4"><p className="text-sm font-medium">{canManage ? "Task management view" : userRole === "reviewer" ? "No submitted annotation is awaiting review on this item." : "This item is not assigned to your annotator account."}</p><p className="mt-1 text-xs leading-5 text-slate-500">Drafts, submissions, and review decisions are governed by project membership and database policies.</p></div>}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
