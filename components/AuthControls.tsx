"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AuthControls() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    supabase.auth.getUser().then(({ data, error: authError }) => {
      if (!active) return;
      if (authError) setError("Unable to verify your session.");
      setEmail(data.user?.email ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setEmail(session?.user?.email ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    setError("");
    const supabase = getSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signOut();
    if (authError) {
      setError("Sign out failed. Please try again.");
      setSigningOut(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      {email ? <span className="hidden max-w-[180px] truncate text-xs text-slate-500 xl:block" title={email}>{email}</span> : null}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
      {error ? <span role="alert" className="sr-only">{error}</span> : null}
    </div>
  );
}
