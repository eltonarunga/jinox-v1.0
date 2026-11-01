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
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
        <Link href="/" aria-label="JinoX AI home" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#172b4d] text-sm font-bold text-white shadow-sm">J</span>
          <span className="text-sm font-bold tracking-tight text-[#172b4d]">JinoX AI</span>
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
                    className={`inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-1 sm:text-sm ${active ? "bg-teal-50 text-teal-900" : "text-slate-500 hover:bg-slate-50 hover:text-[#172b4d]"}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link href="/research" className="inline-flex min-h-9 shrink-0 items-center rounded-lg bg-[#172b4d] px-3.5 text-xs font-semibold text-white transition hover:bg-[#233b67] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 sm:text-sm">
          Open workspace
        </Link>
      </div>
    </header>
  );
}
