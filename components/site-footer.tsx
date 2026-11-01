import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-semibold text-neutral-700">JinoX AI</p>
          <p className="mt-1">Multimodal oral-health data infrastructure · Platform prototype</p>
        </div>
        <nav aria-label="Legal information" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/privacy" className="underline decoration-neutral-300 underline-offset-4 hover:text-black">Privacy Policy</Link>
          <Link href="/terms" className="underline decoration-neutral-300 underline-offset-4 hover:text-black">Terms of Service</Link>
          <Link href="/" className="underline decoration-neutral-300 underline-offset-4 hover:text-black">Home</Link>
        </nav>
      </div>
    </footer>
  );
}
