"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    const code = searchParams.get("error");
    if (code === "oauth_callback") return "Google sign-in could not be completed. Please try again. If the problem continues, ask the platform administrator to verify the OAuth callback configuration.";
    if (code === "configuration") return "Authentication is not configured for this deployment. Workspace access is disabled until the administrator completes setup.";
    if (code === "auth_unavailable") return "We could not verify your session. Please try again when authentication is available.";
    return "";
  });

  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Sign-in is not configured for this deployment. Please contact the platform administrator.");
      const requestedNext = searchParams.get("next");
      const safeNext = getSafeRedirectPath(requestedNext, window.location.origin);
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", safeNext);
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: { access_type: "offline", prompt: "select_account" },
        },
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-5 py-12 text-neutral-950">
      <section className="w-full max-w-md">
        <div className="border border-neutral-200 bg-white p-7 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">JinoX account access</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Use your authorized Google account to access the multimodal data workspace. Access to datasets and case records is controlled by your assigned permissions.</p>
          <button type="button" onClick={signInWithGoogle} disabled={loading || searchParams.get("error") === "configuration"}
            className="mt-8 flex min-h-12 w-full items-center justify-center gap-3 border border-neutral-300 bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">
            <span aria-hidden="true" className="grid h-5 w-5 place-items-center border border-white/70 text-xs font-bold">G</span>
            {loading ? "Redirecting to Google…" : "Continue with Google"}
          </button>
          {error ? <p role="alert" className="mt-4 border border-neutral-200 bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">{error}</p> : null}
          <p className="mt-6 text-xs leading-5 text-neutral-500">By continuing, you acknowledge the <Link href="/terms" className="font-semibold text-neutral-800 underline underline-offset-2">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-neutral-800 underline underline-offset-2">Privacy Policy</Link>.</p>
          <p className="mt-4 border-t border-neutral-200 pt-4 text-xs leading-5 text-neutral-500">JinoX AI is a platform prototype. Its outputs are not validated clinical decision support and must not replace professional judgment.</p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="flex min-h-[70vh] items-center justify-center bg-white"><p className="text-sm text-neutral-600">Loading sign-in…</p></main>}><LoginPageContent /></Suspense>;
}
