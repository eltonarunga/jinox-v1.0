import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/clinical", label: "Clinical" },
  { href: "/research", label: "Research" },
  { href: "/research/projects", label: "Projects" },
  { href: "/research/datasets", label: "Datasets" },
  { href: "/annotate", label: "Annotation" },
];

export function SiteNavigation({ currentPath = "/" }: { currentPath?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="JinoX AI home" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-white">J</span>
          <span className="text-sm font-bold tracking-tight text-slate-950">JinoX AI</span>
        </Link>
        <nav aria-label="Main navigation" className="min-w-0 flex-1 overflow-x-auto">
          <ul className="flex min-w-max items-center gap-1">
            {links.map((link) => {
              const active = link.href === "/" ? currentPath === "/" : currentPath === link.href || currentPath.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-semibold transition sm:text-sm ${active ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link href="/login" className="inline-flex min-h-9 shrink-0 items-center rounded-lg bg-slate-950 px-3.5 text-xs font-semibold text-white transition hover:bg-slate-700 sm:text-sm">
          Sign in
        </Link>
      </div>
    </header>
  );
}
