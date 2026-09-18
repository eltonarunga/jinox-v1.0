import { getCounty } from "./data";
import type { RiskInput, RiskOutput, RiskTier } from "./types";

export type { RiskInput, RiskOutput };

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Maps fused fluorosis score (0-100) to WHO Dean's Fluorosis Index and TFI score
function deriveClinicalStaging(fusedRisk: number): {
  deans_index: string;
  tfi_score: number;
  description: string;
} {
  if (fusedRisk >= 75) {
    return {
      deans_index: "Severe",
      tfi_score: Math.min(9, Math.round(6 + (fusedRisk - 75) / 8)),
      description: "Confluent pitting, widespread brown enamel stains, and structural loss.",
    };
  }
  if (fusedRisk >= 55) {
    return {
      deans_index: "Moderate",
      tfi_score: 5,
      description: "Pronounced opaque white striations with localized brown staining and micro-pitting.",
    };
  }
  if (fusedRisk >= 40) {
    return {
      deans_index: "Mild",
      tfi_score: 3,
      description: "White chalky opacities covering 25% to 50% of the tooth surface.",
    };
  }
  if (fusedRisk >= 25) {
    return {
      deans_index: "Very Mild",
      tfi_score: 2,
      description: "Faint paper-white flecks or thin horizontal lines across enamel peaks.",
    };
  }
  return {
    deans_index: "Normal / Questionable",
    tfi_score: 0,
    description: "Translucent enamel with no significant mottled opacities.",
  };
}

/**
 * Weighted multimodal fusion of intraoral imaging, environmental groundwater fluoride,
 * and genomic susceptibility flags.
 *
 * Weighting:
 * - 45% Intraoral visual feature extraction (CNN / ViT)
 * - 35% Environmental groundwater fluoride exposure level (County WRMA survey)
 * - 20% Craniofacial genetic susceptibility markers
 */
export function fuseRisk(input: RiskInput): RiskOutput {
  const county = getCounty(input.county);

  // Environmental signal derived from county fluoride reading (8 ppm = 100% saturation)
  const envSignal = county
    ? clamp(Math.round((county.ppm / 8) * 100), 0, 100)
    : 20;

  // If imagingSignal is supplied, validate & clamp; otherwise simulate with positive correlation to environmental signal
  const imgSignal =
    input.imagingSignal !== undefined
      ? clamp(Math.round(input.imagingSignal), 0, 100)
      : clamp(Math.round(25 + envSignal * 0.5 + Math.random() * 25), 5, 98);

  // If geneticSignal is supplied, validate & clamp; otherwise simulate standard population distribution
  const genSignal =
    input.geneticSignal !== undefined
      ? clamp(Math.round(input.geneticSignal), 0, 100)
      : clamp(Math.round(15 + Math.random() * 50), 5, 95);

  const fused = clamp(
    Math.round(imgSignal * 0.45 + envSignal * 0.35 + genSignal * 0.2),
    0,
    100
  );

  let tier: RiskTier = "low";
  let recommendation =
    "Low fluorosis risk detected. Patient exhibits normal mineralization. Recommend standard preventive oral hygiene and routine annual follow-up.";

  if (fused >= 65) {
    tier = "high";
    recommendation =
      "High-confidence fluorosis risk. Immediate referral for clinician confirmation, defluoridated or rainwater alternative water counseling, and topical remineralization assessment.";
  } else if (fused >= 35) {
    tier = "mod";
    recommendation =
      "Moderate fluorosis risk signal. Recommend dietary fluoride review, water testing, preventive dietary counseling, and follow-up screening within 6 months.";
  }

  const clinical_staging = deriveClinicalStaging(fused);

  return {
    imaging_signal: imgSignal,
    environmental_signal: envSignal,
    genetic_signal: genSignal,
    fused_fluorosis_risk: fused,
    tier,
    recommendation,
    clinical_staging,
  };
}
