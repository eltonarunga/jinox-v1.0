"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const sections = [
  {
    label: "WORKSPACE",
    items: [
      { href: "/", label: "Overview", mark: "O" },
      { href: "/projects", label: "Projects", mark: "P" },
      { href: "/data", label: "Data collection", mark: "C" },
      { href: "/datasets", label: "Datasets", mark: "D" },
    ],
  },
  {
    label: "DATA OPERATIONS",
    items: [
      { href: "/annotate", label: "Annotation tasks", mark: "A" },
      { href: "/quality", label: "Quality assurance", mark: "Q" },
      { href: "/training", label: "Model development", mark: "M" },
      { href: "/twin", label: "Case records", mark: "R" },
      { href: "/clinical", label: "Tools", mark: "T" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [authError, setAuthError] = useState("");
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let active = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError("Account status could not be verified.");
      setUser(data.user);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
      setAuthError("");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function signOut() {
    if (!supabase) {
      setAuthError("Sign-out is unavailable because authentication is not configured.");
      return;
    }
    setSigningOut(true);
    setAuthError("");
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      setAuthError("Could not sign out. Please try again.");
      setSigningOut(false);
      return;
    }
    setUser(null);
    setSigningOut(false);
    setMenuOpen(false);
    router.replace("/");
    router.refresh();
  }

  const onLoginPage = pathname === "/login";
  const navigationLinks = (
    <nav aria-label="Primary navigation" className="space-y-7">
      {sections.map((section) => (
        <section key={section.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-[.16em] text-neutral-400">{section.label}</p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors ${active ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"}`}
                  >
                    <span aria-hidden="true" className={`grid size-6 shrink-0 place-items-center rounded text-[10px] font-bold ${active ? "bg-white/15 text-white" : "bg-neutral-100 text-neutral-500 group-hover:bg-white"}`}>{item.mark}</span>
                    <span>{item.label}</span>
                    {active && <span className="ml-auto size-1.5 rounded-full bg-white" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );

  const accountActions = (
    <div className="border-t border-neutral-200 pt-4">
      {user && (
        <Link href="/profile" className="mb-2 flex min-w-0 items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-100">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700">{(user.email?.[0] ?? "U").toUpperCase()}</span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-neutral-800">Your account</span>
            <span className="block max-w-[160px] truncate text-[11px] text-neutral-500">{user.email}</span>
          </span>
        </Link>
      )}
      {!authReady ? (
        <p className="px-3 py-2 text-xs text-neutral-400">Checking account…</p>
      ) : user ? (
        <button type="button" onClick={signOut} disabled={signingOut} className="flex min-h-9 w-full items-center rounded-md px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 disabled:opacity-60">
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      ) : (
        <Link href={onLoginPage ? "/" : `/login?next=${encodeURIComponent(pathname || "/")}`} className="flex min-h-10 items-center justify-center rounded-md bg-neutral-900 px-3 text-xs font-semibold text-white transition hover:bg-neutral-700">
          {onLoginPage ? "Back to overview" : "Sign in"}
        </Link>
      )}
      {authError && <p role="status" className="mt-2 px-3 text-[11px] text-red-700">{authError}</p>}
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-neutral-200 bg-white lg:flex">
        <Link href="/" className="flex h-[76px] items-center gap-3 border-b border-neutral-100 px-6" aria-label="JinoX AI overview">
          <span className="grid size-9 place-items-center rounded-lg bg-neutral-950 text-lg font-semibold tracking-tight text-white">J</span>
          <span>
            <span className="block text-[15px] font-semibold tracking-tight text-neutral-950">JinoX AI</span>
            <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[.18em] text-neutral-400">Data operations</span>
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto px-4 py-7">{navigationLinks}</div>
        <div className="px-4 pb-5">{accountActions}</div>
      </aside>

      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="JinoX AI overview">
            <span className="grid size-8 place-items-center rounded-md bg-neutral-950 text-sm font-semibold text-white">J</span>
            <span className="text-sm font-semibold tracking-tight text-neutral-950">JinoX AI</span>
          </Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="inline-flex min-h-9 items-center gap-2 rounded-md border border-neutral-200 px-3 text-xs font-semibold text-neutral-700">
            <span>{menuOpen ? "Close" : "Menu"}</span>
            <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
          </button>
        </div>
        {menuOpen && (
          <div id="mobile-navigation" className="border-t border-neutral-100 py-4">
            {navigationLinks}
            <div className="mt-5">{accountActions}</div>
          </div>
        )}
      </header>
    </>
  );
}
