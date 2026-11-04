"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Asset = {
  id: string;
  case_id: string;
  owner_id: string;
  modality: string;
  original_filename: string;
  content_type: string;
  byte_size: number;
  storage_path: string;
  status: string;
  uploaded_at: string;
};
type Review = {
  id: string;
  asset_id: string;
  reviewer_id: string;
  decision: string;
  reason: string;
  created_at: string;
};
type Decision = "approve" | "reject" | "quarantine";

const supabase = getSupabaseBrowserClient();
const modalities = [
  "intraoral_photo",
  "panoramic_xray",
  "periapical_xray",
  "bitewing_xray",
  "cbct",
  "intraoral_scan",
  "clinical_record",
  "environmental_dataset",
  "other",
];

function humanSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function AssetReviewPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Sign in with an administrator account.");
      const { data: own, error: roleError } = await supabase
        .from("profiles").select("role").eq("id", auth.user.id).single();
      if (roleError) throw roleError;
      setRole(own.role);
      if (own.role !== "admin") {
        setAssets([]);
        setReviews([]);
        return;
      }
      const [assetResult, reviewResult] = await Promise.all([
        supabase.from("clinical_assets")
          .select("id,case_id,owner_id,modality,original_filename,content_type,byte_size,storage_path,status,uploaded_at")
          .eq("status", "pending_review")
          .order("uploaded_at", { ascending: false })
          .limit(100),
        supabase.from("clinical_asset_reviews")
          .select("id,asset_id,reviewer_id,decision,reason,created_at")
          .order("created_at", { ascending: false })
          .limit(25),
      ]);
      if (assetResult.error) throw assetResult.error;
      if (reviewResult.error) throw reviewResult.error;
      setAssets((assetResult.data ?? []) as Asset[]);
      setReviews((reviewResult.data ?? []) as Review[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load asset review queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function createPreview(asset: Asset) {
    if (!supabase) return;
    setError("");
    const { data, error: previewError } = await supabase.storage
      .from("jinox-clinical-assets")
      .createSignedUrl(asset.storage_path, 300);
    if (previewError || !data?.signedUrl) {
      setError(previewError?.message ?? "A temporary preview link could not be created.");
      return;
    }
    setPreviewUrls((current) => ({ ...current, [asset.id]: data.signedUrl }));
  }

  async function submitDecision(asset: Asset, decision: Decision) {
    if (!supabase) return;
    const reason = (reasons[asset.id] ?? "").trim();
    if (decision !== "approve" && !reason) {
      setError("A reason is required for rejection or quarantine.");
      return;
    }
    const actionLabel = decision === "approve" ? "approve" : decision === "reject" ? "reject" : "quarantine";
    if (!window.confirm(`Confirm you want to ${actionLabel} this asset? This decision cannot be changed in the review queue.`)) return;
    setBusyId(asset.id);
    setError("");
    setNotice("");
    const { error: reviewError } = await supabase.rpc("review_clinical_asset", {
      p_asset_id: asset.id,
      p_decision: decision,
      p_reason: reason,
    });
    if (reviewError) {
      setError(reviewError.message);
    } else {
      setNotice(`${asset.original_filename}: ${label(decision)} decision recorded.`);
      setReasons((current) => ({ ...current, [asset.id]: "" }));
      setPreviewUrls((current) => {
        const next = { ...current };
        delete next[asset.id];
        return next;
      });
      await load();
    }
    setBusyId("");
  }

  const visibleAssets = filter === "all" ? assets : assets.filter((asset) => asset.modality === filter);

  if (loading) {
    return <main className="grid min-h-[60vh] place-items-center text-sm text-slate-500">Loading asset review queue…</main>;
  }

  if (role !== "admin" && !error) {
    return <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Administrator access required</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Asset review is restricted to global administrators. Project annotation reviewer access does not grant permission to approve uploaded assets.</p>
      <Link href="/admin" className="mt-5 inline-flex border border-slate-300 px-4 py-2 text-sm font-medium">Back to administration</Link>
    </main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-slate-700 hover:text-black">← Administration</Link>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Collection governance</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Asset review queue</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Review pending uploads before they can be added to annotation datasets. Every decision is recorded in an append-only audit history.</p>
          </div>
          <button type="button" onClick={() => void load()} className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">Refresh queue</button>
        </header>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          This queue does not perform malware scanning, binary content verification, archive inspection, DICOM tag de-identification or image-pixel redaction. A human approval decision is not a substitute for those controls. Do not approve files until the project’s data-governance requirements have been met.
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</p>}

        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold">Pending uploads</h2><p className="mt-1 text-sm text-slate-500">{assets.length} pending item(s) · showing up to 100</p></div>
            <label className="text-sm font-medium">Modality
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="ml-2 border border-slate-300 bg-white px-3 py-2">
                <option value="all">All modalities</option>
                {modalities.map((modality) => <option key={modality} value={modality}>{label(modality)}</option>)}
              </select>
            </label>
          </div>
          {visibleAssets.length === 0 ? (
            <div className="mt-4 border border-slate-200 bg-white p-8 text-center">
              <h3 className="font-semibold">No pending uploads</h3>
              <p className="mt-2 text-sm text-slate-500">New uploads that pass intake registration will appear here.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {visibleAssets.map((asset) => (
                <article key={asset.id} className="border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-all font-semibold">{asset.original_filename}</h3>
                      <p className="mt-1 text-sm text-slate-500">{label(asset.modality)} · {asset.content_type} · {humanSize(asset.byte_size)}</p>
                      <p className="mt-1 break-all text-xs text-slate-400">Asset {asset.id} · Case {asset.case_id} · Uploaded {new Date(asset.uploaded_at).toLocaleString()}</p>
                    </div>
                    <span className="border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">Pending review</span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => void createPreview(asset)} className="border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Generate 5-minute file link</button>
                    {previewUrls[asset.id] && <a href={previewUrls[asset.id]} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline">Open private file</a>}
                    <span className="text-xs text-slate-500">Uploader: {asset.owner_id}</span>
                  </div>

                  <label className="mt-4 block text-sm font-medium">Review rationale
                    <span className="mt-1 block text-xs font-normal text-slate-500">Record an operational reason only. Do not include patient names, identifiers or other sensitive clinical details.</span>
                    <textarea value={reasons[asset.id] ?? ""} onChange={(event) => setReasons((current) => ({ ...current, [asset.id]: event.target.value }))} maxLength={2000} rows={2} className="mt-2 w-full border border-slate-300 bg-white p-3 text-sm" placeholder="Required for rejection or quarantine; optional for approval." />
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" disabled={busyId === asset.id} onClick={() => void submitDecision(asset, "approve")} className="bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Approve</button>
                    <button type="button" disabled={busyId === asset.id} onClick={() => void submitDecision(asset, "reject")} className="border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Reject</button>
                    <button type="button" disabled={busyId === asset.id} onClick={() => void submitDecision(asset, "quarantine")} className="border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50">Quarantine</button>
                    {busyId === asset.id && <span role="status" className="self-center text-xs text-slate-500">Recording decision…</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold">Recent review history</h2>
            <p className="mt-1 text-sm text-slate-500">Latest 25 decisions; records cannot be edited or deleted through the application.</p>
          </div>
          {reviews.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Decision</th><th className="px-5 py-3">Asset</th><th className="px-5 py-3">Reviewer</th><th className="px-5 py-3">Rationale</th><th className="px-5 py-3">Date</th></tr></thead>
            <tbody>{reviews.map((review) => <tr key={review.id} className="border-t border-slate-100 align-top">
              <td className="px-5 py-4 font-medium">{label(review.decision)}</td>
              <td className="px-5 py-4 font-mono text-xs">{review.asset_id}</td>
              <td className="px-5 py-4 font-mono text-xs">{review.reviewer_id}</td>
              <td className="max-w-sm whitespace-pre-wrap px-5 py-4 text-slate-600">{review.reason || "—"}</td>
              <td className="px-5 py-4 text-slate-500">{new Date(review.created_at).toLocaleString()}</td>
            </tr>)}</tbody>
          </table></div> : <p className="p-5 text-sm text-slate-500">No asset review decisions have been recorded yet.</p>}
        </section>
      </div>
    </main>
  );
}
