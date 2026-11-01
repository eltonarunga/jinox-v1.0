"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Project = {
  id: string;
  name: string;
  description: string;
  research_area: string;
  status: string;
  created_at: string;
};

const areas = [
  ["oral_health", "Oral health"],
  ["environmental_health", "Environmental health"],
  ["genomics", "Genomics"],
  ["imaging", "Imaging"],
  ["digital_twin", "Digital twin research"],
  ["multimodal", "Multimodal"],
  ["other", "Other"],
];
const inputClass = "mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15";

export default function ProjectsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) { setAuthReady(true); setLoading(false); setError("Supabase is not configured."); return; }
    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setAuthReady(true); }
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    if (!session?.access_token) throw new Error("Please sign in to continue.");
    const response = await fetch(path, {
      ...init,
      cache: "no-store",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, ...(init.headers ?? {}) },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "The request could not be completed.");
    return body.data;
  }, [session]);

  const loadProjects = useCallback(async () => {
    if (!session) return;
    setLoading(true); setError("");
    try { setProjects((await request("/api/research/projects")) ?? []); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load projects."); }
    finally { setLoading(false); }
  }, [request, session]);

  useEffect(() => { if (session) void loadProjects(); else if (authReady) setLoading(false); }, [session, authReady, loadProjects]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const created: Project = await request("/api/research/projects", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description"),
          research_area: form.get("research_area"),
        }),
      });
      setProjects((current) => [created, ...current.filter((p) => p.id !== created.id)]);
      formElement.reset();
      setNotice("Project created. Governance and access requirements should be completed before data intake.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create project."); }
    finally { setSaving(false); }
  }

  if (!authReady || loading) return <main className="min-h-screen bg-[#f7f9fc] p-8 text-sm text-slate-500">Loading project workspace…</main>;
  if (!session) return <main className="min-h-screen bg-[#f7f9fc] p-8"><div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8"><h1 className="text-xl font-semibold text-slate-950">Sign in required</h1><p className="mt-2 text-sm text-slate-600">Sign in to view or create projects.</p><Link className="mt-5 inline-flex rounded-xl bg-[#233b67] px-4 py-2.5 text-sm font-semibold text-white" href="/">Return to overview</Link></div></main>;

  return <main className="min-h-screen bg-[#f7f9fc] px-4 py-8 text-slate-900 sm:px-8">

    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← JinoX workspace</Link><p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-teal-700">Project operations</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172b4d]">Projects</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Organize oral-health research, maintain project context and connect each project to its governed datasets.</p></div>
        <Link href="/datasets" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Open dataset workspace →</Link>
      </header>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">{notice}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Your accessible projects</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{projects.length} projects</span></div>
          {projects.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center"><h3 className="font-semibold">No projects to show</h3><p className="mt-2 text-sm text-slate-500">Create a project or ask its owner to grant you access.</p></div> :
            <ul className="mt-4 divide-y divide-slate-100">{projects.map((project) => <li key={project.id} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold text-slate-900">{project.name}</h3><p className="mt-1 text-xs capitalize text-slate-500">{project.research_area.replaceAll("_", " ")} · {project.status}</p>{project.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{project.description}</p>}</div><Link href={`/datasets?project_id=${encodeURIComponent(project.id)}`} className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#233b67] hover:bg-slate-50">View datasets →</Link></div></li>)}</ul>}
        </section>
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">Create a project</h2><p className="mt-1 text-sm leading-5 text-slate-500">Keep the initial description concise. Complete ethics, permitted-use and retention details in your governance process before intake.</p>
          <form className="mt-5 space-y-4" onSubmit={createProject}>
            <label className="block text-sm font-medium">Project name<input name="name" required minLength={3} maxLength={160} className={inputClass} placeholder="e.g. Kenya oral health imaging study" /></label>
            <label className="block text-sm font-medium">Research area<select name="research_area" className={inputClass} defaultValue="oral_health">{areas.map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select></label>
            <label className="block text-sm font-medium">Description<textarea name="description" maxLength={5000} rows={4} className={inputClass} placeholder="Purpose, population and research question (avoid patient-identifying details)" /></label>
            <button disabled={saving} className="w-full rounded-xl bg-[#233b67] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1a2e50] disabled:opacity-60">{saving ? "Creating…" : "Create project"}</button>
          </form>
        </aside>
      </div>
      <p className="mt-6 text-xs leading-5 text-slate-500">Access is enforced by the API and database policies. A project record is not evidence of ethics approval or authorization to share patient-derived data.</p>
    </div>
  </main>;
}
