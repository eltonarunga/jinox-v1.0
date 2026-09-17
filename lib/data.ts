export type CountyRisk = "low" | "mod" | "high";

export interface County {
  name: string;
  ppm: number;
  level: CountyRisk;
  screened: number;
  referralRate: string;
}

// In a live deployment this table is read from Supabase (see supabase/schema.sql,
// table `counties`). Seeded here so the API routes and UI work with zero setup.
export const counties: County[] = [
  { name: "Nakuru", ppm: 4.8, level: "high", screened: 1240, referralRate: "18%" },
  { name: "Baringo", ppm: 6.1, level: "high", screened: 860, referralRate: "24%" },
  { name: "Kajiado", ppm: 5.2, level: "high", screened: 710, referralRate: "21%" },
  { name: "Kericho", ppm: 2.1, level: "mod", screened: 540, referralRate: "9%" },
  { name: "Nairobi", ppm: 0.8, level: "low", screened: 1980, referralRate: "3%" },
  { name: "Turkana", ppm: 3.6, level: "mod", screened: 410, referralRate: "14%" },
  { name: "Kisumu", ppm: 1.1, level: "low", screened: 670, referralRate: "4%" },
  { name: "Machakos", ppm: 2.6, level: "mod", screened: 590, referralRate: "11%" },
];

export const whoGuidelinePpm = 1.5;

export const modelPerformance = {
  model_version: "jinox-mm-0.3",
  auc: 0.85,
  evaluated_subgroups: ["county", "age_band", "gender"],
  min_subgroup_auc: 0.79,
};

export const datasetSummary = {
  records: 52340,
  counties_covered: 22,
  modalities: ["imaging", "clinical", "environmental", "genomic"],
  license: "open-academic-use",
};

// 18-month program targets from the grant proposal, with current pilot-phase progress.
export const dashboardStats = [
  { label: "Annotated records", current: "12,400", target: "50,000+", pct: 25 },
  { label: "Diagnostic AUC", current: "0.81", target: ">0.85", pct: 82 },
  { label: "Peer-reviewed outputs", current: "2", target: "6\u201310 papers", pct: 25 },
  { label: "Facilities onboarded", current: "9", target: "50+ facilities", pct: 18 },
  { label: "Patients screened", current: "18,600", target: "100,000+", pct: 19 },
  { label: "API institutions", current: "14", target: "200+ institutions", pct: 7 },
  { label: "Counties mapped", current: "8", target: "20+ counties", pct: 40 },
];

export function getCounty(name: string): County | undefined {
  return counties.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
