import { createClient } from "@supabase/supabase-js";

// Optional: only used once NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_ANON_KEY are set (see .env.example). Until then, the
// API routes read from lib/data.ts so the app runs with zero setup.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
