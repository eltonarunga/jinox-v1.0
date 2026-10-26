import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export type ResearchContext = {
  supabase: SupabaseClient;
  userId: string;
};

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Validate the bearer token with Supabase Auth and use that same JWT for all RLS-protected queries. */
export async function getResearchContext(request: NextRequest): Promise<ResearchContext | NextResponse> {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return jsonError('Missing bearer access token.', 401);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return jsonError('Supabase environment is not configured.', 500);

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return jsonError('Invalid or expired access token.', 401);
  return { supabase, userId: data.user.id };
}

export function isResearchContext(value: ResearchContext | NextResponse): value is ResearchContext {
  return !(value instanceof NextResponse);
}
