import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";

const workflows = [
  { number: "01", title: "Collect & submit", description: "Bring together radiographs, clinical images, scans, structured records and other permitted data through a governed intake workflow.", href: "/data", action: "Open data intake" },
  { number: "02", title: "Curate datasets", description: "Register dataset scope, modality, source, provenance and rights context. Track what is ready for annotation.", href: "/datasets", action: "Explore datasets" },
  { number: "03", title: "Annotate & review", description: "Assign items, apply versioned label schemas and submit work for independent review with a traceable revision history.", href: "/annotate", action: "Open annotation" },
  { number: "04", title: "Prepare model training", description: "Assess dataset readiness, governance, label quality and split methodology before a training pipeline is configured.", href: "/training", action: "Open training workspace" },
  { number: "05", title: "Build digital records", description: "Bring case-linked modalities and longitudinal observations into one reviewable digital-twin record.", href: "/twin", action: "Open digital twin" },
];

const principles = [
  ["Governed by design", "Consent, rights, permitted use and access scope remain visible throughout the data lifecycle."],
  ["Human-reviewed", "Automated labels are never treated as ground truth; annotation and independent review remain distinct."],
  ["Traceable outputs", "Dataset versions, label schemas, provenance and audit events support reproducible downstream work."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <SiteNavigation currentPath="/" />
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-neutral-500">Oral & craniofacial health · Data infrastructure</p>
            <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-.055em] text-black sm:text-5xl lg:text-6xl">The data layer for the next generation of oral-health AI.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">Collect multimodal data, build high-quality datasets, coordinate expert annotation and prepare responsible model-development workflows in one governed workspace.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/data" className="inline-flex min-h-12 items-center justify-center bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">Start data collection <span className="ml-3" aria-hidden="true">→</span></Link>
              <Link href="/datasets" className="inline-flex min-h-12 items-center justify-center border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50">Browse datasets</Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-neutral-500">Access to patient-derived data requires an authorized account and project-scoped permissions.</p>
          </div>
          <div className="border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div><p className="text-sm font-semibold text-neutral-950">JinoX data lifecycle</p><p className="mt-1 text-xs text-neutral-500">From source material to research-ready assets</p></div>
              <span className="border border-neutral-300 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-neutral-600">Workflow</span>
            </div>
            <ol className="mt-5 space-y-0">
              {["Collect & submit", "Curate & validate", "Annotate & review", "Prepare training data", "Version & release"].map((step, index) => (
                <li key={step} className="flex items-center gap-4 border-b border-neutral-200 py-4 last:border-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center border border-neutral-300 bg-white text-xs font-semibold text-neutral-600">0{index + 1}</span>
                  <span className="text-sm font-medium text-neutral-800">{step}</span>
                  <span className="ml-auto text-xs text-neutral-400">→</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-neutral-200 pt-4 text-xs leading-5 text-neutral-500">A dataset status is not evidence of ethical approval, clinical validity or release authorization.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-neutral-500">Core workflows</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">One platform. Five connected workflows.</h2><p className="mt-4 text-sm leading-7 text-neutral-600">Each stage has a clear purpose, permission boundary and handoff to the next stage.</p></div>
        <div className="mt-9 grid gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => <article key={workflow.number} className="flex min-h-64 flex-col bg-white p-6 sm:p-7">
            <span className="text-xs font-semibold tracking-[.16em] text-neutral-400">{workflow.number} / WORKFLOW</span>
            <h3 className="mt-6 text-xl font-semibold tracking-tight text-neutral-950">{workflow.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">{workflow.description}</p>
            <Link href={workflow.href} className="mt-6 inline-flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-black underline decoration-neutral-300 underline-offset-4 hover:decoration-black">{workflow.action} <span aria-hidden="true">→</span></Link>
          </article>)}
        </div>
      </section>
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-20">
          <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-neutral-500">Principles</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-black">Trust is part of the workflow.</h2><p className="mt-4 text-sm leading-7 text-neutral-600">JinoX is data infrastructure. Experimental model and digital-twin capabilities must remain clearly separated from validated clinical systems.</p></div>
          <div className="divide-y divide-neutral-200">{principles.map(([title, description], index) => <div key={title} className="flex gap-5 py-5 first:pt-0 last:pb-0"><span className="pt-0.5 text-xs font-semibold text-neutral-400">0{index + 1}</span><div><h3 className="text-sm font-semibold text-neutral-950">{title}</h3><p className="mt-1.5 text-sm leading-6 text-neutral-600">{description}</p></div></div>)}</div>
        </div>
      </section>
      <footer className="border-t border-neutral-200"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>© {new Date().getFullYear()} JinoX AI · Multimodal oral-health data infrastructure</span><span>Platform prototype · Not validated clinical decision support</span></div></footer>
    </main>
  );
}
