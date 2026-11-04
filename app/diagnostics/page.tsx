"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type CaseRecord = { id: string; case_code: string; county: string };
type Assessment = { id: string; case_id: string; assessment_type: string; clinician_impression: string; differential_notes: string; urgency: string; status: string; assessed_on: string };
const field = "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 outline-none focus:border-neutral-500 focus:ring-4 focus:ring-neutral-900/5";
const button = "inline-flex min-h-10 items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const panel = "rounded-lg border border-neutral-200 bg-white p-5 ";
const types = ["caries","periodontal","oral_mucosa","fluorosis","endodontic","occlusion","other"] as const;
const urgencyLevels = ["not_recorded","routine","prompt_review","urgent_review","emergency_referral"] as const;
const pretty = (value: string) => value.replaceAll("_"," ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function DiagnosticsWorkspacePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [ownerId, setOwnerId] = useState("");
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [caseId, setCaseId] = useState("");
  const [assessmentType, setAssessmentType] = useState<(typeof types)[number]>("caries");
  const [impression, setImpression] = useState("");
  const [differential, setDifferential] = useState("");
  const [urgency, setUrgency] = useState<(typeof urgencyLevels)[number]>("not_recorded");
  const [attested, setAttested] = useState(false);
  const [finalize, setFinalize] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const [caseResult, assessmentResult] = await Promise.all([
      supabase.from("clinical_cases").select("id,case_code,county").order("created_at", { ascending: false }),
      supabase.from("clinical_assessments").select("id,case_id,assessment_type,clinician_impression,differential_notes,urgency,status,assessed_on").order("assessed_on", { ascending: false }),
    ]);
    if (caseResult.error) setError(caseResult.error.message);
    else {
      const list = (caseResult.data ?? []) as CaseRecord[];
      setCases(list);
      if (!caseId && list[0]) setCaseId(list[0].id);
    }
    if (assessmentResult.error) setError(assessmentResult.error.message);
    else setAssessments((assessmentResult.data ?? []) as Assessment[]);
  }, [supabase, caseId]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setError("Supabase is not configured for this deployment."); return; }
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !data.user) { setError("Sign in to access clinician assessment records."); return; }
      setOwnerId(data.user.id);
      await refresh();
    }
    void load();
    return () => { active = false; };
  }, [supabase, refresh]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (!supabase || !ownerId || !caseId) { setError("Select a case before recording an assessment."); return; }
    if (!attested) { setError("Confirm that you are authorized to enter clinician assessment records."); return; }
    if (!impression.trim() || impression.trim().length > 3000) { setError("Enter an assessment between 1 and 3,000 characters."); return; }
    setBusy(true);
    const { error: insertError } = await supabase.from("clinical_assessments").insert({
      case_id: caseId,
      owner_id: ownerId,
      assessment_type: assessmentType,
      clinician_impression: impression.trim(),
      differential_notes: differential.trim(),
      urgency,
      clinician_role_attested: true,
      assessment_source: "clinician_entered",
      status: finalize ? "finalized" : "draft",
      assessed_on: new Date().toISOString().slice(0,10),
    });
    setBusy(false);
    if (insertError) { setError(insertError.message); return; }
    setImpression(""); setDifferential(""); setAttested(false); setFinalize(false);
    await refresh();
    setNotice(finalize ? "Clinician-entered assessment finalized and saved." : "Draft assessment saved. It is separate from any AI output.");
  }

  const caseName = (id: string) => {
    const record = cases.find((item) => item.id === id);
    return record ? `${record.case_code} · ${record.county}` : "Case";
  };

  return <main className="min-h-screen bg-neutral-50 text-neutral-900"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
    <header className="border-b border-neutral-200 pb-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">CLINICAL RECORDS / HUMAN-ENTERED</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Clinical assessments</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">Record and review clinician-entered impressions for a pseudonymous case. This is a documentation workflow, not an AI diagnostic engine.</p></header>
    <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-800"><strong>AI diagnostic status: not connected.</strong> No validated inference model is configured in this release. Do not use this prototype as a substitute for professional examination, clinical guidelines, emergency assessment or referral. The role confirmation below is self-attested and does not verify credentials.</div>
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800">{notice}</p>}
    <section className={`${panel} mt-6`}><h2 className="text-lg font-semibold">New clinician-entered assessment</h2>{!cases.length && <p className="mt-3 text-sm text-neutral-600">No cases yet. <Link className="underline" href="/data">Create a pseudonymous case first.</Link></p>}
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">Case<select className={field} value={caseId} onChange={e=>setCaseId(e.target.value)} required><option value="">Select case</option>{cases.map(c=><option key={c.id} value={c.id}>{c.case_code} · {c.county}</option>)}</select></label>
        <label className="text-sm font-medium">Assessment category<select className={field} value={assessmentType} onChange={e=>setAssessmentType(e.target.value as (typeof types)[number])}>{types.map(t=><option key={t} value={t}>{pretty(t)}</option>)}</select></label>
        <label className="text-sm font-medium">Urgency / disposition<select className={field} value={urgency} onChange={e=>setUrgency(e.target.value as (typeof urgencyLevels)[number])}>{urgencyLevels.map(t=><option key={t} value={t}>{pretty(t)}</option>)}</select></label>
        <label className="text-sm font-medium sm:col-span-2">Clinical impression<textarea className={field} rows={3} required maxLength={3000} value={impression} onChange={e=>setImpression(e.target.value)} placeholder="Record the clinician's own findings and impression. Avoid direct identifiers." /></label>
        <label className="text-sm font-medium sm:col-span-2">Differential / reasoning notes (optional)<textarea className={field} rows={3} maxLength={5000} value={differential} onChange={e=>setDifferential(e.target.value)} /></label>
        <label className="flex items-start gap-3 rounded-lg bg-neutral-50 p-3 text-sm leading-5 text-neutral-700 sm:col-span-2"><input type="checkbox" className="mt-1 size-4 accent-black" checked={attested} onChange={e=>setAttested(e.target.checked)} /><span>I am authorized to enter this clinician assessment, and it reflects a human review rather than an AI-generated diagnosis.</span></label>
        <label className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 text-sm leading-5 text-neutral-700 sm:col-span-2"><input type="checkbox" className="mt-1 size-4 accent-black" checked={finalize} onChange={e=>setFinalize(e.target.checked)} /><span>Finalize this entry after review. Leave unchecked to save as a draft.</span></label>
        <div className="sm:col-span-2"><button className={button} disabled={busy || !cases.length}>{busy ? "Saving…" : "Save assessment"}</button></div>
      </form>
    </section>
    <section className={`${panel} mt-6`}><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Assessment history</h2><span className="text-sm text-neutral-500">{assessments.length}</span></div>
      {assessments.length ? <ul className="mt-3 divide-y divide-neutral-100">{assessments.map(a=><li key={a.id} className="py-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">{pretty(a.assessment_type)} · {caseName(a.case_id)}</p><span className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs">{pretty(a.status)}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{a.clinician_impression}</p>{a.differential_notes && <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-500">Notes: {a.differential_notes}</p>}<p className="mt-2 text-xs text-neutral-500">{a.assessed_on} · Human-entered record · {pretty(a.urgency)}</p></li>)}</ul> : <p className="mt-4 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">No assessments recorded.</p>}
    </section>
  </div></main>;
}
