import Link from "next/link";

const primaryWorkspaces = [
  {
    number: "01",
    title: "Projects",
    description: "Define the research scope, project ownership and access.",
    href: "/projects",
    action: "Manage projects",
    mark: "P",
    featured: false,
  },
  {
    number: "02",
    title: "Data collection",
    description: "Register pseudonymous cases, source files and structured observations.",
    href: "/data",
    action: "Open data intake",
    mark: "C",
    featured: true,
  },
  {
    number: "03",
    title: "Datasets",
    description: "Curate approved source assets and manage dataset eligibility.",
    href: "/datasets",
    action: "View datasets",
    mark: "D",
    featured: false,
  },
];

const operationalWorkspaces = [
  {
    title: "Annotation tasks",
    description: "Assign dataset items and capture expert labels.",
    href: "/annotate",
    action: "Open annotation",
    mark: "A",
  },
  {
    title: "Quality assurance",
    description: "Independently review submitted annotations and record decisions.",
    href: "/quality",
    action: "Open review",
    mark: "Q",
  },
];

const lifecycle = [
  { step: "01", title: "Collect", detail: "Cases and source files", state: "Available", href: "/data" },
  { step: "02", title: "Curate", detail: "Governed dataset membership", state: "Available", href: "/datasets" },
  { step: "03", title: "Annotate", detail: "Expert labels and task assignment", state: "Available", href: "/annotate" },
  { step: "04", title: "Review", detail: "Independent quality decisions", state: "Available", href: "/quality" },
  { step: "05", title: "Deliver", detail: "Controlled dataset exports", state: "In development", href: "/datasets" },
  { step: "06", title: "Develop", detail: "Model preparation and execution", state: "Preparation only", href: "/training" },
];

function Status({ value }: { value: string }) {
  const styles =
    value === "Available"
      ? "border-neutral-200 bg-neutral-100 text-neutral-700"
      : value === "In development"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-neutral-200 bg-white text-neutral-500";

  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles}`}>
      {value}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f6] text-neutral-950">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 sm:py-10">
        <header className="flex flex-col justify-between gap-6 border-b border-neutral-200 pb-7 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-neutral-400">JINOX AI / WORKSPACE</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-neutral-950 sm:text-[40px]">Your data operations workspace</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Organize oral and craniofacial health data through a governed workflow, from source intake to reviewed annotations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/projects" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:border-neutral-500 hover:bg-neutral-50">
              Set up a project
            </Link>
            <Link href="/data" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-700">
              Collect data <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>
        </header>

        <section className="mt-8" aria-labelledby="start-work-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-neutral-400">START HERE</p>
              <h2 id="start-work-heading" className="mt-1 text-xl font-semibold tracking-tight">Set up and organize your work</h2>
            </div>
            <p className="text-xs text-neutral-500">Choose the workspace that matches your next step.</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {primaryWorkspaces.map((workspace) => (
              <Link
                key={workspace.href}
                href={workspace.href}
                className={`group flex min-h-[190px] flex-col rounded-xl border p-5 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-sm ${workspace.featured ? "border-neutral-900 bg-white ring-1 ring-neutral-900/5" : "border-neutral-200 bg-white"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-700">{workspace.mark}</span>
                  <span className="font-mono text-[10px] tracking-wider text-neutral-400">{workspace.number}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-tight text-neutral-950">{workspace.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-neutral-500">{workspace.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-neutral-800 group-hover:text-black">
                  {workspace.action} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="operations-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-neutral-400">DATA OPERATIONS</p>
              <h2 id="operations-heading" className="mt-1 text-xl font-semibold tracking-tight">Continue with annotation and review</h2>
            </div>
            <span className="text-xs text-neutral-500">Operational workspaces</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {operationalWorkspaces.map((workspace) => (
              <Link key={workspace.href} href={workspace.href} className="group flex min-h-[132px] items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-700">{workspace.mark}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-neutral-950">{workspace.title}</span>
                  <span className="mt-1.5 block text-sm leading-5 text-neutral-500">{workspace.description}</span>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-neutral-800 group-hover:text-black">{workspace.action} <span aria-hidden="true">→</span></span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="lifecycle-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-neutral-400">PRODUCT WORKFLOW</p>
              <h2 id="lifecycle-heading" className="mt-1 text-xl font-semibold tracking-tight">From source data to model development</h2>
            </div>
            <p className="text-xs text-neutral-500">Current implementation status</p>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            {lifecycle.map((item, index) => (
              <div key={item.step} className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5 ${index > 0 ? "border-t border-neutral-100" : ""}`}>
                <span className="font-mono text-[10px] tracking-wider text-neutral-400">{item.step}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{item.detail}</p>
                </div>
                <Status value={item.state} />
                <Link href={item.href} className="inline-flex min-h-9 items-center text-xs font-semibold text-neutral-700 hover:text-black">
                  {item.state === "Available" ? "Open workspace" : "View status"} <span className="ml-2" aria-hidden="true">↗</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-neutral-400">GOVERNANCE BY DESIGN</p>
            <h2 className="mt-2 text-base font-semibold tracking-tight">Data trust is part of the workflow.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              Project permissions, documented consent or ethics basis, private source assets, review decisions and annotation provenance help keep research data controlled.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Project-scoped access", "Private source assets", "Independent review", "Audit history"].map((item) => (
                <span key={item} className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-[10px] font-medium text-neutral-600">{item}</span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-[#f0f0ee] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-neutral-500">TRANSPARENCY</p>
            <h2 className="mt-2 text-base font-semibold tracking-tight">No invented activity metrics.</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              This overview currently provides navigation and workflow status. Live project counts, pending queues and team activity will appear when verified operational summaries are available.
            </p>
            <Link href="/training" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-neutral-800 hover:text-black">
              View model preparation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
