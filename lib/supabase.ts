import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { County, DatasetSummaryData, ModelPerformanceData, ScreeningRecord } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Read client (uses public anon key)
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

// Write client (uses service role key if available, else anon key)
export const supabaseAdmin: SupabaseClient | null =
  url && (serviceRoleKey || anonKey)
    ? createClient(url, serviceRoleKey || anonKey!)
    : null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

/**
 * Fetch all counties from Supabase with graceful fallback
 */
export async function fetchCountiesFromDb(): Promise<County[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("counties")
      .select("name, fluoride_ppm, risk_tier")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) return null;

    return data.map((item) => ({
      name: item.name,
      ppm: Number(item.fluoride_ppm),
      level: item.risk_tier,
      screened: 0,
      referralRate: item.risk_tier === "high" ? "20%" : item.risk_tier === "mod" ? "10%" : "3%",
      source: "Supabase Live Database",
    }));
  } catch (err) {
    console.warn("Error reading from Supabase counties table:", err);
    return null;
  }
}

/**
 * Fetch fluoride data for a specific county from Supabase
 */
export async function fetchCountyFluorideFromDb(
  countyName: string
): Promise<{ county: string; ppm: number; tier: "low" | "mod" | "high"; source: string } | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("counties")
      .select("name, fluoride_ppm, risk_tier, source")
      .ilike("name", countyName)
      .maybeSingle();

    if (error || !data) return null;

    return {
      county: data.name,
      ppm: Number(data.fluoride_ppm),
      tier: data.risk_tier,
      source: data.source || "Supabase Live Database",
    };
  } catch (err) {
    console.warn("Error reading county from Supabase:", err);
    return null;
  }
}

/**
 * Fetch latest model version performance from Supabase
 */
export async function fetchModelPerformanceFromDb(): Promise<ModelPerformanceData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("model_versions")
      .select("version, auc, min_subgroup_auc, evaluated_subgroups, released_at")
      .order("released_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      model_version: data.version,
      auc: Number(data.auc),
      min_subgroup_auc: Number(data.min_subgroup_auc || data.auc),
      evaluated_subgroups: data.evaluated_subgroups || [],
      last_updated: data.released_at,
    };
  } catch (err) {
    console.warn("Error reading model performance from Supabase:", err);
    return null;
  }
}

/**
 * Fetch dataset snapshot from Supabase
 */
export async function fetchDatasetSummaryFromDb(): Promise<DatasetSummaryData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("dataset_snapshots")
      .select("record_count, counties_covered, modalities, license, captured_at")
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      records: data.record_count,
      counties_covered: data.counties_covered,
      modalities: data.modalities || [],
      license: data.license || "open-academic-use",
      last_ingestion: data.captured_at,
    };
  } catch (err) {
    console.warn("Error reading dataset summary from Supabase:", err);
    return null;
  }
}

/**
 * Persist an anonymized screening event into Supabase
 */
export async function recordScreeningEvent(screening: ScreeningRecord): Promise<boolean> {
  const client = supabaseAdmin || supabase;
  if (!client) return false;

  try {
    const { error } = await client.from("screenings").insert({
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
