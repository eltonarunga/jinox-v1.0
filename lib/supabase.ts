import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { County, DatasetSummaryData } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Read client (uses public anon key)
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

/**
 * Fetch county surveillance records. No synthetic fallback values are generated.
 */
export async function fetchCountiesFromDb(): Promise<County[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("counties")
    .select("name, fluoride_ppm, risk_tier, screened_count, referral_rate, source")
    .order("name", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return null;
  const attributable = data.filter((item) =>
    Boolean(item.source) &&
    Number.isFinite(Number(item.fluoride_ppm)) &&
    ["low", "mod", "high"].includes(item.risk_tier)
  );
  if (attributable.length === 0) return null;

  return attributable.map((item) => ({
    name: item.name,
    ppm: Number(item.fluoride_ppm),
    level: item.risk_tier,
    screened: item.screened_count == null ? undefined : Number(item.screened_count),
    referralRate: item.referral_rate ?? undefined,
    source: item.source ?? undefined,
  }));
}

/**
 * Fetch a source-attributed fluoride record for one county.
 */
export async function fetchCountyFluorideFromDb(
  countyName: string
): Promise<{ county: string; ppm: number; tier: "low" | "mod" | "high"; source: string } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("counties")
    .select("name, fluoride_ppm, risk_tier, source")
    .ilike("name", countyName)
    .maybeSingle();

  if (error) throw error;
  if (!data || !data.source || !Number.isFinite(Number(data.fluoride_ppm)) ||
      !["low", "mod", "high"].includes(data.risk_tier)) return null;

  return {
    county: data.name,
    ppm: Number(data.fluoride_ppm),
    tier: data.risk_tier,
    source: data.source,
  };
}

/**
 * Fetch the latest stored dataset snapshot.
 */
export async function fetchDatasetSummaryFromDb(): Promise<DatasetSummaryData | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("dataset_snapshots")
    .select("record_count, counties_covered, modalities, license, captured_at")
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    records: data.record_count,
    counties_covered: data.counties_covered,
    modalities: data.modalities || [],
    license: data.license || "Unspecified",
    last_ingestion: data.captured_at,
  };
}
