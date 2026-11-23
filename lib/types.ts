export type RiskTier = "low" | "mod" | "high";

export interface County {
  name: string;
  ppm: number;
  level: RiskTier;
  screened?: number;
  referralRate?: string;
  source?: string;
}

export interface DatasetSummaryData {
  records: number;
  counties_covered: number;
  modalities: string[];
  license: string;
  last_ingestion?: string;
}
