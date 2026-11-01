import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const config = getPublicSupabaseConfig();
  const code = url.searchParams.get("code");
  const safeNext = getSafeRedirectPath(url.searchParams.get("next"), url.origin);

  if (!config || !code) {
    return NextResponse.redirect(new URL("/login?error=oauth_callback", url.origin));
  }

  const redirectResponse = NextResponse.redirect(new URL(safeNext, url.origin));
  const errorResponse = NextResponse.redirect(new URL("/login?error=oauth_callback", url.origin));

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.headers.get("cookie")?.split(";").map((cookie) => {
          const [name, ...rest] = cookie.trim().split("=");
          return { name: name.trim(), value: rest.join("=").trim() };
        }) ?? [];
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return error ? errorResponse : redirectResponse;
}
