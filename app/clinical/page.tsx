import Link from "next/link";

const tools = [
  { title: "Clinical assessments", description: "Record clinician-entered assessments.", href: "/diagnostics" },
  { title: "Environmental data", description: "Register fluoride and related sample measurements.", href: "/environment" },
  { title: "Genetics protocols", description: "Store research protocol metadata. Individual prediction is disabled.", href: "/genetics" },
];

export default function ToolsPage() {
  return <main className="min-h-screen bg-neutral-50 text-neutral-950">
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <header className="border-b border-neutral-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">JinoX AI</p>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">WORKSPACE / RESEARCH TOOLS</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Additional tools</h1>
        <p className="mt-2 text-sm text-neutral-600">Optional workflows outside the core data lifecycle.</p>
      </header>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => <Link key={tool.href} href={tool.href} className="border border-neutral-200 p-5 transition hover:border-neutral-500">
          <h2 className="text-base font-semibold">{tool.title} <span aria-hidden="true">→</span></h2>
          <p className="mt-2 text-sm leading-5 text-neutral-600">{tool.description}</p>
        </Link>)}
        <Link href="/admin" className="border border-neutral-200 p-5 transition hover:border-neutral-500">
          <h2 className="text-base font-semibold">Administration <span aria-hidden="true">→</span></h2>
          <p className="mt-2 text-sm leading-5 text-neutral-600">Manage user roles. Admin permissions are required.</p>
        </Link>
      </div>
    </div>
  </main>;
}
