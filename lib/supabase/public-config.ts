/** Public Supabase configuration only. Safe to import in browser and server code. */
export type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
};

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return null;

  try {
    const parsed = new URL(url);
    const isLoopback = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    const isSecure = parsed.protocol === "https:";
    const isLocalDevelopment = parsed.protocol === "http:" && isLoopback;

    if ((!isSecure && !isLocalDevelopment) || parsed.username || parsed.password) {
      return null;
    }
  } catch {
    return null;
  }

  return { url, anonKey };
}
