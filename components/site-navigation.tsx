"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const primaryLinks = [
  { href: "/", label: "Overview" },
  { href: "/data", label: "Collect & submit" },
  { href: "/datasets", label: "Datasets" },
  { href: "/projects", label: "Projects" },
  { href: "/annotate", label: "Annotation" },
  { href: "/training", label: "Training prep" },
  { href: "/twin", label: "Case records" },
  { href: "/clinical", label: "Tools" },
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
  const accountControl = !authReady
    ? <span className="hidden text-xs text-neutral-400 sm:inline">Checking account…</span>
    : user
      ? <div className="flex items-center gap-2">
          <Link href="/profile" className="hidden max-w-40 truncate px-2 py-2 text-xs font-medium text-neutral-700 hover:text-black sm:inline" title={user.email ?? "Account"}>{user.email ?? "My account"}</Link>
          <button type="button" onClick={signOut} disabled={signingOut} className="min-h-9 border border-neutral-300 px-3 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-60">
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      : onLoginPage
        ? <Link href="/" className="min-h-9 border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100">Back to overview</Link>
        : <Link href={`/login?next=${encodeURIComponent(pathname || "/")}`} className="min-h-9 bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800">Sign in</Link>;

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="JinoX AI overview" className="flex shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
          <span className="grid h-8 w-8 place-items-center bg-black text-sm font-semibold text-white">J</span>
          <span className="text-sm font-semibold tracking-tight text-neutral-950">JinoX<span className="font-normal text-neutral-500"> AI</span></span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-0.5">
            {primaryLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return <li key={link.href}>
                <Link href={link.href} aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-9 items-center px-2.5 text-xs font-medium transition xl:px-3 ${active ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-black"}`}>
                  {link.label}
                </Link>
              </li>;
            })}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">{accountControl}</div>

        <button type="button" className="inline-flex min-h-9 items-center justify-center border border-neutral-300 px-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 lg:hidden"
          aria-expanded={menuOpen} aria-controls="mobile-primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {menuOpen && <div id="mobile-primary-navigation" className="border-t border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <nav aria-label="Mobile primary navigation">
          <ul className="grid gap-1 sm:grid-cols-2">
            {primaryLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return <li key={link.href}>
                <Link href={link.href} aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center justify-between px-3 text-sm font-medium ${active ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100"}`}>
                  {link.label}<span aria-hidden="true">→</span>
                </Link>
              </li>;
            })}
            {user && <li><Link href="/profile" className="flex min-h-11 items-center px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100">My profile</Link></li>}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
            <span className="max-w-[60%] truncate text-xs text-neutral-500">{user?.email ?? (authReady ? "Not signed in" : "Checking account…")}</span>
            {authReady && (user
              ? <button type="button" onClick={signOut} disabled={signingOut} className="min-h-9 bg-black px-3 text-xs font-semibold text-white disabled:opacity-60">{signingOut ? "Signing out…" : "Sign out"}</button>
              : <Link href={`/login?next=${encodeURIComponent(pathname || "/")}`} className="min-h-9 bg-black px-3 py-2 text-xs font-semibold text-white">Sign in</Link>)}
          </div>
        </nav>
      </div>}

      {authError && <p role="status" className="border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-center text-xs text-neutral-600">{authError}</p>}
    </header>
  );
}
