import Link from "next/link";

const modules = [
  {
    title: "Research workspace",
    description: "Manage research projects, dataset metadata, experiment plans, and consent metadata.",
    href: "/research",
    action: "Open research workspace",
    available: true,
    tag: "Available",
  },
  {
    title: "Field screening",
    description: "Clinical screening capture and patient-specific risk calculations are not enabled in this release.",
    href: null,
    action: "Not yet available",
    available: false,
    tag: "In development",
  },
  {
    title: "Clinical diagnostics",
    description: "No validated diagnostic model is connected. Do not use this prototype to diagnose or triage patients.",
    href: null,
    action: "Not yet available",
    available: false,
    tag: "Not clinically validated",
  },
  {
    title: "Climate-health GIS",
    description: "County-level environmental and oral-health visualisation is unavailable until verified source data is connected.",
    href: null,
    action: "Awaiting verified data",
    available: false,
    tag: "Data required",
  },
];

export default function ClinicalWorkspacePage() {
  return (
    <main className="min-h-screen bg-[#f7f7f7] text-slate-900">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <Link href="/clinical" aria-label="JinoX AI clinical workspace" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
            <span className="rounded-md bg-black px-3.5 py-2.5 text-sm font-bold tracking-tight text-white">JinoX AI</span>
            <span className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Clinical workspace</span>
          </Link>
          <Link href="/research" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
            Research workspace <span aria-hidden="true">→</span>
          </Link>
        </header>

        <section className="py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Oral and craniofacial health</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Clinical workspace</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            A workspace for clinical and environmental health tools. Available research functions are linked below; clinical decision-support modules will only be enabled when their data and validation requirements are met.
          </p>
        </section>

        <section aria-labelledby="modules-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="modules-heading" className="text-lg font-semibold tracking-tight">Workspace modules</h2>
              <p className="mt-1 text-sm text-slate-500">Current availability, without simulated patient data or fabricated model results.</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">Prototype status</span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {modules.map((module) => (
              <article key={module.title} className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-950">{module.title}</h3>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${module.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{module.tag}</span>
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{module.description}</p>
                {module.available && module.href ? (
                  <Link href={module.href} className="mt-5 inline-flex min-h-10 w-fit items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">{module.action} <span aria-hidden="true">→</span></Link>
                ) : (
                  <span aria-disabled="true" className="mt-5 inline-flex min-h-10 w-fit cursor-not-allowed items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-400">{module.action}</span>
                )}
              </article>
            ))}
          </div>
        </section>

        <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6" aria-label="Clinical safety notice">
          <h2 className="text-sm font-semibold text-amber-950">Clinical safety notice</h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            This prototype is not a medical device and does not provide validated diagnosis, treatment recommendations, or patient triage. Do not enter identifiable patient information. Use established clinical protocols and professional judgement for patient care.
          </p>
        </aside>

        <footer className="mt-8 border-t border-slate-200 pt-5 text-xs text-slate-400">JinoX AI · Clinical workspace · Prototype</footer>
      </div>
    </main>
  );
}
