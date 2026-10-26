"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = new URL("/auth/callback", window.location.origin).toString();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, queryParams: { access_type: "offline", prompt: "select_account" } },
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-12 text-neutral-950">
      <section className="w-full max-w-md">
        <div className="mb-10 inline-flex rounded-md bg-black px-4 py-2 text-lg font-semibold tracking-tight text-white">JinoX AI</div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">Clinical intelligence · Research platform</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in to JinoX AI</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Use your Google account to access the research workspace. Only Google sign-in is available.</p>
          <button type="button" onClick={signInWithGoogle} disabled={loading}
            className="mt-8 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.92 3.27-4.74 3.27-8.1Z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.87A11 11 0 0 0 12 23Z"/>
              <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.02H2.15A11 11 0 0 0 1 12c0 1.78.43 3.47 1.15 4.98l3.69-2.87Z"/>
              <path fill="#EA4335" d="M12 5.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97 0 12 0A11 11 0 0 0 2.15 7.02l3.69 2.87C6.71 7.29 9.14 5.36 12 5.36Z"/>
            </svg>
            {loading ? "Redirecting to Google…" : "Continue with Google"}
          </button>
          {error ? <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <p className="mt-6 text-xs leading-5 text-neutral-500">Access is subject to JinoX AI’s authorization and research governance policies. Prototype outputs are not validated clinical advice.</p>
        </div>
      </section>
    </main>
  );
}
