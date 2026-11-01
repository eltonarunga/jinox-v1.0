import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";

const modules = [
  { title: "Multimodal data intake", description: "Create pseudonymous cases, upload dental photographs, radiographs, intraoral scans, clinical records and environmental datasets, and record structured findings.", href: "/data", action: "Open data intake", tag: "Available" },
  { title: "Clinician assessment", description: "Record clinician-entered impressions, differential notes and review status. AI inference is not connected and outputs are not generated.", href: "/diagnostics", action: "Open assessment workspace", tag: "Human-entered workflow" },
  { title: "Digital twin", description: "Review case-linked source assets and longitudinal clinical observations. 3D reconstruction and biological simulation remain unimplemented.", href: "/twin", action: "Open digital twin", tag: "Longitudinal record" },
  { title: "Genetic risk research", description: "Register study protocols, target phenotypes, population definitions and ethics status. Raw genomic intake and individual risk prediction are disabled.", href: "/genetics", action: "Open genetics research", tag: "Protocol metadata" },
  { title: "Environmental intelligence", description: "Record source-attributed fluoride, water-source and climate measurements with constrained units and plausible-value checks.", href: "/environment", action: "Open environmental data", tag: "Available" },
  { title: "Research workspace", description: "Manage research projects, dataset metadata, experiment plans and consent metadata.", href: "/research", action: "Open research workspace", tag: "Available" },
];

export default function ClinicalWorkspacePage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteNavigation currentPath="/clinical" />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="border-b border-slate-200 pb-8 sm:pb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-800">Oral and craniofacial health · Kenya-first research platform</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[#172b4d] sm:text-4xl">Clinical and multimodal workspace</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                A connected workflow for pseudonymous case records, source-file intake, structured observations, environmental measurements, genetics research protocols and longitudinal case review. Each module states its current capabilities and limitations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/profile" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">My profile</Link>
              <Link href="/admin" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">Admin</Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="modules-heading" className="pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-800">Clinical operations</p>
              <h2 id="modules-heading" className="mt-2 text-xl font-semibold tracking-tight text-[#172b4d]">Workspace modules</h2>
              <p className="mt-1 text-sm text-slate-500">Available data workflows are separated from unvalidated AI and simulation capabilities.</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">Research prototype</span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((module, index) => (
              <article key={module.title} className="group flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800">{String(index + 1).padStart(2, "0")}</span>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{module.tag}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-[#172b4d]">{module.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{module.description}</p>
                <Link href={module.href} className="mt-5 inline-flex min-h-10 w-fit items-center gap-2 rounded-xl bg-[#172b4d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#233b67] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">
                  {module.action} <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6" aria-label="Clinical safety notice">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-sm font-bold text-amber-800" aria-hidden="true">!</span>
            <div>
              <h2 className="text-sm font-semibold text-amber-950">Clinical safety and data protection</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                This prototype is not a validated medical device and does not provide AI-generated diagnosis, treatment recommendations or patient triage. Use only pseudonymous data for which appropriate consent or ethics authorization exists. Do not upload direct identifiers. The current upload flow does not perform image-pixel de-identification, malware scanning or automated row-level CSV validation.
              </p>
            </div>
          </div>
        </aside>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500">
          <span>JinoX AI · Clinical workspace · Research prototype</span>
          <Link href="/research" className="inline-flex items-center gap-2 font-semibold text-[#172b4d] transition hover:text-teal-800">Go to research workspace <span aria-hidden="true">→</span></Link>
        </footer>
      </div>
    </main>
  );
}
