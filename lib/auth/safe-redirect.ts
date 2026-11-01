/**
 * Resolve a login redirect only when it remains on the application's origin.
 * Checking the resolved origin also rejects URL parser edge cases involving
 * backslashes and protocol-relative destinations.
 */
export function getSafeRedirectPath(candidate: string | null, baseUrl: string): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }

  try {
    const base = new URL(baseUrl);
    const target = new URL(candidate, base);
    if (target.origin !== base.origin) return "/";
    return target.pathname + target.search + target.hash;
  } catch {
    return "/";
  }
}
