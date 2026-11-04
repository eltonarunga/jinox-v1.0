"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Study = { id: string; study_name: string; target_phenotype: string; population_description: string; cohort_size: number | null; evidence_source: string; consent_and_ethics_status: string; analysis_plan: string; status: string; created_at: string };
const field = "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 outline-none focus:border-neutral-500 focus:ring-4 focus:ring-neutral-900/5";
const button = "inline-flex min-h-10 items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const phenotypes = ["dental_caries","periodontal_disease","dental_fluorosis","craniofacial_development","other"] as const;
const pretty = (value: string) => value.replaceAll("_"," ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function GeneticsWorkspacePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [ownerId, setOwnerId] = useState("");
  const [studies, setStudies] = useState<Study[]>([]);
  const [name, setName] = useState("");
  const [phenotype, setPhenotype] = useState<(typeof phenotypes)[number]>("dental_caries");
  const [population, setPopulation] = useState("");
  const [cohortSize, setCohortSize] = useState("");
  const [evidence, setEvidence] = useState("");
  const [ethics, setEthics] = useState("pending_review");
  const [plan, setPlan] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data, error: queryError } = await supabase.from("genetic_risk_studies")
      .select("id,study_name,target_phenotype,population_description,cohort_size,evidence_source,consent_and_ethics_status,analysis_plan,status,created_at")
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message);
    else setStudies((data ?? []) as Study[]);
  }, [supabase]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setError("Supabase is not configured."); return; }
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !data.user) { setError("Sign in to manage genetics research plans."); return; }
      setOwnerId(data.user.id);
      await refresh();
    }
    void load();
    return () => { active = false; };
  }, [supabase, refresh]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (!supabase || !ownerId) { setError("Your authenticated session is not ready."); return; }
    if (name.trim().length < 3 || population.trim().length < 3) { setError("Study name and population description must contain at least 3 characters."); return; }
    if (cohortSize && (!Number.isInteger(Number(cohortSize)) || Number(cohortSize) < 0)) { setError("Cohort size must be a non-negative whole number."); return; }
    setBusy(true);
    const { error: insertError } = await supabase.from("genetic_risk_studies").insert({
      owner_id: ownerId, study_name: name.trim(), target_phenotype: phenotype,
      population_description: population.trim(), cohort_size: cohortSize === "" ? null : Number(cohortSize),
      evidence_source: evidence.trim(), consent_and_ethics_status: ethics,
      analysis_plan: plan.trim(), status: "planning", individual_risk_prediction_enabled: false,
    });
    setBusy(false);
    if (insertError) { setError(insertError.message); return; }
    setName(""); setPopulation(""); setCohortSize(""); setEvidence(""); setPlan("");
    await refresh();
    setNotice("Study plan saved. No individual genetic score was calculated.");
  }

  return <main className="min-h-screen bg-neutral-50 text-neutral-900"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
    <header className="border-b border-neutral-200 pb-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">RESEARCH GOVERNANCE / GENETICS</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Genetics research protocols</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">Register research protocols and document the evidence, population and ethics status needed before any genomic analysis is considered.</p></header>
    <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-800"><strong>Individual genetic prediction is disabled.</strong> This section stores study metadata only. It does not accept raw genomic files, infer genetic variants, calculate polygenic scores or predict individual disease risk. Those functions require dedicated genomic privacy controls, ethics approval, suitable datasets, population-specific validation and expert review.</div>
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800">{notice}</p>}
    <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-5"><h2 className="text-lg font-semibold">Research protocol metadata</h2><form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium sm:col-span-2">Study name<input className={field} value={name} onChange={e=>setName(e.target.value)} required minLength={3} maxLength={160} /></label>
      <label className="text-sm font-medium">Target phenotype<select className={field} value={phenotype} onChange={e=>setPhenotype(e.target.value as (typeof phenotypes)[number])}>{phenotypes.map(p=><option key={p} value={p}>{pretty(p)}</option>)}</select></label>
      <label className="text-sm font-medium">Expected / observed cohort size<input className={field} type="number" min="0" step="1" value={cohortSize} onChange={e=>setCohortSize(e.target.value)} placeholder="Unknown or not yet enrolled" /></label>
      <label className="text-sm font-medium sm:col-span-2">Population description<textarea className={field} rows={2} value={population} onChange={e=>setPopulation(e.target.value)} required minLength={3} maxLength={2000} placeholder="Define the study population and sampling strategy; avoid naming individual participants." /></label>
      <label className="text-sm font-medium sm:col-span-2">Evidence / source references<textarea className={field} rows={2} value={evidence} onChange={e=>setEvidence(e.target.value)} maxLength={2000} placeholder="Published studies, validated variant references or data provenance." /></label>
      <label className="text-sm font-medium">Ethics and consent status<select className={field} value={ethics} onChange={e=>setEthics(e.target.value)}><option value="pending_review">Pending review</option><option value="approved">Approved</option><option value="not_approved">Not approved</option></select></label>
      <label className="text-sm font-medium">Workflow status<select className={field} value="planning" disabled><option value="planning">Planning</option></select></label>
      <label className="text-sm font-medium sm:col-span-2">Analysis plan<textarea className={field} rows={4} value={plan} onChange={e=>setPlan(e.target.value)} maxLength={10000} placeholder="Pre-specify phenotype definition, quality control, population structure, confounders, validation and calibration." /></label>
      <div className="sm:col-span-2"><button className={button} disabled={busy}>{busy ? "Saving…" : "Save research protocol"}</button></div>
    </form></section>
    <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Registered protocols</h2><span className="text-sm text-neutral-500">{studies.length}</span></div>{studies.length ? <ul className="mt-3 divide-y divide-neutral-100">{studies.map(s=><li key={s.id} className="py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{s.study_name}</p><p className="mt-1 text-sm text-neutral-600">{pretty(s.target_phenotype)} · Cohort {s.cohort_size ?? "not specified"}</p></div><span className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs">{pretty(s.consent_and_ethics_status)}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600">{s.population_description}</p>{s.analysis_plan && <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-500">Analysis plan: {s.analysis_plan}</p>}<p className="mt-2 text-xs text-neutral-500">Planning only · Individual risk prediction disabled</p></li>)}</ul> : <p className="mt-4 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">No genetics research protocols registered.</p>}</section>
  </div></main>;
}
