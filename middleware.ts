import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-config";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";

const PUBLIC_PATHS = new Set(["/", "/login", "/privacy", "/terms"]);

function redirectToLogin(request: NextRequest, error?: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  if (error) loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicPage = PUBLIC_PATHS.has(pathname);
  const isAuthCallback = pathname === "/auth/callback";

  const config = getPublicSupabaseConfig();
  if (!config) {
    if (isPublicPage || isAuthCallback) return NextResponse.next();
    return redirectToLogin(request, "configuration");
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();

  // Public legal and landing pages stay available when the auth provider is down.
  if (isPublicPage) return response;
  if (isAuthCallback) return response;

  // Fail closed for protected workspace pages when session validation fails.
  if (error) return redirectToLogin(request, "auth_unavailable");

  if (!user && pathname !== "/login") return redirectToLogin(request);

  if (user && pathname === "/login") {
    const safeNext = getSafeRedirectPath(request.nextUrl.searchParams.get("next"), request.url);
    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
