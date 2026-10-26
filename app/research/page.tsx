"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";

type Project = { id: string; name: string; description: string; research_area: string; status: string; created_at: string };
type Dataset = { id: string; project_id: string; name: string; modality: string; source_type: string; consent_basis: string; record_count: number | null; status: string; created_at: string };
type Experiment = { id: string; project_id: string; name: string; hypothesis: string; method: string; model_version: string | null; status: string; created_at: string };
type Consent = { id: string; project_id: string; participant_code: string; consent_status: string; consent_version: string; language: string; created_at: string };
type Tab = "overview" | "datasets" | "experiments" | "consents";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = url && anonKey ? createClient(url, anonKey) : null;
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function ResearchWorkspacePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    if (!session?.access_token) throw new Error("Please sign in again.");
    const response = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, ...(init.headers ?? {}) },
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : `Request failed (${response.status}).`);
    return body.data;
  }, [session]);

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) { setSession(data.session); setAuthReady(true); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const refresh = useCallback(async (preferredId?: string) => {
    if (!session) return;
    setError("");
    try {
      const p: Project[] = await request("/api/research/projects");
      setProjects(p ?? []);
      const currentId = (preferredId && p?.some((item) => item.id === preferredId) ? preferredId : null)
        ?? (selectedProject && p?.some((item) => item.id === selectedProject) ? selectedProject : null)
        ?? p?.[0]?.id ?? "";
      setSelectedProject(currentId);
      if (currentId) {
        const [d, e, c] = await Promise.all([
          request(`/api/research/datasets?project_id=${encodeURIComponent(currentId)}`),
          request(`/api/research/experiments?project_id=${encodeURIComponent(currentId)}`),
          request(`/api/research/governance/consents?project_id=${encodeURIComponent(currentId)}`).catch(() => []),
        ]);
        setDatasets(d ?? []); setExperiments(e ?? []); setConsents(c ?? []);
      } else { setDatasets([]); setExperiments([]); setConsents([]); }
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load workspace."); }
  }, [request, selectedProject, session]);

  useEffect(() => { if (session) void refresh(); }, [session, refresh]);

  async function signIn(event: FormEvent) {
    event.preventDefault(); setAuthBusy(true); setError("");
    try {
      if (!supabase) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      setPassword(""); setNotice("Signed in successfully.");
    } catch (e) { setError(e instanceof Error ? e.message : "Sign-in failed."); }
    finally { setAuthBusy(false); }
  }

  async function signOut() {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
    else { setProjects([]); setDatasets([]); setExperiments([]); setConsents([]); setSelectedProject(""); setNotice(""); }
  }

  async function submitForm(event: FormEvent<HTMLFormElement>, path: string, buildBody: (form: FormData) => Record<string, unknown>, success: string, preferNewProject = false) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const result = await request(path, { method: "POST", body: JSON.stringify(buildBody(form)) });
      setNotice(success);
      formElement.reset();
      await refresh(preferNewProject && result?.id ? result.id : undefined);
    } catch (e) { setError(e instanceof Error ? e.message : "Request failed."); }
    finally { setBusy(false); }
  }

  const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";
  const btn = "inline-flex items-center justify-center rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50";
  const panel = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

  if (!authReady) return <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-600">Loading JinoX Research Workspace…</main>;
  if (!session) return <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><div className="mb-6 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-900 text-lg font-black text-white">JX</div><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-teal-800">JinoX AI</p><h1 className="text-2xl font-bold text-slate-900">Research workspace</h1></div></div><p className="mb-6 text-sm leading-6 text-slate-600">Sign in with your existing Supabase Auth account to manage project-scoped research metadata.</p>{!supabase && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Configure the public Supabase URL and anon key in your environment.</p>}{error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<form onSubmit={signIn} className="space-y-4"><label className="block text-sm font-medium text-slate-700">Email<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} /></label><label className="block text-sm font-medium text-slate-700">Password<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} /></label><button disabled={authBusy || !supabase} className={`${btn} w-full`}>{authBusy ? "Signing in…" : "Sign in"}</button></form><p className="mt-5 text-xs leading-5 text-slate-500">Access is enforced by Supabase Row Level Security. This page does not create accounts.</p></div></main>;

  const nav: { id: Tab; title: string }[] = [{ id: "overview", title: "Projects" }, { id: "datasets", title: "Datasets" }, { id: "experiments", title: "Experiments" }, { id: "consents", title: "Consent register" }];

  return <main className="min-h-screen bg-slate-50 text-slate-900"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><header className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-900 font-black text-white">JX</div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-800">JinoX AI</p><h1 className="text-2xl font-bold sm:text-3xl">Research workspace</h1><p className="mt-1 text-sm text-slate-500">Secure project metadata and research governance</p></div></div><div className="flex items-center gap-3"><span className="hidden text-sm text-slate-500 sm:inline">{session.user.email}</span><button onClick={signOut} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-100">Sign out</button></div></header>
  <div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric title="Projects" value={projects.length} /><Metric title="Dataset records" value={datasets.length} /><Metric title="Experiment records" value={experiments.length} /></div>
  {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}{notice && <div role="status" className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">{notice}</div>}
  <div className="mt-7 flex flex-wrap gap-2 border-b border-slate-200 pb-3">{nav.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === item.id ? "bg-teal-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>{item.title}</button>)}</div>
  <div className="mt-6 flex flex-wrap items-center gap-3"><label className="text-sm font-semibold text-slate-700" htmlFor="project-select">Active project</label><select id="project-select" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="min-w-64 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" disabled={!projects.length}><option value="">Select a project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><button onClick={() => void refresh()} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-100">Refresh</button></div>

  {tab === "overview" && <div className="mt-5 grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><section className={panel}><h2 className="text-lg font-bold">Create a research project</h2><p className="mb-5 mt-1 text-sm text-slate-500">The signed-in user becomes project owner.</p><form onSubmit={(e) => submitForm(e, "/api/research/projects", (f) => ({ name: f.get("name"), description: f.get("description"), research_area: f.get("research_area") }), "Research project created.", true)} className="space-y-3"><label className="block text-sm font-medium">Project name<input name="name" required minLength={3} maxLength={160} className={field} /></label><label className="block text-sm font-medium">Description<textarea name="description" maxLength={5000} rows={3} className={field} /></label><label className="block text-sm font-medium">Research area<select name="research_area" className={field}>{["oral_health","environmental_health","genomics","imaging","digital_twin","multimodal","other"].map((v) => <option key={v} value={v}>{label(v)}</option>)}</select></label><button disabled={busy} className={btn}>{busy ? "Saving…" : "Create project"}</button></form></section><section className={panel}><h2 className="mb-4 text-lg font-bold">Your projects</h2>{projects.length === 0 ? <Empty title="No projects yet" body="Create a project to start organising dataset metadata, experiment plans, and consent metadata." /> : <div className="space-y-3">{projects.map((p) => <button key={p.id} onClick={() => { setSelectedProject(p.id); setTab("datasets"); }} className={`block w-full rounded-xl border p-4 text-left transition hover:border-teal-400 ${selectedProject === p.id ? "border-teal-400 bg-teal-50/50" : "border-slate-200"}`}><div className="flex items-start justify-between gap-3"><span className="font-semibold">{p.name}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{label(p.status)}</span></div><p className="mt-1 text-sm text-slate-500">{p.description || "No description provided."}</p><p className="mt-3 text-xs uppercase tracking-wide text-teal-800">{label(p.research_area)}</p></button>)}</div>}</section></div>}

  {tab === "datasets" && <div className="mt-5 grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><section className={panel}><h2 className="text-lg font-bold">Register dataset metadata</h2><p className="mb-5 mt-1 text-sm text-slate-500">No file is uploaded by this form. Confirm source, licence, and consent basis before registration.</p>{!selectedProject ? <Empty title="Choose a project" body="Select or create a project before adding dataset metadata." /> : <form onSubmit={(e) => submitForm(e, "/api/research/datasets", (f) => ({ project_id: selectedProject, name: f.get("name"), description: f.get("description"), modality: f.get("modality"), source_type: f.get("source_type"), consent_basis: f.get("consent_basis"), license: f.get("license") || null, record_count: String(f.get("record_count") ?? "").trim() ? Number(f.get("record_count")) : null }), "Dataset metadata registered. No files were uploaded.")} className="space-y-3"><label className="block text-sm font-medium">Dataset name<input name="name" required minLength={2} maxLength={160} className={field} /></label><label className="block text-sm font-medium">Description<textarea name="description" maxLength={5000} rows={2} className={field} /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">Modality<select name="modality" className={field}>{["environmental","panoramic_xray","periapical_xray","bitewing_xray","cbct","intraoral_photo","clinical_text","genomic","other"].map((v) => <option key={v} value={v}>{label(v)}</option>)}</select></label><label className="block text-sm font-medium">Source type<select name="source_type" className={field}>{["research_collection","public_dataset","synthetic","retrospective","other"].map((v) => <option key={v} value={v}>{label(v)}</option>)}</select></label></div><label className="block text-sm font-medium">Consent / legal basis<select name="consent_basis" className={field}>{[["pending_review","Pending review"],["informed_consent","Informed consent"],["ethics_waiver","Ethics waiver"],["public_licensed","Public / licensed"],["synthetic_data","Synthetic data"]].map(([v,t]) => <option key={v} value={v}>{t}</option>)}</select></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">Record count<input name="record_count" type="number" min="0" step="1" className={field} placeholder="Unknown" /></label><label className="block text-sm font-medium">Licence<input name="license" maxLength={300} className={field} placeholder="e.g. CC BY 4.0" /></label></div><button disabled={busy} className={btn}>{busy ? "Saving…" : "Register metadata"}</button></form>}</section><section className={panel}><h2 className="mb-4 text-lg font-bold">Registered datasets <span className="text-sm font-medium text-slate-400">({datasets.length})</span></h2>{datasets.length === 0 ? <Empty title="No dataset metadata" body="Registered datasets for the active project will appear here." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="py-3 pr-4">Dataset</th><th className="py-3 pr-4">Modality</th><th className="py-3 pr-4">Records</th><th className="py-3">Status</th></tr></thead><tbody>{datasets.map((d) => <tr key={d.id} className="border-b border-slate-100"><td className="py-3 pr-4 font-semibold">{d.name}<p className="mt-1 text-xs font-normal text-slate-400">{label(d.source_type)}</p></td><td className="py-3 pr-4">{label(d.modality)}</td><td className="py-3 pr-4">{d.record_count ?? "—"}</td><td className="py-3">{label(d.status)}</td></tr>)}</tbody></table></div>}</section></div>}

  {tab === "experiments" && <div className="mt-5 grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><section className={panel}><h2 className="text-lg font-bold">Register experiment</h2><p className="mb-5 mt-1 text-sm text-slate-500">This records the hypothesis and method. It does not run a model or calculate scientific metrics.</p>{!selectedProject ? <Empty title="Choose a project" body="Select a project before registering an experiment." /> : <form onSubmit={(e) => submitForm(e, "/api/research/experiments", (f) => ({ project_id: selectedProject, name: f.get("name"), hypothesis: f.get("hypothesis"), method: f.get("method"), model_version: f.get("model_version") || null, status: f.get("status"), metrics: {} }), "Experiment record created.")} className="space-y-3"><label className="block text-sm font-medium">Experiment name<input name="name" required minLength={3} maxLength={160} className={field} /></label><label className="block text-sm font-medium">Hypothesis<textarea name="hypothesis" maxLength={10000} rows={2} className={field} /></label><label className="block text-sm font-medium">Method<textarea name="method" maxLength={10000} rows={3} className={field} /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">Model version<input name="model_version" maxLength={160} className={field} placeholder="Optional" /></label><label className="block text-sm font-medium">Status<select name="status" className={field}>{["planned","running","completed","failed","cancelled"].map((v) => <option key={v} value={v}>{label(v)}</option>)}</select></label></div><button disabled={busy} className={btn}>{busy ? "Saving…" : "Create experiment record"}</button></form>}</section><section className={panel}><h2 className="mb-4 text-lg font-bold">Experiment log <span className="text-sm font-medium text-slate-400">({experiments.length})</span></h2>{experiments.length === 0 ? <Empty title="No experiments recorded" body="Planned experiments will appear here." /> : <div className="space-y-3">{experiments.map((e) => <article key={e.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold">{e.name}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{label(e.status)}</span></div>{e.hypothesis && <p className="mt-2 text-sm text-slate-600"><strong>Hypothesis:</strong> {e.hypothesis}</p>}{e.method && <p className="mt-2 text-sm text-slate-600"><strong>Method:</strong> {e.method}</p>}<p className="mt-3 text-xs text-slate-400">{e.model_version ? `Model ${e.model_version} · ` : ""}{new Date(e.created_at).toLocaleDateString()}</p></article>)}</div>}</section></div>}

  {tab === "consents" && <div className="mt-5 grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><section className={panel}><h2 className="text-lg font-bold">Record consent metadata</h2><p className="mb-5 mt-1 text-sm text-slate-500">Use a pseudonymous participant code only. Never enter names, phone numbers, national IDs, or signed forms here.</p>{!selectedProject ? <Empty title="Choose a project" body="Select a project before adding consent metadata." /> : <form onSubmit={(e) => submitForm(e, "/api/research/governance/consents", (f) => ({ project_id: selectedProject, participant_code: f.get("participant_code"), consent_version: f.get("consent_version"), consent_status: f.get("consent_status"), language: f.get("language"), ...(f.get("consent_status") === "granted" ? { consented_at: new Date().toISOString() } : {}) }), "Consent metadata saved. This does not replace signed consent documentation.")} className="space-y-3"><label className="block text-sm font-medium">Pseudonymous participant code<input name="participant_code" required pattern="[A-Za-z0-9_-]{3,80}" maxLength={80} className={field} placeholder="e.g. KEN-P001" /></label><label className="block text-sm font-medium">Consent document version<input name="consent_version" required maxLength={80} className={field} placeholder="e.g. v1.0-sw" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">Status<select name="consent_status" className={field}><option value="pending">Pending</option><option value="granted">Granted</option><option value="not_required">Not required (approved basis)</option><option value="withdrawn">Withdrawn</option></select></label><label className="block text-sm font-medium">Language<select name="language" className={field}><option value="en">English</option><option value="sw">Kiswahili</option><option value="other">Other</option></select></label></div><button disabled={busy} className={btn}>{busy ? "Saving…" : "Save consent metadata"}</button></form>}</section><section className={panel}><h2 className="mb-4 text-lg font-bold">Consent register <span className="text-sm font-medium text-slate-400">({consents.length})</span></h2>{consents.length === 0 ? <Empty title="No consent metadata" body="Consent metadata visible to project owners and principal investigators will appear here." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="py-3 pr-4">Participant code</th><th className="py-3 pr-4">Version</th><th className="py-3 pr-4">Language</th><th className="py-3">Status</th></tr></thead><tbody>{consents.map((c) => <tr key={c.id} className="border-b border-slate-100"><td className="py-3 pr-4 font-semibold">{c.participant_code}</td><td className="py-3 pr-4">{c.consent_version}</td><td className="py-3 pr-4">{label(c.language)}</td><td className="py-3">{label(c.consent_status)}</td></tr>)}</tbody></table></div>}</section></div>}

  <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Research safety notice:</strong> This workspace stores research metadata only. It is not a clinical diagnostic tool, does not validate model performance, and is not a substitute for ethics approval, approved consent procedures, or private medical-data storage.</div><footer className="mt-8 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500"><span>JinoX AI · Research infrastructure MVP</span><span>Data access is governed by Supabase Row Level Security</span></footer></div></main>;
}

function Metric({ title, value }: { title: string; value: number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{title}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>; }
function Empty({ title, body }: { title: string; body: string }) { return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center"><p className="font-semibold text-slate-700">{title}</p><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">{body}</p></div>; }
