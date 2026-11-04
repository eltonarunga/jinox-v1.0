import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-5 text-[11px] text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-neutral-600">JinoX AI</span>
          <span aria-hidden="true">·</span>
          <span>Data operations platform prototype</span>
        </div>
        <nav aria-label="Legal information" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/privacy" className="transition hover:text-neutral-900">Privacy</Link>
          <Link href="/terms" className="transition hover:text-neutral-900">Terms</Link>
          <Link href="/" className="transition hover:text-neutral-900">Overview</Link>
        </nav>
      </div>
    </footer>
  );
}
