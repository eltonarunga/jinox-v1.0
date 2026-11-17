import type {
  County,
  DashboardStatItem,
  DatasetSummaryData,
  ModelPerformanceData,
  RiskTier,
} from "./types";

export type { County, RiskTier };
export type CountyRisk = RiskTier;

// WHO water quality guideline threshold for fluoride (1.5 ppm / mg/L)
export const whoGuidelinePpm = 1.5;

// High endemic risk threshold for East African Rift Valley formations (4.0 ppm)
export const severeEndemicThresholdPpm = 4.0;

// DEMO FIXTURES ONLY — never use these values as surveillance, clinical, or research evidence.
// Public APIs must read source-attributed records from the configured database.
export const counties: County[] = [
  { name: "Nakuru", ppm: 4.8, level: "high", screened: 1240, referralRate: "18%", source: "WRMA water quality survey" },
  { name: "Baringo", ppm: 6.1, level: "high", screened: 860, referralRate: "24%", source: "WRMA water quality survey" },
  { name: "Kajiado", ppm: 5.2, level: "high", screened: 710, referralRate: "21%", source: "WRMA water quality survey" },
  { name: "Kericho", ppm: 2.1, level: "mod", screened: 540, referralRate: "9%", source: "WRMA water quality survey" },
  { name: "Nairobi", ppm: 0.8, level: "low", screened: 1980, referralRate: "3%", source: "Nairobi Water and Sewerage" },
  { name: "Turkana", ppm: 3.6, level: "mod", screened: 410, referralRate: "14%", source: "WRMA water quality survey" },
  { name: "Kisumu", ppm: 1.1, level: "low", screened: 670, referralRate: "4%", source: "Lake Victoria Basin Survey" },
  { name: "Machakos", ppm: 2.6, level: "mod", screened: 590, referralRate: "11%", source: "WRMA water quality survey" },
];

// Synthetic example metrics for isolated UI development only; not an evaluated model.
export const modelPerformance: ModelPerformanceData = {
  model_version: "jinox-mm-0.3",
  auc: 0.85,
  evaluated_subgroups: ["county", "age_band", "gender", "water_source"],
  min_subgroup_auc: 0.79,
  sensitivity: 0.84,
  specificity: 0.88,
  last_updated: "2026-08-15T00:00:00Z",
};

// Synthetic example counts for isolated UI development only; not a measured dataset.
export const datasetSummary: DatasetSummaryData = {
  records: 52340,
  counties_covered: 22,
  modalities: ["intraoral_imaging", "clinical_phenotypes", "groundwater_fluoride", "genomic_variants"],
  license: "open-academic-use (CC-BY-NC-SA 4.0)",
  last_ingestion: "2026-09-01T12:00:00Z",
};

// Synthetic product-planning targets only; these are not current operational results.
export const dashboardStats: DashboardStatItem[] = [
  { label: "Annotated records", current: "12,400", target: "50,000+", pct: 25, category: "research" },
  { label: "Diagnostic AUC", current: "0.85", target: ">0.85", pct: 85, category: "diagnostics" },
  { label: "Peer-reviewed outputs", current: "2", target: "6–10 papers", pct: 25, category: "research" },
  { label: "Facilities onboarded", current: "9", target: "50+ facilities", pct: 18, category: "operations" },
  { label: "Patients screened", current: "18,600", target: "100,000+", pct: 19, category: "community" },
  { label: "API institutions", current: "14", target: "200+ institutions", pct: 7, category: "research" },
  { label: "Counties mapped", current: "8", target: "20+ counties", pct: 40, category: "operations" },
];

export function getCounty(name: string): County | undefined {
  if (!name || typeof name !== "string") return undefined;
  const normalized = name.trim().toLowerCase();
  return counties.find((c) => c.name.toLowerCase() === normalized);
}

export function getAllCountyNames(): string[] {
  return counties.map((c) => c.name);
}

export function getFluorosisSummaryStats() {
  const totalScreened = counties.reduce((acc, c) => acc + (c.screened ?? 0), 0);
  const avgPpm = (counties.reduce((acc, c) => acc + c.ppm, 0) / counties.length).toFixed(2);
  const highRiskCount = counties.filter((c) => c.level === "high").length;
  return {
    totalScreened,
    avgPpm: Number(avgPpm),
    highRiskCount,
    countyCount: counties.length,
  };
}
