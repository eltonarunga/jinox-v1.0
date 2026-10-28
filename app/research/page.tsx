"use client";

import { type ReactNode, FormEvent, useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";

type Project = { id: string; name: string; description: string; research_area: string; status: string; created_at: string };
type Dataset = { id: string; project_id: string; name: string; modality: string; source_type: string; consent_basis: string; record_count: number | null; status: string; created_at: string };
type Experiment = { id: string; project_id: string; name: string; hypothesis: string; method: string; model_version: string | null; status: string; created_at: string };
type Consent = { id: string; project_id: string; participant_code: string; consent_status: string; consent_version: string; language: string; created_at: string };
type Tab = "overview" | "datasets" | "experiments" | "consents";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = url && anonKey ? createBrowserClient(url, anonKey) : null;
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
const areas = ["oral_health", "environmental_health", "genomics", "imaging", "digital_twin", "multimodal", "other"];
const modalities = ["environmental", "panoramic_xray", "periapical_xray", "bitewing_xray", "cbct", "intraoral_photo", "clinical_text", "genomic", "other"];
const field = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-black focus:ring-4 focus:ring-slate-900/10";
const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50";
const panel = "rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]";

function Glyph({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></>,
    flask: <><path d="M9 3h6M10 3v6l-5.5 9.1A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.9L14 9V3" /><path d="M8 15h8" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6z" /><path d="m9 12 2 2 4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    refresh: <><path d="M20 7v5h-5" /><path d="M4.5 16.5A8 8 0 0 0 18.7 18L20 12M4 17v-5h5" /><path d="M5.3 6A8 8 0 0 1 19.5 7.5" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  };
  return <svg {...common}>{paths[name] ?? paths.grid}</svg>;
}

export default function ResearchWorkspacePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
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
    if (!session?.access_token) throw new Error("Your session has expired. Please sign in again.");
    const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, ...(init.headers ?? {}) }, cache: "no-store" });
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
          request(`/api/research/governance/consents?project_id=${encodeURIComponent(currentId)}`),
        ]);
        setDatasets(d ?? []); setExperiments(e ?? []); setConsents(c ?? []);
      } else { setDatasets([]); setExperiments([]); setConsents([]); }
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load workspace."); }
  }, [request, selectedProject, session]);

  useEffect(() => { if (session) void refresh(); }, [session, refresh]);

  async function signInWithGoogle() {
    setAuthBusy(true);
    setError("");
    try {
      if (!supabase) throw new Error("Google sign-in is not configured. Please contact the workspace administrator.");
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/research");
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: { access_type: "offline", prompt: "select_account" },
        },
      });
      if (authError) throw authError;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start Google sign-in. Please try again.");
      setAuthBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
    else { setProjects([]); setDatasets([]); setExperiments([]); setConsents([]); setSelectedProject(""); setNotice(""); setError(""); }
  }

  async function submitForm(event: FormEvent<HTMLFormElement>, path: string, buildBody: (form: FormData) => Record<string, unknown>, success: string, preferNewProject = false) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const result = await request(path, { method: "POST", body: JSON.stringify(buildBody(form)) });
      setNotice(success); formElement.reset();
      await refresh(preferNewProject && result?.id ? result.id : undefined);
    } catch (e) { setError(e instanceof Error ? e.message : "Request failed."); }
    finally { setBusy(false); }
  }

  const nav: { id: Tab; title: string; description: string; icon: string }[] = [
    { id: "overview", title: "Overview", description: "Projects & activity", icon: "grid" },
    { id: "datasets", title: "Datasets", description: "Research data registry", icon: "database" },
    { id: "experiments", title: "Experiments", description: "Methods & hypotheses", icon: "flask" },
    { id: "consents", title: "Governance", description: "Consent metadata", icon: "shield" },
  ];

  if (!authReady) return <main className="grid min-h-screen place-items-center bg-[#f7f7f7] text-sm text-slate-500"><div className="flex items-center gap-3"><span className="h-2 w-2 animate-pulse rounded-full bg-black" />Loading research workspace</div></main>;

  if (!session) return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f7f7] px-4 py-10"><div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" /><div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-slate-100 blur-3xl" /><div className="relative w-full max-w-[420px] rounded-3xl border border-white bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur"><Brand /><div className="mb-7 mt-9"><p className="text-sm font-medium text-slate-900">Research infrastructure</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Sign in to JinoX AI</h1><p className="mt-2 text-sm leading-6 text-slate-500">Use your Google account to access your secure research workspace. Only Google sign-in is available.</p></div>{!supabase && <p role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Google sign-in is not configured. Please contact the workspace administrator.</p>}{error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button type="button" onClick={signInWithGoogle} disabled={authBusy || !supabase} className={`${button} mt-2 w-full`}><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.92 3.27-4.74 3.27-8.1Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.87A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.02H2.15A11 11 0 0 0 1 12c0 1.78.43 3.47 1.15 4.98l3.69-2.87Z"/><path fill="#EA4335" d="M12 5.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97 0 12 0A11 11 0 0 0 2.15 7.02l3.69 2.87C6.71 7.29 9.14 5.36 12 5.36Z"/></svg>{authBusy ? "Redirecting to Google…" : "Continue with Google"}<Glyph name="arrow" size={16} /></button><div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500"><Glyph name="lock" size={14} />Protected by Supabase authentication and access policies</div><p className="mt-8 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-400">Access is subject to research governance policies. Prototype outputs are not validated clinical advice.</p></div></main>

  return <main className="min-h-screen bg-[#f7f7f7] text-slate-900 antialiased">
    <div className="mx-auto flex min-h-screen max-w-[1600px]">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-6 lg:flex">
        <Brand />
        <Link href="/clinical" className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"><span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-900 shadow-sm"><Glyph name="grid" size={17} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800">Clinical workspace</span><span className="mt-0.5 block text-[11px] text-slate-500">Screening, diagnostics & GIS</span></span><Glyph name="arrow" size={15} /></Link>
        <div className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</div>
        <nav className="space-y-1" aria-label="Research sections">{nav.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${tab === item.id ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><span className={`grid h-9 w-9 place-items-center rounded-lg ${tab === item.id ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-400 group-hover:text-slate-700"}`}><Glyph name={item.icon} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className={`mt-0.5 block text-[11px] ${tab === item.id ? "text-slate-500" : "text-slate-400"}`}>{item.description}</span></span>{tab === item.id && <span className="h-1.5 w-1.5 rounded-full bg-black" />}</button>)}</nav>
        <div className="mt-auto"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-slate-900 shadow-sm"><Glyph name="shield" size={15} /></span>Private by design</div><p className="mt-2 text-[11px] leading-5 text-slate-500">Project access is enforced by database-level row security.</p></div><div className="mt-4 flex items-center gap-3 px-2"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black text-xs font-bold text-white">{(session.user.email?.[0] ?? "R").toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{session.user.email}</p><p className="mt-0.5 text-[11px] text-slate-400">Research account</p></div><button onClick={signOut} aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"><Glyph name="logout" size={16} /></button></div></div>
      </aside>

      <section className="min-w-0 flex-1 px-4 py-5 sm:px-7 sm:py-7 lg:px-10 lg:py-9">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div><div className="flex items-center gap-2 text-xs font-medium text-slate-400"><span>Workspace</span><Glyph name="chevron" size={13} /><span className="text-slate-600">{nav.find((n) => n.id === tab)?.title}</span></div><h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[30px]">{tab === "overview" ? "Good to see you." : nav.find((n) => n.id === tab)?.title}</h1><p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">{tab === "overview" ? "Your research projects, datasets, and study activity in one place." : nav.find((n) => n.id === tab)?.description + " for your selected research project."}</p></div>
          <div className="flex items-center gap-2"><span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Workspace connected</span><button onClick={() => void refresh()} className={secondaryButton} title="Refresh workspace"><Glyph name="refresh" size={15} /><span className="hidden sm:inline">Refresh</span></button><button onClick={signOut} className={`${secondaryButton} lg:hidden`}><Glyph name="logout" size={15} /></button></div>
        </header>

        <nav className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden" aria-label="Research sections">{nav.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${tab === item.id ? "border-slate-300 bg-black text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}><Glyph name={item.icon} size={16} />{item.title}</button>)}</nav>

        {error && <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"><span className="mt-0.5 font-bold">!</span><div className="flex-1">{error}</div><button onClick={() => setError("")} className="text-red-600 hover:text-red-900" aria-label="Dismiss error">×</button></div>}
        {notice && <div role="status" className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-900"><span className="font-bold">✓</span><div className="flex-1">{notice}</div><button onClick={() => setNotice("")} className="text-emerald-700 hover:text-emerald-950" aria-label="Dismiss message">×</button></div>}

        <div className="mt-6 flex flex-wrap items-center gap-3"><label htmlFor="project-select" className="text-xs font-semibold uppercase tracking-[.12em] text-slate-500">Active project</label><div className="relative"><select id="project-select" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="min-w-[240px] appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-black focus:ring-4 focus:ring-slate-900/10" disabled={!projects.length}><option value="">Select a project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Glyph name="chevron" size={14} /></span></div>{selectedProject && <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-500">{label(projects.find((p) => p.id === selectedProject)?.research_area ?? "project")}</span>}</div>

        {tab === "overview" && <div className="mt-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-3"><Metric title="Research projects" value={projects.length} icon="grid" detail="Accessible to you" /><Metric title="Dataset records" value={datasets.length} icon="database" detail="In active project" /><Metric title="Experiments" value={experiments.length} icon="flask" detail="Logged in active project" /></div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
            <section className={`${panel} p-5 sm:p-6`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-900">Your workspace</p><h2 className="mt-1.5 text-lg font-semibold tracking-tight">Research projects</h2><p className="mt-1 text-sm text-slate-500">Manage the workspaces you have access to.</p></div><span className="rounded-xl bg-slate-100 p-2.5 text-slate-900"><Glyph name="grid" /></span></div>
              {projects.length === 0 ? <Empty title="Start with a project" body="Create a research project to organise datasets, experiments, and governance metadata." /> : <div className="mt-5 divide-y divide-slate-100">{projects.map((p) => <button key={p.id} onClick={() => { setSelectedProject(p.id); setTab("datasets"); }} className={`group flex w-full items-center gap-3 rounded-xl px-2 py-4 text-left transition hover:bg-slate-50 ${selectedProject === p.id ? "bg-slate-100" : ""}`}><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-900"><Glyph name="grid" size={17} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-slate-800">{p.name}</p><Status value={p.status} /></div><p className="mt-1 truncate text-xs text-slate-500">{p.description || label(p.research_area)}</p></div><Glyph name="chevron" size={17} /></button>)}</div>}
              <div className="mt-4 border-t border-slate-100 pt-4"><details className="group"><summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-100"><span className="flex items-center gap-2"><Glyph name="plus" size={17} />Create a project</span><span className="text-slate-400 transition group-open:rotate-90"><Glyph name="chevron" size={16} /></span></summary><form onSubmit={(e) => submitForm(e, "/api/research/projects", (f) => ({ name: f.get("name"), description: f.get("description"), research_area: f.get("research_area") }), "Research project created.", true)} className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4"><Field label="Project name"><input name="name" required minLength={3} maxLength={160} placeholder="e.g. Kenya oral health pilot" className={field} /></Field><Field label="Description"><textarea name="description" maxLength={5000} rows={2} placeholder="What is this research exploring?" className={field} /></Field><Field label="Research area"><select name="research_area" className={field}>{areas.map((v) => <option key={v} value={v}>{label(v)}</option>)}</select></Field><button disabled={busy} className={button}>{busy ? "Creating…" : "Create project"}</button></form></details></div>
            </section>
            <section className={`${panel} p-5 sm:p-6`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-900">Research operations</p><h2 className="mt-1.5 text-lg font-semibold tracking-tight">Quick actions</h2><p className="mt-1 text-sm text-slate-500">Jump into your research workflow.</p></div><span className="rounded-xl bg-slate-100 p-2.5 text-slate-700"><Glyph name="arrow" /></span></div><div className="mt-5 space-y-2">{[{ id: "datasets" as Tab, icon: "database", title: "Register a dataset", text: "Add source and modality metadata" }, { id: "experiments" as Tab, icon: "flask", title: "Log an experiment", text: "Document hypothesis and methods" }, { id: "consents" as Tab, icon: "shield", title: "Review governance", text: "Record participant consent metadata" }].map((item) => <button key={item.id} onClick={() => setTab(item.id)} className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3.5 text-left transition hover:border-slate-300 hover:bg-slate-100"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-600 transition group-hover:bg-white group-hover:text-slate-900"><Glyph name={item.icon} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{item.title}</span><span className="mt-1 block text-xs text-slate-500">{item.text}</span></span><Glyph name="chevron" size={16} /></button>)}</div><div className="mt-5 rounded-xl border border-slate-200 bg-slate-100 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Glyph name="lock" size={16} />Data access is scoped</div><p className="mt-1.5 text-xs leading-5 text-slate-700">Project membership and role permissions are enforced by Supabase Row Level Security.</p></div></section>
          </div>
        </div>}

        {tab === "datasets" && <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(320px,.8fr)_minmax(0,1.2fr)]"><section className={`${panel} p-5 sm:p-6`}><SectionHeading eyebrow="Data registry" title="Register dataset metadata" description="Describe a research dataset. This form does not upload files." />{!selectedProject ? <Empty title="Choose a project first" body="Select or create a project before registering dataset metadata." /> : <form onSubmit={(e) => submitForm(e, "/api/research/datasets", (f) => ({ project_id: selectedProject, name: f.get("name"), description: f.get("description"), modality: f.get("modality"), source_type: f.get("source_type"), consent_basis: f.get("consent_basis"), license: f.get("license") || null, record_count: String(f.get("record_count") ?? "").trim() ? Number(f.get("record_count")) : null }), "Dataset metadata registered. No files were uploaded.")} className="mt-5 space-y-4"><Field label="Dataset name"><input name="name" required minLength={2} maxLength={160} placeholder="e.g. County water-quality observations" className={field} /></Field><Field label="Description"><textarea name="description" maxLength={5000} rows={3} placeholder="Describe the scope and provenance" className={field} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Modality"><select name="modality" className={field}>{modalities.map((v) => <option key={v} value={v}>{label(v)}</option>)}</select></Field><Field label="Source type"><select name="source_type" className={field}>{["research_collection","public_dataset","synthetic","retrospective","other"].map((v) => <option key={v} value={v}>{label(v)}</option>)}</select></Field></div><Field label="Consent / legal basis"><select name="consent_basis" className={field}>{[["pending_review","Pending review"],["informed_consent","Informed consent"],["ethics_waiver","Ethics waiver"],["public_licensed","Public / licensed"],["synthetic_data","Synthetic data"]].map(([v,t]) => <option key={v} value={v}>{t}</option>)}</select></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Record count (optional)"><input name="record_count" type="number" min="0" step="1" placeholder="Leave blank if unknown" className={field} /></Field><Field label="Licence (optional)"><input name="license" maxLength={300} placeholder="e.g. CC BY 4.0" className={field} /></Field></div><button disabled={busy} className={button}>{busy ? "Saving…" : <><Glyph name="plus" size={16} />Register metadata</>}</button></form>}</section><section className={`${panel} min-w-0 p-5 sm:p-6`}><div className="flex items-start justify-between gap-3"><SectionHeading eyebrow="Project inventory" title="Registered datasets" description="Dataset metadata associated with the active project." /><Count value={datasets.length} /></div>{datasets.length === 0 ? <Empty title="Nothing registered yet" body="When you add dataset metadata, it will appear in this inventory." /> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400"><th className="pb-3 pr-4">Dataset</th><th className="pb-3 pr-4">Modality</th><th className="pb-3 pr-4">Records</th><th className="pb-3">Status</th></tr></thead><tbody>{datasets.map((d) => <tr key={d.id} className="border-b border-slate-100 last:border-0"><td className="py-4 pr-4"><p className="font-semibold text-slate-800">{d.name}</p><p className="mt-1 text-xs text-slate-400">{label(d.source_type)}</p></td><td className="py-4 pr-4 text-slate-600">{label(d.modality)}</td><td className="py-4 pr-4 tabular-nums text-slate-600">{d.record_count?.toLocaleString() ?? "—"}</td><td className="py-4"><Status value={d.status} /></td></tr>)}</tbody></table></div>}</section></div>}

        {tab === "experiments" && <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(320px,.8fr)_minmax(0,1.2fr)]"><section className={`${panel} p-5 sm:p-6`}><SectionHeading eyebrow="Study log" title="Record an experiment" description="Document the plan and method; no model is executed here." />{!selectedProject ? <Empty title="Choose a project first" body="Select a project before adding an experiment." /> : <form onSubmit={(e) => submitForm(e, "/api/research/experiments", (f) => ({ project_id: selectedProject, name: f.get("name"), hypothesis: f.get("hypothesis"), method: f.get("method"), model_version: f.get("model_version") || null, status: f.get("status"), metrics: {} }), "Experiment record created.")} className="mt-5 space-y-4"><Field label="Experiment name"><input name="name" required minLength={3} maxLength={160} placeholder="e.g. Baseline data-quality audit" className={field} /></Field><Field label="Hypothesis"><textarea name="hypothesis" maxLength={10000} rows={3} placeholder="What are you testing?" className={field} /></Field><Field label="Method"><textarea name="method" maxLength={10000} rows={4} placeholder="Outline the planned approach" className={field} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Model version (optional)"><input name="model_version" maxLength={160} placeholder="e.g. baseline-v0.1" className={field} /></Field><Field label="Status"><select name="status" className={field}>{["planned","running","completed","failed","cancelled"].map((v) => <option key={v} value={v}>{label(v)}</option>)}</select></Field></div><button disabled={busy} className={button}>{busy ? "Saving…" : "Save experiment"}</button></form>}</section><section className={`${panel} p-5 sm:p-6`}><div className="flex items-start justify-between gap-3"><SectionHeading eyebrow="Experiment history" title="Experiment log" description="Study plans recorded in the active project." /><Count value={experiments.length} /></div>{experiments.length === 0 ? <Empty title="No experiments yet" body="Your planned and completed experiment records will appear here." /> : <div className="mt-5 space-y-3">{experiments.map((e) => <article key={e.id} className="rounded-xl border border-slate-200/80 p-4 transition hover:border-slate-300"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold text-slate-800">{e.name}</h3><p className="mt-1 text-xs text-slate-400">{new Date(e.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}{e.model_version ? ` · ${e.model_version}` : ""}</p></div><Status value={e.status} /></div>{e.hypothesis && <p className="mt-4 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-700">Hypothesis</span><br />{e.hypothesis}</p>}{e.method && <p className="mt-3 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-700">Method</span><br />{e.method}</p>}</article>)}</div>}</section></div>}

        {tab === "consents" && <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(320px,.8fr)_minmax(0,1.2fr)]"><section className={`${panel} p-5 sm:p-6`}><SectionHeading eyebrow="Research governance" title="Consent metadata" description="Record consent status against a pseudonymous participant code." /><div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs leading-5 text-amber-900">Do not enter names, phone numbers, national IDs, or signed consent documents. This register is not a replacement for the approved consent process.</div>{!selectedProject ? <Empty title="Choose a project first" body="Select a project before recording consent metadata." /> : <form onSubmit={(e) => submitForm(e, "/api/research/governance/consents", (f) => ({ project_id: selectedProject, participant_code: f.get("participant_code"), consent_version: f.get("consent_version"), consent_status: f.get("consent_status"), language: f.get("language"), ...(f.get("consent_status") === "granted" ? { consented_at: new Date().toISOString() } : {}) }), "Consent metadata saved. This does not replace signed consent documentation.")} className="mt-5 space-y-4"><Field label="Pseudonymous participant code"><input name="participant_code" required pattern="[A-Za-z0-9_-]{3,80}" maxLength={80} placeholder="e.g. KEN-P001" className={field} /></Field><Field label="Consent document version"><input name="consent_version" required maxLength={80} placeholder="e.g. v1.0-sw" className={field} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Consent status"><select name="consent_status" className={field}><option value="pending">Pending</option><option value="granted">Granted</option><option value="not_required">Not required (approved basis)</option><option value="withdrawn">Withdrawn</option></select></Field><Field label="Language"><select name="language" className={field}><option value="en">English</option><option value="sw">Kiswahili</option><option value="other">Other</option></select></Field></div><button disabled={busy} className={button}>{busy ? "Saving…" : "Save consent metadata"}</button></form>}</section><section className={`${panel} min-w-0 p-5 sm:p-6`}><div className="flex items-start justify-between gap-3"><SectionHeading eyebrow="Governance register" title="Participant records" description="Visible to project owners and principal investigators." /><Count value={consents.length} /></div>{consents.length === 0 ? <Empty title="No consent records" body="Consent metadata visible to your account will appear here." /> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400"><th className="pb-3 pr-4">Participant code</th><th className="pb-3 pr-4">Version</th><th className="pb-3 pr-4">Language</th><th className="pb-3">Status</th></tr></thead><tbody>{consents.map((c) => <tr key={c.id} className="border-b border-slate-100 last:border-0"><td className="py-4 pr-4 font-semibold text-slate-800">{c.participant_code}</td><td className="py-4 pr-4 text-slate-600">{c.consent_version}</td><td className="py-4 pr-4 text-slate-600">{label(c.language)}</td><td className="py-4"><Status value={c.consent_status} /></td></tr>)}</tbody></table></div>}</section></div>}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-5 text-xs text-slate-400"><span>JinoX AI · Research infrastructure</span><span className="inline-flex items-center gap-1.5"><Glyph name="lock" size={13} />Project-scoped access controls</span></footer>
      </section>
    </div>
  </main>;
}

function Brand() { return <Link href="/" aria-label="JinoX AI clinical workspace" className="group inline-flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-4"><span className="inline-flex shrink-0 items-center rounded-md bg-black px-3.5 py-2.5 text-white shadow-sm ring-1 ring-black/5"><span className="whitespace-nowrap text-[15px] font-bold tracking-[-.055em]">JinoX AI</span></span><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">Research workspace</span></Link>; }
function Metric({ title, value, icon, detail }: { title: string; value: number; icon: string; detail: string }) { return <div className={`${panel} p-4 sm:p-5`}><div className="flex items-start justify-between gap-3"><p className="text-xs font-medium text-slate-500">{title}</p><span className="rounded-lg bg-slate-50 p-2 text-slate-500"><Glyph name={icon} size={16} /></span></div><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">{value.toLocaleString()}</p><p className="mt-1.5 text-xs text-slate-400">{detail}</p></div>; }
function Field({ label: title, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700">{title}{children}</label>; }
function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-900">{eyebrow}</p><h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950">{title}</h2><p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p></div>; }
function Count({ value }: { value: number }) { return <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold tabular-nums text-slate-600">{value}</span>; }
function Status({ value }: { value: string }) { const tone = ["active", "granted", "completed", "approved"].includes(value) ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15" : ["withdrawn", "failed", "archived", "restricted"].includes(value) ? "bg-rose-50 text-rose-700 ring-rose-600/15" : ["running"].includes(value) ? "bg-sky-50 text-sky-700 ring-sky-600/15" : "bg-slate-100 text-slate-600 ring-slate-500/10"; return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${tone}`}>{label(value)}</span>; }
function Empty({ title, body }: { title: string; body: string }) { return <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-9 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-400 shadow-sm"><Glyph name="grid" size={18} /></span><p className="mt-3 text-sm font-semibold text-slate-800">{title}</p><p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">{body}</p></div>; }
