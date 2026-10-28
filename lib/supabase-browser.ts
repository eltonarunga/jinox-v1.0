import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-config";

let client: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase browser client, or null when public project
 * configuration is missing or invalid. Callers must handle the null case.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const config = getPublicSupabaseConfig();
  if (!config) return null;

  if (!client) {
    client = createBrowserClient(config.url, config.anonKey);
  }

  return client;
}
