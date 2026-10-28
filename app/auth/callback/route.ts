import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    // Build the response we will ultimately return so we can set cookies on it
    const redirectResponse = NextResponse.redirect(new URL(safeNext, url.origin));
    const errorResponse = NextResponse.redirect(new URL("/login?error=oauth_callback", url.origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers
              .get("cookie")
              ?.split(";")
              .map((c) => {
                const [name, ...rest] = c.trim().split("=");
                return { name: name.trim(), value: rest.join("=").trim() };
              }) ?? [];
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return redirectResponse;
    return errorResponse;
  }

  return NextResponse.redirect(new URL("/login?error=oauth_callback", url.origin));
}
