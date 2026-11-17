import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { County, DatasetSummaryData, ModelPerformanceData, ScreeningRecord } from "./types";

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

  return data.map((item) => ({
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
  if (!data) return null;

  return {
    county: data.name,
    ppm: Number(data.fluoride_ppm),
    tier: data.risk_tier,
    source: data.source || "Source not recorded",
  };
}

/**
 * Fetch the latest stored model evaluation record.
 * Presence in the database does not by itself establish clinical validation.
 */
export async function fetchModelPerformanceFromDb(): Promise<ModelPerformanceData | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("model_versions")
    .select("version, auc, min_subgroup_auc, evaluated_subgroups, released_at")
    .order("released_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    model_version: data.version,
    auc: Number(data.auc),
    min_subgroup_auc: Number(data.min_subgroup_auc || data.auc),
    evaluated_subgroups: data.evaluated_subgroups || [],
    last_updated: data.released_at,
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

/**
 * Persist an anonymized screening event into Supabase.
 */
export async function recordScreeningEvent(screening: ScreeningRecord): Promise<boolean> {
  // Anonymous screening telemetry is explicitly allowed by the screenings RLS policy.
  // Keep this public endpoint on the anon client; never bypass RLS with a service-role key.
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("screenings").insert({
      patient_age: screening.patient_age,
      imaging_signal: screening.imaging_signal,
      environmental_signal: screening.environmental_signal,
      genetic_signal: screening.genetic_signal,
      fused_fluorosis_risk: screening.fused_fluorosis_risk,
      risk_tier: screening.risk_tier,
      referred_for_review: screening.referred_for_review,
    });

    if (error) {
      console.warn("Non-fatal: could not log screening to Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Non-fatal: exception logging screening to Supabase:", err);
    return false;
  }
}
