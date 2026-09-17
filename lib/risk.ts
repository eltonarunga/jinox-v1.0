import { getCounty } from "./data";

export interface RiskInput {
  county: string;
  imagingSignal?: number; // 0-100, from the imaging model; simulated if omitted
  geneticSignal?: number; // 0-100, from the genetic risk flag; simulated if omitted
}

export interface RiskOutput {
  imaging_signal: number;
  environmental_signal: number;
  genetic_signal: number;
  fused_fluorosis_risk: number;
  tier: "low" | "mod" | "high";
  recommendation: string;
}

// Weighted fusion of the three modalities. Environmental signal is derived
// deterministically from the county's groundwater fluoride reading, so a real
// deployment can swap in a live WRMA feed without changing this function's shape.
export function fuseRisk(input: RiskInput): RiskOutput {
  const county = getCounty(input.county);
  const envSignal = county
    ? Math.min(100, Math.round((county.ppm / 8) * 100))
    : 20;

  const imgSignal =
    input.imagingSignal ?? Math.round(40 + Math.random() * 45);
  const genSignal =
    input.geneticSignal ?? Math.round(10 + Math.random() * 55);

  const fused = Math.round(imgSignal * 0.45 + envSignal * 0.35 + genSignal * 0.2);

  let tier: RiskOutput["tier"] = "low";
  let recommendation =
    "Low risk across signals. Routine preventive guidance applies.";
  if (fused >= 65) {
    tier = "high";
    recommendation =
      "High confidence fluorosis risk. Recommend clinician confirmation and water source review.";
  } else if (fused >= 35) {
    tier = "mod";
    recommendation =
      "Moderate risk signal. Suggest preventive counseling and a follow-up screening in 6 months.";
  }

  return {
    imaging_signal: imgSignal,
    environmental_signal: envSignal,
    genetic_signal: genSignal,
    fused_fluorosis_risk: fused,
    tier,
    recommendation,
  };
}
