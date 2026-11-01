"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Project = { id: string; name: string };
type Dataset = { id: string; project_id: string; name: string; description: string; modality: string; source_type: string; consent_basis: string; license: string | null; record_count: number | null; status: string; created_at: string };
const modalities = ["panoramic_xray", "periapical_xray", "bitewing_xray", "cbct", "intraoral_photo", "clinical_text", "genomic", "environmental", "other"];
const inputClass = "mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15";

export default function DatasetsPage() {
  const [initialProjectId, setInitialProjectId] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setInitialProjectId(new URLSearchParams(window.location.search).get("project_id") ?? "");
  }, []);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) { setAuthReady(true); setLoading(false); setError("Supabase is not configured."); return; }
    let active = true;
    client.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setAuthReady(true); } });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => { if (active) setSession(next); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    if (!session?.access_token) throw new Error("Please sign in to continue.");
    const response = await fetch(path, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, ...(init.headers ?? {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "The request could not be completed.");
    return body.data;
  }, [session]);

  const load = useCallback(async (selectedId: string) => {
    if (!session) return;
    setLoading(true); setError("");
    try {
      const nextProjects: Project[] = await request("/api/research/projects");
      setProjects(nextProjects ?? []);
      const validId = selectedId && nextProjects?.some((p) => p.id === selectedId) ? selectedId : (nextProjects?.[0]?.id ?? "");
      setProjectId(validId);
      const nextDatasets: Dataset[] = validId ? await request(`/api/research/datasets?project_id=${encodeURIComponent(validId)}`) : [];
      setDatasets(nextDatasets ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load datasets."); }
    finally { setLoading(false); }
  }, [request, session]);

  useEffect(() => { if (session) void load(initialProjectId); else if (authReady) setLoading(false); }, [session, authReady, initialProjectId, load]);

  async function registerDataset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const rawCount = String(form.get("record_count") ?? "").trim();
    try {
      const created: Dataset = await request("/api/research/datasets", {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          name: form.get("name"),
          description: form.get("description"),
          modality: form.get("modality"),
          source_type: form.get("source_type"),
          consent_basis: form.get("consent_basis"),
          license: form.get("license"),
          record_count: rawCount ? Number(rawCount) : null,
        }),
      });
      setDatasets((current) => [created, ...current.filter((d) => d.id !== created.id)]);
      formElement.reset();
      setNotice("Dataset metadata registered. This does not upload files or authorize data sharing.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not register dataset."); }
    finally { setSaving(false); }
  }

  if (!authReady || loading) return <main className="min-h-screen bg-[#f7f9fc] p-8 text-sm text-slate-500">Loading dataset workspace…</main>;
  if (!session) return <main className="min-h-screen bg-[#f7f9fc] p-8"><div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8"><h1 className="text-xl font-semibold">Sign in required</h1><p className="mt-2 text-sm text-slate-600">Sign in to access governed dataset metadata.</p><Link className="mt-5 inline-flex rounded-xl bg-[#233b67] px-4 py-2.5 text-sm font-semibold text-white" href="/">Return to overview</Link></div></main>;

  return <main className="min-h-screen bg-[#f7f9fc] px-4 py-8 text-slate-900 sm:px-8"><SiteNavigation currentPath="/datasets" /><div className="mx-auto max-w-6xl">
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← JinoX workspace</Link><p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-teal-700">Data operations</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172b4d]">Dataset workspace</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Register and review dataset metadata. Source files must use a separately authorized private intake workflow.</p></div><Link href="/projects" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Manage projects →</Link></header>
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{notice && <p role="status" className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">{notice}</p>}
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5"><label className="block max-w-lg text-sm font-medium">Active project<select value={projectId} onChange={(event) => { setProjectId(event.target.value); void load(event.target.value); }} className={inputClass}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{projects.length === 0 && <p className="mt-3 text-sm text-slate-500">Create a project before registering a dataset.</p>}</section>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Registered datasets</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{datasets.length} datasets</span></div>
        {datasets.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center"><h3 className="font-semibold">No datasets in this project</h3><p className="mt-2 text-sm text-slate-500">Register metadata to begin the intake workflow.</p></div> : <ul className="mt-4 divide-y divide-slate-100">{datasets.map((d) => <li key={d.id} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{d.name}</h3><p className="mt-1 text-xs capitalize text-slate-500">{d.modality.replaceAll("_", " ")} · {d.source_type.replaceAll("_", " ")}</p>{d.description && <p className="mt-2 text-sm leading-6 text-slate-600">{d.description}</p>}</div><span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">{d.status.replaceAll("_", " ")}</span></div><p className="mt-2 text-xs text-slate-500">Authorization: {d.consent_basis.replaceAll("_", " ")} · Records: {d.record_count ?? "Not estimated"}</p></li>)}</ul>}
      </section>
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">Register dataset</h2><p className="mt-1 text-sm leading-5 text-slate-500">Do not enter patient names, direct identifiers or clinical notes in metadata fields.</p>
        <form className="mt-5 space-y-3.5" onSubmit={registerDataset}>
          <label className="block text-sm font-medium">Dataset name<input name="name" required minLength={2} maxLength={160} className={inputClass} placeholder="e.g. Panoramic radiograph cohort" /></label>
          <label className="block text-sm font-medium">Modality<select name="modality" className={inputClass}>{modalities.map((m) => <option key={m} value={m}>{m.replaceAll("_", " ")}</option>)}</select></label>
          <label className="block text-sm font-medium">Source type<select name="source_type" className={inputClass}><option value="research_collection">Research collection</option><option value="public_dataset">Public dataset</option><option value="synthetic">Synthetic data</option><option value="retrospective">Retrospective</option><option value="other">Other</option></select></label>
          <label className="block text-sm font-medium">Consent / rights basis<select name="consent_basis" className={inputClass}><option value="pending_review">Pending review</option><option value="informed_consent">Informed consent</option><option value="ethics_waiver">Ethics waiver</option><option value="public_licensed">Publicly licensed</option><option value="synthetic_data">Synthetic data</option></select></label>
          <label className="block text-sm font-medium">Description<textarea name="description" rows={3} maxLength={5000} className={inputClass} placeholder="Scope and inclusion criteria; no patient identifiers" /></label>
          <label className="block text-sm font-medium">License / rights reference<input name="license" maxLength={300} className={inputClass} placeholder="Optional, if established" /></label>
          <label className="block text-sm font-medium">Estimated record count<input name="record_count" type="number" min={0} step={1} className={inputClass} placeholder="Leave blank if unknown" /></label>
          <button disabled={saving || !projectId} className="w-full rounded-xl bg-[#233b67] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1a2e50] disabled:opacity-60">{saving ? "Registering…" : "Register metadata"}</button>
        </form>
      </aside>
    </div>
    <p className="mt-6 text-xs leading-5 text-slate-500">A “metadata only” status does not mean data has been uploaded, validated, ethically approved, or released. Those steps require separate evidence and review.</p>
  </div></main>;
}
