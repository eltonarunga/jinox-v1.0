import Link from "next/link";

const workflow = [
  {
    number: "01",
    title: "Collect",
    description: "Register cases, source files and structured observations.",
    status: "Available",
    href: "/data",
  },
  {
    number: "02",
    title: "Curate",
    description: "Organize approved source assets into governed datasets.",
    status: "Available",
    href: "/datasets",
  },
  {
    number: "03",
    title: "Annotate",
    description: "Assign dataset items and capture expert labels.",
    status: "Available",
    href: "/annotate",
  },
  {
    number: "04",
    title: "Review & QA",
    description: "Independently review submitted annotations.",
    status: "Available",
    href: "/quality",
  },
  {
    number: "05",
    title: "Deliver",
    description: "Versioned releases and controlled customer exports.",
    status: "In development",
    href: "/datasets",
  },
  {
    number: "06",
    title: "Develop models",
    description: "Prepare approved datasets for model development.",
    status: "Preparation only",
    href: "/training",
  },
];

const workspaces = [
  { title: "Projects", eyebrow: "CUSTOMERS & SCOPE", description: "Set up project context, ownership and access.", href: "/projects", action: "Open projects", mark: "P" },
  { title: "Data collection", eyebrow: "SECURE INTAKE", description: "Create pseudonymous cases and register source data.", href: "/data", action: "Collect data", mark: "C" },
  { title: "Datasets", eyebrow: "CURATION & INVENTORY", description: "Manage dataset scope, source records and eligibility.", href: "/datasets", action: "View datasets", mark: "D" },
  { title: "Annotation operations", eyebrow: "ASSIGNMENT & LABELING", description: "Manage task assignment and submit expert annotations.", href: "/annotate", action: "Open operations", mark: "A" },
  { title: "Quality assurance", eyebrow: "INDEPENDENT REVIEW", description: "Review submitted labels and record acceptance or corrections.", href: "/quality", action: "Open review queue", mark: "Q" },
];

function Status({ value }: { value: string }) {
  const tone = value === "Available" ? "bg-neutral-100 text-neutral-700" : value === "In development" ? "bg-amber-50 text-amber-800" : "bg-neutral-50 text-neutral-500";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{value}</span>;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f6] text-neutral-950">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex flex-col justify-between gap-5 border-b border-neutral-200 pb-7 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-neutral-400">JINOX AI / WORKSPACE</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-neutral-950 sm:text-[38px]">Operational overview</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">A governed workspace for collecting, curating, annotating and preparing high-quality oral and craniofacial health datasets.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/projects" className="inline-flex min-h-10 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 text-xs font-semibold text-neutral-700 transition hover:border-neutral-500 hover:bg-neutral-50">Create project</Link>
            <Link href="/data" className="inline-flex min-h-10 items-center justify-center rounded-md bg-neutral-950 px-4 text-xs font-semibold text-white transition hover:bg-neutral-700">+ Collect data</Link>
          </div>
        </header>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-neutral-400">OPERATING MODEL</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">From raw data to model-ready assets</h2>
            </div>
            <p className="text-xs text-neutral-400">Product lifecycle · current implementation status</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {workflow.map((step) => (
              <Link key={step.number} href={step.href} className="group relative rounded-lg border border-neutral-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] tracking-wider text-neutral-400">{step.number} / 06</span>
                  <Status value={step.status} />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-neutral-900">{step.title}</h3>
                <p className="mt-1.5 min-h-10 text-xs leading-5 text-neutral-500">{step.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 group-hover:text-black">{step.title === "Deliver" ? "Explore dataset workspace" : step.title === "Develop models" ? "Open preparation" : "Open workspace"} <span aria-hidden="true">↗</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-neutral-400">WORKSPACES</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">Get work done</h2>
            </div>
            <span className="text-xs text-neutral-400">Core operational areas</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {workspaces.map((workspace) => (
              <Link key={workspace.href} href={workspace.href} className="group flex min-h-[150px] gap-4 rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-neutral-100 text-xs font-bold text-neutral-600">{workspace.mark}</span>
                <span className="min-w-0">
                  <span className="block text-[9px] font-semibold tracking-[.17em] text-neutral-400">{workspace.eyebrow}</span>
                  <span className="mt-1.5 block text-base font-semibold tracking-tight text-neutral-900">{workspace.title}</span>
                  <span className="mt-1.5 block max-w-md text-xs leading-5 text-neutral-500">{workspace.description}</span>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 group-hover:text-black">{workspace.action} <span aria-hidden="true">→</span></span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-neutral-400">GOVERNANCE FIRST</p>
            <h2 className="mt-2 text-base font-semibold tracking-tight">Trust is part of the dataset.</h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-neutral-500">Patient-derived data remains private by default. Project permissions, documented consent or ethics basis, asset review and annotation provenance are part of the operating workflow—not optional metadata.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded border border-neutral-200 px-2.5 py-1.5 text-[10px] font-medium text-neutral-600">Project-scoped access</span>
              <span className="rounded border border-neutral-200 px-2.5 py-1.5 text-[10px] font-medium text-neutral-600">Private source assets</span>
              <span className="rounded border border-neutral-200 px-2.5 py-1.5 text-[10px] font-medium text-neutral-600">Independent review</span>
              <span className="rounded border border-neutral-200 px-2.5 py-1.5 text-[10px] font-medium text-neutral-600">Audit history</span>
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-[#f0f0ee] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-neutral-400">PRODUCT BOUNDARY</p>
            <h2 className="mt-2 text-base font-semibold tracking-tight">Clear about what is live.</h2>
            <p className="mt-2 text-xs leading-5 text-neutral-600">Dataset release automation, customer exports, training execution, experiment tracking and model serving are not represented as completed capabilities.</p>
            <Link href="/training" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-neutral-800 hover:text-black">View model preparation <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
