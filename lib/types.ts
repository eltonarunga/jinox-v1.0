export type RiskTier = "low" | "mod" | "high";

export interface County {
  name: string;
  ppm: number;
  level: RiskTier;
  screened: number;
  referralRate: string;
  source?: string;
}

export interface RiskInput {
  county: string;
  patientAge?: number;
  imagingSignal?: number; // 0-100 score from intraoral imaging AI model
  geneticSignal?: number; // 0-100 genetic susceptibility score
}

export interface RiskOutput {
  imaging_signal: number;
  environmental_signal: number;
  genetic_signal: number;
  fused_fluorosis_risk: number;
  tier: RiskTier;
  recommendation: string;
  clinical_staging?: {
    deans_index: string;
    tfi_score: number;
    description: string;
  };
}

export interface PredictResponse {
  input: {
    county: string;
    patient_age: number | null;
    modalities_used: string[];
    timestamp: string;
  };
  output: RiskOutput;
  data_source: "supabase" | "mock";
}

export interface ModelPerformanceData {
  model_version: string;
  auc: number;
  evaluated_subgroups: string[];
  min_subgroup_auc: number;
  sensitivity?: number;
  specificity?: number;
  last_updated?: string;
}

export interface DatasetSummaryData {
  records: number;
  counties_covered: number;
  modalities: string[];
  license: string;
  last_ingestion?: string;
}

export interface DashboardStatItem {
  label: string;
  current: string;
  target: string;
  pct: number;
  category: "diagnostics" | "operations" | "research" | "community";
}

export interface ScreeningRecord {
  id?: string;
  county_id?: string;
  county_name?: string;
  patient_age?: number;
  imaging_signal: number;
  environmental_signal: number;
  genetic_signal: number;
  fused_fluorosis_risk: number;
  risk_tier: RiskTier;
  referred_for_review: boolean;
  created_at?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
