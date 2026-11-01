import Link from "next/link";

export default function TrainingPreparationPage() {
  return <main className="min-h-screen bg-white text-neutral-950">
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <header className="border-b border-neutral-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">Research workflow</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Training preparation</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">Prepare reviewed datasets for external model development.</p>
      </header>
      <section className="mt-6 border border-neutral-200 bg-neutral-50 p-5">
        <h2 className="text-sm font-semibold">Preparation only</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">Training execution and model registry are not connected. No model jobs or results are generated here.</p>
      </section>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/datasets" className="inline-flex min-h-10 items-center bg-black px-4 py-2 text-sm font-semibold text-white">Review datasets</Link>
        <Link href="/annotate" className="inline-flex min-h-10 items-center border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Review annotations</Link>
      </div>
    </div>
  </main>;
}
