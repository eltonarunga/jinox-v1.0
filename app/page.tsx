import Link from "next/link";

const workflows = [
  { title: "Collect data", description: "Create pseudonymous cases and securely register permitted files.", href: "/data" },
  { title: "Projects", description: "Organize work and control project access.", href: "/projects" },
  { title: "Datasets", description: "Register dataset scope, source and rights metadata.", href: "/datasets" },
  { title: "Annotation", description: "Label dataset items and submit them for review.", href: "/annotate" },
  { title: "Training prep", description: "Review dataset readiness before external model development.", href: "/training" },
  { title: "Case records", description: "Review case-linked files and dated observations.", href: "/twin" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">JinoX AI · Oral-health data platform</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Collect, organize and review oral-health data.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-600">A governed workspace for multimodal data intake, datasets, annotation and research preparation.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/data" className="inline-flex min-h-11 items-center bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800">Start intake</Link>
          <Link href="/projects" className="inline-flex min-h-11 items-center border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">View projects</Link>
        </div>
      </section>
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <h2 className="text-xl font-semibold tracking-tight">Workflows</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((item) => <Link key={item.href} href={item.href} className="group border border-neutral-200 bg-white p-5 transition hover:border-neutral-500">
              <h3 className="text-sm font-semibold">{item.title}<span className="ml-2 text-neutral-400 group-hover:text-black" aria-hidden="true">→</span></h3>
              <p className="mt-2 text-sm leading-5 text-neutral-600">{item.description}</p>
            </Link>)}
          </div>
          <p className="mt-6 text-xs text-neutral-500">Prototype only. Access to patient-derived data requires authorization and project-scoped permissions.</p>
        </div>
      </section>
    </main>
  );
}
