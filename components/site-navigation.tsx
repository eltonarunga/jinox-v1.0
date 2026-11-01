import Link from "next/link";

const links = [
  { href: "/", label: "Overview" },
  { href: "/data", label: "Collect & submit" },
  { href: "/datasets", label: "Datasets" },
  { href: "/annotate", label: "Annotation" },
  { href: "/training", label: "Model training" },
  { href: "/twin", label: "Digital twin" },
];

export function SiteNavigation({ currentPath = "/" }: { currentPath?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:gap-6 sm:px-6 lg:px-8">
        <Link href="/" aria-label="JinoX AI overview" className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
          <span className="grid h-8 w-8 place-items-center bg-black text-sm font-semibold text-white">J</span>
          <span className="text-sm font-semibold tracking-tight text-neutral-950">JinoX<span className="font-normal text-neutral-500"> AI</span></span>
        </Link>
        <nav aria-label="Main navigation" className="min-w-0 flex-1 overflow-x-auto">
          <ul className="flex min-w-max items-center gap-0.5">
            {links.map((link) => {
              const active = link.href === "/" ? currentPath === "/" : currentPath === link.href || currentPath.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link href={link.href} aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-9 items-center px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 sm:text-sm ${active ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-black"}`}>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link href="/datasets" className="hidden min-h-9 shrink-0 items-center bg-black px-3.5 text-xs font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:inline-flex sm:text-sm">
          Open workspace
        </Link>
      </div>
    </header>
  );
}
