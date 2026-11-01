import Link from "next/link";

const stages = [
  ["01", "Select a governed dataset", "Choose a versioned dataset with documented provenance, permitted use and a defined cohort."],
  ["02", "Validate annotation quality", "Review label schema versions, reviewer status, disagreement and adjudication before creating a training split."],
  ["03", "Configure a reproducible run", "Record model family, code version, parameters, compute environment and dataset manifest."],
  ["04", "Evaluate and register", "Capture evaluation data, limitations, model version and approval status before any downstream use."],
];

export default function ModelTrainingPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="max-w-3xl border-b border-neutral-200 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-neutral-500">Model development</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Model training workspace</h1>
          <p className="mt-3 text-sm leading-7 text-neutral-600">Prepare governed, versioned datasets for reproducible model development. Training execution and model registry integration are not connected in this release.</p>
        </header>
        <section className="mt-7 border border-neutral-300 bg-neutral-50 p-5 sm:p-6" aria-labelledby="training-status">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">Workspace status</p><h2 id="training-status" className="mt-2 text-lg font-semibold">Training pipeline not connected</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">No training jobs are started or represented here. Connect a controlled training runner and model registry before enabling execution.</p></div>
            <span className="border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">Preparation only</span>
          </div>
        </section>
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">Training lifecycle</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">A reproducible path from data to model.</h2></div><Link href="/datasets" className="text-sm font-semibold text-black underline underline-offset-4">Review datasets →</Link></div>
          <ol className="mt-5 grid gap-px border border-neutral-200 bg-neutral-200 md:grid-cols-2">
            {stages.map(([number, title, description]) => <li key={number} className="bg-white p-5 sm:p-6"><span className="text-xs font-semibold text-neutral-400">{number}</span><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p></li>)}
          </ol>
        </section>
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="border border-neutral-200 p-5"><h2 className="font-semibold">Dataset readiness</h2><p className="mt-2 text-sm leading-6 text-neutral-600">Before training, confirm authorization, cohort definition, source integrity, duplicate handling, label provenance, independent review and leakage-safe splits.</p><Link href="/annotate" className="mt-4 inline-flex text-sm font-semibold underline underline-offset-4">Open annotation review →</Link></div>
          <div className="border border-neutral-200 p-5"><h2 className="font-semibold">Run history</h2><p className="mt-2 text-sm leading-6 text-neutral-600">No run history is available because a training execution service has not been integrated. This page does not fabricate model metrics or results.</p><span className="mt-4 inline-flex border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">No training runs recorded</span></div>
        </section>
        <p className="mt-8 max-w-4xl text-xs leading-6 text-neutral-500">Models trained on these datasets would remain research outputs until independently evaluated for intended use. Nothing in this workspace constitutes a diagnosis, treatment recommendation or clinically validated model.</p>
      </div>
    </main>
  );
}
