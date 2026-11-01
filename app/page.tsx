import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";

const workflows = [
  { number: "01", title: "Organize research", description: "Create research projects, define their scope and connect each study to its governed dataset metadata.", href: "/research/projects", action: "Manage projects" },
  { number: "02", title: "Curate datasets", description: "Register imaging, clinical, genomic and environmental dataset metadata with source and rights context.", href: "/research/datasets", action: "Explore datasets" },
  { number: "03", title: "Annotate and review", description: "Work with source assets, versioned labels and a traceable annotation queue for research curation.", href: "/annotate", action: "Open annotation" },
];

const principles = [
  ["Governance-aware", "Consent and rights metadata belong in the research workflow, not as an afterthought."],
  ["Human-reviewed", "Annotation and review workflows keep research labels distinct from automated clinical conclusions."],
  ["Built for traceability", "Projects, dataset metadata and annotation revisions provide a foundation for reproducible research."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SiteNavigation currentPath="/" />
      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#f7f9fc]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-32 -top-44 h-[34rem] w-[34rem] rounded-full bg-teal-100/70 blur-3xl" />
          <div className="absolute -bottom-56 left-[15%] h-[28rem] w-[28rem] rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.22]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)] lg:items-center lg:py-32">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-slate-600 shadow-sm"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" />Oral and craniofacial health research</p>
            <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-.045em] text-slate-950 sm:text-5xl lg:text-6xl">Better data foundations for <span className="text-teal-800">oral-health AI.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">JinoX AI is a research data operations platform for organizing oral-health studies, curating multimodal datasets and coordinating human annotation with governance and provenance in view.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/research" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">Enter research workspace <span aria-hidden="true">→</span></Link>
              <Link href="/clinical" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">Explore clinical workspace</Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500">Secure workspace access requires an authorized account. Public visitors can explore the platform overview without signing in.</p>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-200/60 via-white to-blue-200/60 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,.12)] sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><p className="text-xs font-semibold text-slate-900">JinoX research operations</p><p className="mt-1 text-[11px] text-slate-500">A connected research workflow</p></div><span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-800">Platform overview</span></div>
              <div className="mt-5 space-y-3">
                {[
                  ["Research projects", "Study context and access", "01", "bg-blue-50 text-blue-800"],
                  ["Dataset registry", "Modality, source and rights", "02", "bg-teal-50 text-teal-800"],
                  ["Annotation queue", "Labels and revision history", "03", "bg-violet-50 text-violet-800"],
                  ["Governance metadata", "Consent and permitted use", "04", "bg-amber-50 text-amber-800"],
                ].map(([title, description, number, tone]) => <div key={number} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${tone}`}>{number}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{title}</span><span className="mt-0.5 block text-xs text-slate-500">{description}</span></span><span className="text-slate-300" aria-hidden="true">↗</span></div>)}
              </div>
              <div className="mt-5 rounded-xl bg-slate-950 p-4 text-white"><p className="text-xs font-semibold">Research-first infrastructure</p><p className="mt-1.5 text-xs leading-5 text-slate-300">A practical foundation for dataset operations. Not a validated diagnostic or treatment system.</p></div>
            </div>
          </div>
        </div>
      </section>
      <section id="workflow" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-800">Start with a workflow</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From study setup to reviewed data.</h2></div><p className="max-w-md text-sm leading-6 text-slate-500">Choose the workspace that matches what you need to do. Sign-in and permissions are handled when you enter protected areas.</p></div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {workflows.map((workflow) => <article key={workflow.number} className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5"><span className="text-xs font-bold tracking-[.15em] text-teal-800">{workflow.number} / WORKFLOW</span><h3 className="mt-6 text-xl font-semibold tracking-tight">{workflow.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{workflow.description}</p><Link href={workflow.href} className="mt-6 inline-flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 transition group-hover:decoration-slate-950">{workflow.action} <span aria-hidden="true">→</span></Link></article>)}
        </div>
      </section>
      <section className="border-y border-slate-200 bg-[#f7f9fc]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-20">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-800">Platform principles</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Trust starts with the data workflow.</h2><p className="mt-4 text-sm leading-7 text-slate-600">JinoX is being developed as research infrastructure. Its current capabilities are deliberately distinct from future AI or clinical decision-support ambitions.</p></div>
          <div className="divide-y divide-slate-200">{principles.map(([title, description], index) => <div key={title} className="flex gap-5 py-5 first:pt-0 last:pb-0"><span className="pt-0.5 text-xs font-bold text-slate-400">0{index + 1}</span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p></div></div>)}</div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-6 rounded-3xl bg-slate-950 px-6 py-9 text-white sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-300">Ready to get started?</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Bring your research workflow into one workspace.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Sign in to create a project, register dataset metadata or continue an existing annotation workflow.</p></div><Link href="/research" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-50">Get started <span aria-hidden="true">→</span></Link></div>
      </section>
      <footer className="border-t border-slate-200"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>© {new Date().getFullYear()} JinoX AI · Oral-health research data operations</span><span>Research prototype · Not validated clinical decision support</span></div></footer>
    </main>
  );
}
