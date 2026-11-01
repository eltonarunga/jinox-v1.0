import Link from "next/link";

const workflows = [
  { number: "01", title: "Collect & submit", description: "Create pseudonymous cases, upload permitted source files and record structured observations.", href: "/data" },
  { number: "02", title: "Datasets", description: "Organize multimodal assets, metadata, provenance and project-level permissions.", href: "/datasets" },
  { number: "03", title: "Annotation", description: "Work through assigned items using documented labels and independent review.", href: "/annotate" },
  { number: "04", title: "Model training", description: "Prepare reviewed, versioned datasets for reproducible model development.", href: "/training" },
  { number: "05", title: "Digital twin", description: "Review case-linked source assets and longitudinal observations in one record.", href: "/twin" },
];

export default function ClinicalWorkspacePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="max-w-3xl border-b border-neutral-200 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-neutral-500">JinoX workspace</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Multimodal data operations</h1>
          <p className="mt-3 text-sm leading-7 text-neutral-600">A connected workspace for collecting governed oral-health data, curating datasets, coordinating annotation and preparing future model and digital-twin workflows.</p>
        </header>
        <section className="mt-8 grid gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <article key={workflow.number} className="flex min-h-56 flex-col bg-white p-6">
              <span className="text-xs font-semibold tracking-[.16em] text-neutral-400">{workflow.number}</span>
              <h2 className="mt-5 text-xl font-semibold">{workflow.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-neutral-600">{workflow.description}</p>
              <Link href={workflow.href} className="mt-5 text-sm font-semibold text-black underline underline-offset-4">Open workflow →</Link>
            </article>
          ))}
        </section>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/profile" className="border border-neutral-300 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50">My profile</Link>
          <Link href="/admin" className="border border-neutral-300 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50">Admin</Link>
        </div>
      </div>
    </main>
  );
}
