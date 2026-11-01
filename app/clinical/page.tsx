import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";

const modules = [
  { title: "Multimodal data intake", description: "Create pseudonymous cases, upload dental photographs, radiographs, intraoral scans, clinical records and environmental datasets, and record structured findings.", href: "/data", action: "Open data intake", tag: "Available", available: true },
  { title: "Clinician assessment", description: "Record clinician-entered impressions, differential notes and review status. AI inference is not connected and outputs are not generated.", href: "/diagnostics", action: "Open assessment workspace", tag: "Human-entered workflow", available: true },
  { title: "Digital twin", description: "Review case-linked source assets and longitudinal clinical observations. 3D reconstruction and biological simulation remain unimplemented.", href: "/twin", action: "Open digital twin", tag: "Longitudinal record", available: true },
  { title: "Genetic risk research", description: "Register study protocols, target phenotypes, population definitions and ethics status. Raw genomic intake and individual risk prediction are disabled.", href: "/genetics", action: "Open genetics research", tag: "Protocol metadata", available: true },
  { title: "Environmental intelligence", description: "Record source-attributed fluoride, water-source and climate measurements with constrained units and plausible-value checks.", href: "/environment", action: "Open environmental data", tag: "Available", available: true },
  { title: "Research workspace", description: "Manage research projects, dataset metadata, experiment plans and consent metadata.", href: "/research", action: "Open research workspace", tag: "Available", available: true },
];

export default function ClinicalWorkspacePage() {
  return (
    <main className="min-h-screen bg-[#f7f7f7] text-slate-900">
      <SiteNavigation currentPath="/clinical" />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <Link href="/clinical" aria-label="JinoX AI clinical workspace" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
            <span className="rounded-md bg-black px-3.5 py-2.5 text-sm font-bold tracking-tight text-white">JinoX AI</span>
            <span className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Clinical workspace</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2" aria-label="Account navigation">
            <Link href="/profile" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">My profile</Link>
            <Link href="/admin" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Admin</Link>
            <Link href="/research" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
              Research workspace <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </header>

        <section className="py-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Oral and craniofacial health · Kenya-first research platform</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Clinical and multimodal workspace</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            A connected workflow for pseudonymous case records, source-file intake, structured observations, environmental measurements, genetics research protocols and longitudinal case review. Each module states its current capabilities and limitations.
          </p>
        </section>

        <section aria-labelledby="modules-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="modules-heading" className="text-lg font-semibold tracking-tight">Workspace modules</h2>
              <p className="mt-1 text-sm text-slate-500">Available data workflows are separated from unvalidated AI and simulation capabilities.</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">Prototype status</span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <article key={module.title} className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-950">{module.title}</h3>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">{module.tag}</span>
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{module.description}</p>
                <Link href={module.href} className="mt-5 inline-flex min-h-10 w-fit items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">{module.action} <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>

        <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6" aria-label="Clinical safety notice">
          <h2 className="text-sm font-semibold text-amber-950">Clinical safety and data protection</h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            This prototype is not a validated medical device and does not provide AI-generated diagnosis, treatment recommendations or patient triage. Use only pseudonymous data for which appropriate consent or ethics authorization exists. Do not upload direct identifiers. The current upload flow does not perform image-pixel de-identification, malware scanning or automated row-level CSV validation.
          </p>
        </aside>

        <footer className="mt-8 border-t border-slate-200 pt-5 text-xs text-slate-400">JinoX AI · Clinical workspace · Research prototype</footer>
      </div>
    </main>
  );
}
