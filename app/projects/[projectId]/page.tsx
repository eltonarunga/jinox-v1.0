"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
type Dataset = {
  id: string;
  name: string;
  description: string;
  modality: string;
  source_type: string;
  consent_basis: string;
  record_count: number | null;
  status: string;
  created_at: string;
};

const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (part) => part.toUpperCase());
const date = (value: string) => new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) { setAuthReady(true); setLoading(false); setError("Authentication is not configured."); return; }
    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setAuthReady(true); }
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!authReady || !session || !projectId) {
      if (authReady && !session) setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const headers = { Authorization: `Bearer ${session!.access_token}` };
        const [projectResponse, datasetResponse] = await Promise.all([
          fetch("/api/research/projects", { headers, cache: "no-store" }),
          fetch(`/api/research/datasets?project_id=${encodeURIComponent(projectId)}`, { headers, cache: "no-store" }),
        ]);
        const [projectBody, datasetBody] = await Promise.all([
          projectResponse.json().catch(() => ({})),
          datasetResponse.json().catch(() => ({})),
        ]);
        if (!projectResponse.ok || !datasetResponse.ok) throw new Error("Project information could not be loaded. Check your project access and try again.");
        if (!active) return;
        const match = (projectBody.data ?? []).find((item: Project) => item.id === projectId) ?? null;
        setProject(match);
        setDatasets((datasetBody.data ?? []) as Dataset[]);
        if (!match) setError("This project is unavailable or you do not have access.");
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Project information could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [authReady, session, projectId]);

  if (!authReady || loading) return <main className="min-h-screen p-8 text-sm text-neutral-500">Loading project workspace…</main>;
  if (!session) return <main className="min-h-screen p-8"><div className="mx-auto max-w-3xl rounded-xl border border-neutral-200 bg-white p-8"><h1 className="text-xl font-semibold">Sign in required</h1><p className="mt-2 text-sm text-neutral-600">Sign in to access this project workspace.</p><Link className="mt-5 inline-flex rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white" href="/">Return to overview</Link></div></main>;

  return (
    <main className="min-h-screen px-4 py-8 text-neutral-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="text-xs text-neutral-500"><Link href="/projects" className="hover:text-neutral-900">Projects</Link><span className="mx-2">/</span><span aria-current="page">Project workspace</span></nav>
        {error && <p role="alert" className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
        {project && <>
          <header className="mt-6 border-b border-neutral-200 pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">Project workspace</p><h1 className="mt-2 break-words text-3xl font-semibold tracking-tight">{project.name}</h1><p className="mt-2 text-sm text-neutral-600">{pretty(project.research_area)} <span className="mx-2 text-neutral-300">·</span> Created {date(project.created_at)}</p></div>
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">{pretty(project.status)}</span>
            </div>
            {project.description && <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-neutral-600">{project.description}</p>}
          </header>

          <section aria-labelledby="project-summary" className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Registered datasets</p><p className="mt-2 text-3xl font-semibold tabular-nums">{datasets.length}</p><p className="mt-1 text-xs text-neutral-500">Metadata records accessible in this project</p></div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Project status</p><p className="mt-2 text-xl font-semibold">{pretty(project.status)}</p><p className="mt-1 text-xs text-neutral-500">Current value from the project record</p></div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Research area</p><p className="mt-2 text-xl font-semibold">{pretty(project.research_area)}</p><p className="mt-1 text-xs text-neutral-500">Classification recorded at project creation</p></div>
          </section>

          <section className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="project-summary" className="text-lg font-semibold">Dataset inventory</h2><p className="mt-1 text-sm text-neutral-600">Datasets registered under this project. Registration is separate from file intake and release approval.</p></div><Link href={`/datasets?project_id=${encodeURIComponent(project.id)}`} className="inline-flex min-h-10 items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700">Manage datasets</Link></div>
            {datasets.length === 0 ? <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-white p-8"><h3 className="font-semibold">No datasets registered</h3><p className="mt-2 text-sm text-neutral-600">Register dataset metadata when the project scope and data-use basis are ready.</p><Link href={`/datasets?project_id=${encodeURIComponent(project.id)}`} className="mt-4 inline-flex text-sm font-semibold underline underline-offset-4">Register dataset</Link></div> : <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white"><div className="hidden grid-cols-[minmax(0,1.6fr)_1fr_1fr_auto] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 sm:grid"><span>Dataset</span><span>Modality</span><span>Rights basis</span><span>Status</span></div><ul className="divide-y divide-neutral-100">{datasets.map((dataset) => <li key={dataset.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1.6fr)_1fr_1fr_auto] sm:items-center sm:gap-4"><div className="min-w-0"><Link href={`/datasets/${dataset.id}`} className="font-semibold text-neutral-900 underline-offset-4 hover:underline">{dataset.name}</Link><p className="mt-1 text-xs text-neutral-500">{dataset.record_count == null ? "Record count not estimated" : `${dataset.record_count.toLocaleString()} estimated records`} · Added {date(dataset.created_at)}</p></div><p className="text-sm text-neutral-600">{pretty(dataset.modality)}</p><p className="text-sm text-neutral-600">{pretty(dataset.consent_basis)}</p><span className="w-fit rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700">{pretty(dataset.status)}</span></li>)}</ul></div>}
          </section>

          <section className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5"><h2 className="text-sm font-semibold">Governance reminder</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">A project record and a dataset rights-basis field do not by themselves establish ethics approval, consent validity, permission to train models, or authorization to transfer data. Verify the project-specific evidence before collection or use.</p></section>
        </>}
      </div>
    </main>
  );
}
