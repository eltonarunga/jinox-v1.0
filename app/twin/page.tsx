"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type CaseRecord = { id: string; case_code: string; county: string; age_band: string | null; created_at: string; consent_status: string };
type Asset = { id: string; modality: string; status: string; uploaded_at: string; byte_size: number };
type Observation = { id: string; category: string; observation_code: string; finding: string; observed_on: string; status: string };
const panel = "rounded-lg border border-neutral-200 bg-white p-5 ";
const pretty = (value: string) => value.replaceAll("_"," ").replace(/\b\w/g, (c) => c.toUpperCase());
const size = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / (1024*1024)).toFixed(1)} MB` : `${Math.round(bytes/1024)} KB`;

export default function DigitalTwinPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [caseId, setCaseId] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshCases = useCallback(async () => {
    if (!supabase) { setError("Supabase is not configured."); setLoading(false); return; }
    const { data, error: queryError } = await supabase.from("clinical_cases").select("id,case_code,county,age_band,created_at,consent_status").order("created_at", { ascending: false });
    if (queryError) setError(queryError.message);
    const list = (data ?? []) as CaseRecord[];
    setCases(list);
    setCaseId((current) => current && list.some((c) => c.id === current) ? current : list[0]?.id ?? "");
    setLoading(false);
  }, [supabase]);

  const refreshDetails = useCallback(async (id: string) => {
    if (!supabase || !id) { setAssets([]); setObservations([]); return; }
    const [assetResult, observationResult] = await Promise.all([
      supabase.from("clinical_assets").select("id,modality,status,uploaded_at,byte_size").eq("case_id", id).order("uploaded_at", { ascending: false }),
      supabase.from("clinical_observations").select("id,category,observation_code,finding,observed_on,status").eq("case_id", id).order("observed_on", { ascending: false }),
    ]);
    if (assetResult.error) setError(assetResult.error.message); else setAssets((assetResult.data ?? []) as Asset[]);
    if (observationResult.error) setError(observationResult.error.message); else setObservations((observationResult.data ?? []) as Observation[]);
  }, [supabase]);

  useEffect(() => { let active = true; async function load() {
    if (!supabase) { setError("Supabase is not configured."); setLoading(false); return; }
    const { data, error: authError } = await supabase.auth.getUser();
    if (!active) return;
    if (authError || !data.user) { setError("Sign in to access your case records."); setLoading(false); return; }
    await refreshCases();
  } void load(); return () => { active = false; }; }, [supabase, refreshCases]);
  useEffect(() => { void refreshDetails(caseId); }, [caseId, refreshDetails]);

  const selected = cases.find((item) => item.id === caseId);
  return <main className="min-h-screen bg-neutral-50 text-neutral-950"><div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <header className="border-b border-neutral-200 pb-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">CASE MANAGEMENT / SOURCE RECORDS</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Case records</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">Review uploaded files and dated observations for a selected case.</p></header>
    <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-800"><strong>Record viewer only.</strong> 3D and biological simulation are not available.</div>
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <section className={`${panel} mt-6`}><label className="block text-sm font-medium">Case profile<select className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm" value={caseId} onChange={e=>setCaseId(e.target.value)}><option value="">Select a case</option>{cases.map(c=><option key={c.id} value={c.id}>{c.case_code} · {c.county}</option>)}</select></label>
      {loading ? <p className="mt-4 text-sm text-neutral-500">Loading case records…</p> : !selected ? <div className="mt-4 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">No cases available. <Link className="underline" href="/data">Create a case and add source data.</Link></div> : <>
        <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-neutral-50 p-4"><p className="text-xs uppercase tracking-wide text-neutral-500">Pseudonymous ID</p><p className="mt-1 font-semibold">{selected.case_code}</p></div><div className="rounded-lg bg-neutral-50 p-4"><p className="text-xs uppercase tracking-wide text-neutral-500">Geography</p><p className="mt-1 font-semibold">{selected.county}, Kenya</p></div><div className="rounded-lg bg-neutral-50 p-4"><p className="text-xs uppercase tracking-wide text-neutral-500">Consent record</p><p className="mt-1 font-semibold">{pretty(selected.consent_status)}</p></div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-neutral-200 p-4"><p className="text-sm text-neutral-500">Uploaded assets</p><p className="mt-1 text-2xl font-semibold">{assets.length}</p></div><div className="rounded-lg border border-neutral-200 p-4"><p className="text-sm text-neutral-500">Clinical observations</p><p className="mt-1 text-2xl font-semibold">{observations.length}</p></div></div>
        <div className="mt-6 grid gap-5 md:grid-cols-2"><section><h2 className="font-semibold">Source data inventory</h2>{assets.length ? <ul className="mt-2 divide-y divide-neutral-100">{assets.map(a=><li key={a.id} className="flex justify-between gap-3 py-3 text-sm"><span>{pretty(a.modality)}<span className="block text-xs text-neutral-500">{new Date(a.uploaded_at).toLocaleDateString()} · {size(a.byte_size)}</span></span><span className="text-xs text-neutral-500">{pretty(a.status)}</span></li>)}</ul> : <p className="mt-2 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-500">No source files yet.</p>}</section>
        <section><h2 className="font-semibold">Longitudinal observations</h2>{observations.length ? <ul className="mt-2 divide-y divide-neutral-100">{observations.map(o=><li key={o.id} className="py-3"><p className="text-sm font-medium">{o.observed_on} · {pretty(o.category)}</p><p className="mt-1 text-sm text-neutral-700">{o.finding}</p><p className="mt-1 text-xs text-neutral-500">{o.observation_code} · {pretty(o.status)}</p></li>)}</ul> : <p className="mt-2 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-500">No dated observations yet.</p>}</section></div>
      </>}
    </section>
    <div className="mt-5 flex flex-wrap gap-3"><Link href="/data" className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white">Manage case data</Link><Link href="/diagnostics" className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold">Open clinical assessment</Link></div>
  </div></main>;
}
