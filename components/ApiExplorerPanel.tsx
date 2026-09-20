"use client";

import { useState } from "react";

const CODE_TEMPLATES = {
  curl: `# Transmit multimodal patient telemetry + borehole lookup
curl -X POST https://api.jinox.ai/v1/risk/predict \\
  -H "Authorization: Bearer jinox_live_sec_892a01f" \\
  -H "Content-Type: application/json" \\
  -d '{
    "encounter_id": "ENC-NKR-2025-0891",
    "cohort_location": {
      "sub_county": "Nakuru_West",
      "borehole_ref": "WRMA-BH-40291",
      "water_source_fluoride_ppm": 4.82
    },
    "patient_telemetry": {
      "age_years": 11,
      "daily_water_intake_liters": 2.4,
      "mmp20_variant_detected": true
    },
    "edge_imaging": {
      "image_hash": "sha256:7e8a9bc0192f801e...",
      "camera_lux": 820
    }
  }'`,
  ts: `import { JinoXClient } from '@jinox/sdk';

const client = new JinoXClient({
  apiKey: process.env.JINOX_API_KEY,
  region: 'kenya-rift-valley-1'
});

// Run Multimodal Risk Inference
const prediction = await client.risk.predict({
  encounterId: 'ENC-NKR-2025-0891',
  location: {
    subCounty: 'Nakuru_West',
    boreholeRef: 'WRMA-BH-40291',
    fluoridePpm: 4.82
  },
  telemetry: {
    ageYears: 11,
    waterIntakeLiters: 2.4,
    mmp20Variant: true
  },
  imaging: {
    imageBuffer: rawIntraoralBuffer,
    lux: 820
  }
});

console.log('TFI Level:', prediction.fused.tfiScore);
console.log('Action:', prediction.interventions);`,
  python: `from jinox import DiagnosticEngine, PatientCohort

engine = DiagnosticEngine(
    api_key="jinox_live_sec_892a01f",
    failover_strategy="supabase_edge"
)

# Evaluate multimodal risk vector
inference = engine.predict_risk(
    encounter_id="ENC-NKR-2025-0891",
    sub_county="Nakuru_West",
    borehole_ref="WRMA-BH-40291",
    fluoride_ppm=4.82,
    patient_age=11,
    mmp20_positive=True,
    image_path="./sample_incisor_nakuru.jpg"
)

print(f"Dean's Index: {inference.deans_index}")
print(f"Model AUROC Confidence: {inference.confidence:.3f}")
for action in inference.recommended_actions:
    print(f" -> {action}")`,
};

export function ApiExplorerPanel() {
  const [codeLang, setCodeLang] = useState<"curl" | "ts" | "python">("curl");
  const [fLevel, setFLevel] = useState<number>(4.82);
  const [age, setAge] = useState<number>(11);
  const [hasGenotype, setHasGenotype] = useState<boolean>(true);
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Computed inference outputs
  let tfiScore = 1;
  let badgeText = "NOMINAL / SAFE";
  let badgeClass =
    "px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold text-label-sm";
  let confidence = 94.1;
  let hydroWeight = 30;
  let visionWeight = 50;
  let genomicWeight = 20;

  if (fLevel > 4.0) {
    tfiScore = hasGenotype ? 6 : 5;
    badgeText = "SEVERE ENDEMIC ANOMALY";
    badgeClass =
      "px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-bold text-label-sm";
    confidence = 97.2;
    hydroWeight = 58;
    visionWeight = 28;
    genomicWeight = 14;
  } else if (fLevel > 1.5) {
    tfiScore = hasGenotype ? 4 : 3;
    badgeText = "ELEVATED FLUOROSIS THREAT";
    badgeClass =
      "px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-bold text-label-sm";
    confidence = 92.5;
    hydroWeight = 42;
    visionWeight = 38;
    genomicWeight = 20;
  } else {
    tfiScore = 1;
    badgeText = "SAFE / LOW RISK";
    badgeClass =
      "px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold text-label-sm";
    confidence = 95.8;
    hydroWeight = 18;
    visionWeight = 70;
    genomicWeight = 12;
  }

  const rawJsonResponse = {
    status: "success",
    inference_epoch: "2025-05-18T14:22:01.492Z",
    fused_prediction: {
      deans_index: Math.min(4, Math.floor(tfiScore / 1.4)),
      tfi_score: tfiScore,
      confidence: confidence / 100,
      skeletal_threat_profile: fLevel > 3.0 ? "HIGH_ELEVATED" : "MODERATE_OBSERVE",
      recommended_intervention:
        fLevel > 1.5
          ? [
              "Borehole WRMA-BH Defluoridation Triggered",
              "Pediatric Enamel Resin Infiltration Protocol",
            ]
          : ["Routine Annual Rift Valley Community Screening"],
    },
    cryptographic_proof: {
      model_merkle_root: "0x9f48a1...d204",
      zk_fairness_verified: true,
    },
  };

  const triggerInference = () => {
    setIsInferring(true);
    setTimeout(() => {
      setIsInferring(false);
    }, 450);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_TEMPLATES[codeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full">
      <section className="w-full bg-surface-container-low px-gutter-desktop py-space-lg">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-sm font-data-mono text-data-mono text-on-surface-variant">
              <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-secondary font-bold">
                GOV.PILOT.LAYER-1-2
              </span>
              <span>Google.org AI for Science Impact Challenge</span>
              <span className="text-outline-variant">•</span>
              <span>Grant Ref: GORG-KE-2025-081</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              Open Telemetry, Model Performance &amp; Federated API Explorer
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
              Real-time technical nerve center evaluating the multimodal diagnostic engine for endemic dental fluorosis and aquifer vulnerability across the Kenya Rift Valley basin. Zero PII retention, cryptographically signed weights, and open research reproducibility.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="px-space-md py-space-xs rounded bg-surface-container-lowest shadow-sm flex items-center gap-space-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Runtime Status
                </div>
                <div className="font-data-mono text-data-mono text-on-surface font-semibold">
                  Supabase RLS • v2.4-edge
                </div>
              </div>
            </div>
            <div className="px-space-md py-space-xs rounded bg-surface-container-lowest shadow-sm flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                verified
              </span>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Audit Compliance
                </div>
                <div className="font-data-mono text-data-mono text-on-surface font-semibold">
                  CC-BY-NC-SA 4.0
                </div>
              </div>
            </div>
            <a
              className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-primary hover:bg-inverse-surface text-on-primary rounded font-label-md text-label-md shadow-sm transition-colors"
              href="#api-console"
            >
              <span className="material-symbols-outlined text-[18px]">
                terminal
              </span>
              Launch API Sandbox
            </a>
          </div>
        </div>
      </section>

      <div className="w-full px-gutter-desktop py-space-xl space-y-space-xl">
        {/* SECTION A: Foundational Model Validation */}
        <section className="space-y-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
            <div>
              <div className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                Section A • Diagnostic Core
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Foundational Model Validation &amp; Subgroup Parity
              </h2>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-1 rounded shadow-sm font-data-mono text-data-mono text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary text-[16px]">
                api
              </span>
              <span className="font-semibold text-on-surface">GET</span>
              <span>/api/model/performance</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-bold text-label-sm">
                200 OK
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {/* ROC-AUC Metric Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Primary Discrim. (ROC-AUC)
                </span>
                <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                  Rift Cohort
                </span>
              </div>
              <div className="my-space-sm flex items-baseline gap-space-sm">
                <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
                  0.942
                </span>
                <span className="font-data-mono text-data-mono text-secondary font-semibold">
                  ± 0.008 95% CI
                </span>
              </div>
              <div className="space-y-space-xs">
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: "94.2%" }}
                  ></div>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>n = 12,500 subjects</span>
                  <span>Nakuru &amp; Baringo</span>
                </div>
              </div>
            </div>
            {/* Sensitivity Metric Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Sensitivity (TFI ≥ 3)
                </span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-bold">
                  True Positive
                </span>
              </div>
              <div className="my-space-sm flex items-baseline gap-space-sm">
                <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
                  92.8%
                </span>
                <span className="font-data-mono text-data-mono text-on-surface-variant">
                  Thorkild-Fejerskov
                </span>
              </div>
              <div className="space-y-space-xs">
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: "92.8%" }}
                  ></div>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Severe enamel pitting</span>
                  <span>Recall: 0.93</span>
                </div>
              </div>
            </div>
            {/* Specificity Metric Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Robust Specificity
                </span>
                <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                  Field Lighting
                </span>
              </div>
              <div className="my-space-sm flex items-baseline gap-space-sm">
                <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
                  95.1%
                </span>
                <span className="font-data-mono text-data-mono text-secondary font-semibold">
                  Multi-ethnic tones
                </span>
              </div>
              <div className="space-y-space-xs">
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: "95.1%" }}
                  ></div>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Ambient direct sunlight</span>
                  <span>FP Rate: 4.9%</span>
                </div>
              </div>
            </div>
            {/* Equalized Odds Metric Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Fairness Ratio (Δ Odds)
                </span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-bold">
                  Equalized
                </span>
              </div>
              <div className="my-space-sm flex items-baseline gap-space-sm">
                <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
                  1.02
                </span>
                <span className="font-data-mono text-data-mono text-secondary font-semibold">
                  Target: 1.00 ±0.05
                </span>
              </div>
              <div className="space-y-space-xs">
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: "98.2%" }}
                  ></div>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Geo &amp; demographic bounds</span>
                  <span>Zero bias drift</span>
                </div>
              </div>
            </div>
          </div>
          {/* Deep Dive: Curve Analysis & Subgroup Fairness Table */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
            {/* ROC Curve & Calibration Chart Container */}
            <div className="xl:col-span-6 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-space-sm">
                <div>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    Receiver Operating Characteristic (ROC) &amp; Calibration
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Empirical performance vs. non-inferiority clinical standard (AUROC &gt; 0.85)
                  </p>
                </div>
                <span className="font-data-mono text-data-mono text-secondary bg-secondary-container px-space-xs py-0.5 rounded">
                  F1: 0.938
                </span>
              </div>
              <div className="relative w-full h-64 bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between">
                <svg
                  className="w-full h-full text-secondary"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 400 200"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="400"
                    y2="0"
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="1"
                  ></line>
                  <line
                    x1="0"
                    y1="50"
                    x2="400"
                    y2="50"
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="1"
                  ></line>
                  <line
                    x1="0"
                    y1="100"
                    x2="400"
                    y2="100"
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="1"
                  ></line>
                  <line
                    x1="0"
                    y1="150"
                    x2="400"
                    y2="150"
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="1"
                  ></line>
                  <line
                    x1="0"
                    y1="200"
                    x2="400"
                    y2="200"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="2"
                  ></line>
                  <line
                    x1="0"
                    y1="200"
                    x2="400"
                    y2="0"
                    stroke="#76777d"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  ></line>
                  <path
                    d="M 0 200 L 8 45 L 30 24 L 70 14 L 140 10 L 250 6 L 400 0 L 400 200 Z"
                    fill="currentColor"
                    fillOpacity="0.12"
                  ></path>
                  <path
                    d="M 0 200 Q 15 40, 70 18 T 180 8 T 400 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  ></path>
                  <circle cx="58" cy="22" r="5" fill="#000000"></circle>
                  <circle
                    cx="58"
                    cy="22"
                    r="9"
                    stroke="currentColor"
                    strokeOpacity="0.6"
                    strokeWidth="2"
                  ></circle>
                </svg>
                <div className="flex items-center justify-between font-data-mono text-data-mono text-on-surface-variant pt-space-xs">
                  <span>False Positive Rate (1 - Specificity)</span>
                  <span className="text-on-surface font-bold">
                    Optimal Cutoff: 0.42 [Sens: 92.8%, Spec: 95.1%]
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-space-sm pt-space-xs text-center font-data-mono">
                <div className="p-space-xs rounded bg-surface-container-low">
                  <div className="text-on-surface-variant font-label-sm text-label-sm">
                    Brier Score
                  </div>
                  <div className="text-on-surface font-bold text-body-md">
                    0.038
                  </div>
                </div>
                <div className="p-space-xs rounded bg-surface-container-low">
                  <div className="text-on-surface-variant font-label-sm text-label-sm">
                    Calibration Slope
                  </div>
                  <div className="text-on-surface font-bold text-body-md">
                    0.991
                  </div>
                </div>
                <div className="p-space-xs rounded bg-surface-container-low">
                  <div className="text-on-surface-variant font-label-sm text-label-sm">
                    Youden&apos;s J Index
                  </div>
                  <div className="text-on-surface font-bold text-body-md">
                    0.879
                  </div>
                </div>
              </div>
            </div>
            {/* Subgroup Fairness Audit Table */}
            <div className="xl:col-span-6 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-space-sm">
                <div>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    Subgroup Fairness Audit (WHO Rift Baseline)
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Independent cross-validation across demographic cohorts and hydro-geographic clusters
                  </p>
                </div>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-bold">
                  Zero PII
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-data-mono text-data-mono">
                  <thead>
                    <tr className="text-on-surface-variant border-b border-surface-container text-label-sm font-semibold">
                      <th className="py-space-xs px-space-sm">Cohort Group</th>
                      <th className="py-space-xs px-space-sm">Cohort Sample (n)</th>
                      <th className="py-space-xs px-space-sm">ROC-AUC</th>
                      <th className="py-space-xs px-space-sm">Sensitivity</th>
                      <th className="py-space-xs px-space-sm">Parity Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low text-on-surface">
                    <tr>
                      <td className="py-space-sm px-space-sm font-semibold">
                        Pediatric (Age 6–12)
                      </td>
                      <td className="py-space-sm px-space-sm">4,420</td>
                      <td className="py-space-sm px-space-sm text-secondary font-bold">
                        0.945
                      </td>
                      <td className="py-space-sm px-space-sm">93.4%</td>
                      <td className="py-space-sm px-space-sm">
                        <span className="text-secondary font-bold">+0.003</span> (Ref)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-sm font-semibold">
                        Adolescent (Age 13–18)
                      </td>
                      <td className="py-space-sm px-space-sm">3,890</td>
                      <td className="py-space-sm px-space-sm text-secondary font-bold">
                        0.941
                      </td>
                      <td className="py-space-sm px-space-sm">92.6%</td>
                      <td className="py-space-sm px-space-sm">
                        <span className="text-on-surface-variant">-0.001</span> (Parity)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-sm font-semibold">
                        Adult Cohort (Age 19–45)
                      </td>
                      <td className="py-space-sm px-space-sm">4,190</td>
                      <td className="py-space-sm px-space-sm text-secondary font-bold">
                        0.939
                      </td>
                      <td className="py-space-sm px-space-sm">92.1%</td>
                      <td className="py-space-sm px-space-sm">
                        <span className="text-on-surface-variant">-0.003</span> (Parity)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-sm font-semibold">
                        Nakuru Urban Basin
                      </td>
                      <td className="py-space-sm px-space-sm">6,100</td>
                      <td className="py-space-sm px-space-sm text-secondary font-bold">
                        0.944
                      </td>
                      <td className="py-space-sm px-space-sm">93.1%</td>
                      <td className="py-space-sm px-space-sm">
                        <span className="text-secondary font-bold">+0.002</span> (Parity)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-sm font-semibold">
                        Baringo Lowland Aquifer
                      </td>
                      <td className="py-space-sm px-space-sm">6,400</td>
                      <td className="py-space-sm px-space-sm text-secondary font-bold">
                        0.940
                      </td>
                      <td className="py-space-sm px-space-sm">92.5%</td>
                      <td className="py-space-sm px-space-sm">
                        <span className="text-on-surface-variant">-0.002</span> (Parity)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-space-sm bg-surface-container-low rounded-lg flex items-start gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                  verified_user
                </span>
                <span>
                  <strong>Fairness Certificate:</strong> Zero statistical divergence observed at α=0.01 threshold under demographic parity metric. Certified by Independent Bioethics Review Committee, Kenya Medical Research Institute (KEMRI/SERU/2024-918).
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION B: Public Research Dataset Summary */}
        <section className="space-y-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
            <div>
              <div className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                Section B • Open Data Commons
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Public Research Multimodal Dataset Summary
              </h2>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-1 rounded shadow-sm font-data-mono text-data-mono text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary text-[16px]">
                database
              </span>
              <span className="font-semibold text-on-surface">GET</span>
              <span>/api/dataset/summary</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-bold text-label-sm">
                200 OK
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
            {/* Modality 1: Intraoral Imagery */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between space-y-space-md">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">
                      photo_camera
                    </span>
                  </span>
                  <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-data-mono text-data-mono font-bold">
                    Modality 01
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold pt-space-xs">
                  Intraoral Surface Imaging
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  High-resolution standardized field photography covering maxillary and mandibular incisors, labeled via double-blind consensus by 4 calibrated pediatric dentists.
                </p>
              </div>
              <div className="space-y-space-sm pt-space-xs border-t border-surface-container-low">
                <div className="flex justify-between items-baseline">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Labeled Frames
                  </span>
                  <span className="font-data-mono text-headline-lg text-on-surface font-bold">
                    42,850
                  </span>
                </div>
                <div className="flex justify-between items-baseline font-body-sm text-body-sm text-on-surface-variant">
                  <span>Annotation Standard</span>
                  <span className="font-data-mono text-on-surface font-semibold">
                    Dean&apos;s Index + TFI (0-9)
                  </span>
                </div>
                <div className="flex justify-between items-baseline font-body-sm text-body-sm text-on-surface-variant">
                  <span>Inter-rater Reliability</span>
                  <span className="font-data-mono text-secondary font-semibold">
                    Cohen&apos;s κ = 0.914
                  </span>
                </div>
              </div>
              <div className="pt-space-xs">
                <span className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">
                    lock_open
                  </span>{" "}
                  Open Access Research Bucket (Parquet)
                </span>
              </div>
            </div>
            {/* Modality 2: Hydro-Telemetry Records */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between space-y-space-md">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">
                      water_drop
                    </span>
                  </span>
                  <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-data-mono text-data-mono font-bold">
                    Modality 02
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold pt-space-xs">
                  WRMA Hydro-Telemetry
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Groundwater telemetry synchronized directly from the Water Resources Management Authority (WRMA) sensor network, tracking fluoride concentrations, pH, and seasonal water table levels.
                </p>
              </div>
              <div className="space-y-space-sm pt-space-xs border-t border-surface-container-low">
                <div className="flex justify-between items-baseline">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Telemetry Ingest
                  </span>
                  <span className="font-data-mono text-headline-lg text-on-surface font-bold">
                    185,420
                  </span>
                </div>
                <div className="flex justify-between items-baseline font-body-sm text-body-sm text-on-surface-variant">
                  <span>Borehole Nodes Active</span>
                  <span className="font-data-mono text-on-surface font-semibold">
                    142 Loggers
                  </span>
                </div>
                <div className="flex justify-between items-baseline font-body-sm text-body-sm text-on-surface-variant">
                  <span>Telemetry Precision</span>
                  <span className="font-data-mono text-secondary font-semibold">
                    ± 0.05 mg/L F⁻ ISE
                  </span>
                </div>
              </div>
              <div className="pt-space-xs">
                <span className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">
                    sync
                  </span>{" "}
                  Real-Time Influx Pipeline Active
                </span>
              </div>
            </div>
            {/* Modality 3: De-identified Genomic Profiles */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between space-y-space-md">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">
                      genetics
                    </span>
                  </span>
                  <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-data-mono text-data-mono font-bold">
                    Modality 03
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold pt-space-xs">
                  Genomic &amp; Biomarker Profiles
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Targeted SNP assays screening amelogenin (AMELX) and matrix metalloproteinase-20 (MMP20) polymorphisms linked to heightened enamel susceptibility under identical fluoride doses.
                </p>
              </div>
              <div className="space-y-space-sm pt-space-xs border-t border-surface-container-low">
                <div className="flex justify-between items-baseline">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Subjects Genotyped
                  </span>
                  <span className="font-data-mono text-headline-lg text-on-surface font-bold">
                    1,200
                  </span>
                </div>
                <div className="flex justify-between items-baseline font-body-sm text-body-sm text-on-surface-variant">
                  <span>Target Loci Analyzed</span>
                  <span className="font-data-mono text-on-surface font-semibold">
                    18 Targeted SNPs
                  </span>
                </div>
                <div className="flex justify-between items-baseline font-body-sm text-body-sm text-on-surface-variant">
                  <span>Differential Privacy (ε)</span>
                  <span className="font-data-mono text-secondary font-semibold">
                    ε = 0.5 (Strict Safe)
                  </span>
                </div>
              </div>
              <div className="pt-space-xs">
                <span className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">
                    enhanced_encryption
                  </span>{" "}
                  Zero-Knowledge Sharded Tokens
                </span>
              </div>
            </div>
          </div>
          {/* Governance & Licensing Banner */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border-l-4 border-secondary">
            <div className="space-y-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Data Governance &amp; Research Ethics Framework
                </span>
                <span className="px-space-xs py-0.5 bg-surface-container rounded font-data-mono text-label-sm text-on-surface">
                  CC-BY-NC-SA-4.0
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Full compliance with Kenya Data Protection Act (2019) and HIPAA safe harbor de-identification. All spatial coordinate offsets randomly jittered within 500m radius to preserve community anonymity while preserving hydrological gradient validity. Row-Level Security (RLS) managed via Supabase auth claims.
              </p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0">
              <button className="px-space-md py-space-xs bg-surface-container hover:bg-surface-container-high rounded text-on-surface font-label-md text-label-md transition-colors flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Data Dictionary (YAML)
              </button>
              <button className="px-space-md py-space-xs bg-primary hover:bg-inverse-surface rounded text-on-primary font-label-md text-label-md transition-colors flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px]">
                  key
                </span>
                Request Research Access Key
              </button>
            </div>
          </div>
        </section>

        {/* SECTION C: Live Interactive API Playground */}
        <section className="space-y-space-md" id="api-console">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
            <div>
              <div className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                Section C • Edge Inference Interface
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Live Interactive API Playground: Multimodal Risk Fusion
              </h2>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-1 rounded shadow-sm font-data-mono text-data-mono">
              <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-bold text-label-sm">
                POST
              </span>
              <span className="text-on-surface font-semibold">
                /api/risk/predict
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md">
            {/* Left Column: Code Selector & Request Payload */}
            <div className="xl:col-span-6 bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="bg-surface-container-low px-space-md py-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <button
                    className={`px-space-sm py-1 rounded font-data-mono text-data-mono ${
                      codeLang === "curl"
                        ? "bg-surface-container-lowest text-on-surface font-bold shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setCodeLang("curl")}
                  >
                    cURL
                  </button>
                  <button
                    className={`px-space-sm py-1 rounded font-data-mono text-data-mono ${
                      codeLang === "ts"
                        ? "bg-surface-container-lowest text-on-surface font-bold shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setCodeLang("ts")}
                  >
                    TypeScript SDK
                  </button>
                  <button
                    className={`px-space-sm py-1 rounded font-data-mono text-data-mono ${
                      codeLang === "python"
                        ? "bg-surface-container-lowest text-on-surface font-bold shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setCodeLang("python")}
                  >
                    Python Client
                  </button>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button
                    className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors"
                    onClick={handleCopyCode}
                    title="Copy snippet"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {copied ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>
              {/* Code Snippet Display */}
              <div className="p-space-md bg-surface-container-lowest font-data-mono text-data-mono text-on-surface overflow-x-auto border-b border-surface-container-low">
                <pre className="text-label-sm leading-relaxed">
                  {CODE_TEMPLATES[codeLang]}
                </pre>
              </div>
              {/* Parameter Tweak Bar */}
              <div className="p-space-md space-y-space-sm bg-surface-container-low">
                <div className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">
                  Simulation Payload Modifiers
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface block mb-1">
                      Aquifer F⁻ (mg/L)
                    </label>
                    <input
                      className="w-full bg-surface-container-lowest px-space-sm py-1 rounded font-data-mono text-data-mono text-on-surface focus:outline-none"
                      type="number"
                      step="0.1"
                      value={fLevel}
                      onChange={(e) => setFLevel(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface block mb-1">
                      Age (Years)
                    </label>
                    <input
                      className="w-full bg-surface-container-lowest px-space-sm py-1 rounded font-data-mono text-data-mono text-on-surface focus:outline-none"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface block mb-1">
                      MMP20 Genotype
                    </label>
                    <select
                      className="w-full bg-surface-container-lowest px-space-sm py-1 rounded font-data-mono text-data-mono text-on-surface focus:outline-none"
                      value={hasGenotype ? "true" : "false"}
                      onChange={(e) => setHasGenotype(e.target.value === "true")}
                    >
                      <option value="true">Variant Present (High Risk)</option>
                      <option value="false">Wild Type (Neutral)</option>
                    </select>
                  </div>
                </div>
                <button
                  className="w-full py-space-sm bg-primary hover:bg-inverse-surface text-on-primary rounded font-label-md text-label-md transition-colors flex items-center justify-center gap-space-xs"
                  onClick={triggerInference}
                  disabled={isInferring}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isInferring ? "animate-spin" : ""
                    }`}
                  >
                    {isInferring ? "sync" : "play_arrow"}
                  </span>
                  <span>
                    {isInferring
                      ? "Running Tensor Core Inference..."
                      : "Execute In-Memory Diagnostic Inference"}
                  </span>
                </button>
              </div>
            </div>
            {/* Right Column: Fused Inference Response */}
            <div className="xl:col-span-6 bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="bg-surface-container-low px-space-md py-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-xs font-data-mono text-data-mono">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="font-semibold text-on-surface">
                    Response 200 OK
                  </span>
                  <span className="text-on-surface-variant font-normal">
                    • Ingestion: 26ms • Latency: 42ms
                  </span>
                </div>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-bold">
                  Edge Synthesized
                </span>
              </div>
              <div className="p-space-md bg-surface-container-lowest font-data-mono text-data-mono text-on-surface flex-1 overflow-y-auto space-y-space-md">
                {/* Structured Visual Result */}
                <div className="p-space-md rounded-lg bg-surface-container-low space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      Dean&apos;s Index Classification
                    </span>
                    <span className={badgeClass}>{badgeText}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-display-lg text-display-lg text-on-surface font-bold">
                        TFI {tfiScore}
                      </span>
                      <span className="text-on-surface-variant font-data-mono">
                        / Scale 0-9
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-label-sm text-on-surface-variant">
                        Combined Confidence
                      </div>
                      <div className="text-secondary font-bold text-headline-lg">
                        {confidence}%
                      </div>
                    </div>
                  </div>
                  {/* Risk Factor Contribution Breakdown */}
                  <div className="space-y-space-xs pt-space-xs border-t border-surface-container">
                    <div className="text-label-sm text-on-surface-variant font-semibold">
                      Multimodal Feature Attributions (Integrated Gradients)
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-label-sm">
                        <span className="text-on-surface">
                          Groundwater Fluoride Exceedance ({fLevel.toFixed(2)} mg/L)
                        </span>
                        <span className="font-bold text-secondary">
                          {hydroWeight}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-secondary h-full rounded-full"
                          style={{ width: `${hydroWeight}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-label-sm">
                        <span className="text-on-surface">
                          Computer Vision Enamel Opacity &amp; Pitting
                        </span>
                        <span className="font-bold text-on-surface">
                          {visionWeight}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${visionWeight}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-label-sm">
                        <span className="text-on-surface">
                          Genomic Amelogenin Susceptibility (MMP20)
                        </span>
                        <span className="font-bold text-outline">
                          {genomicWeight}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-outline h-full rounded-full"
                          style={{ width: `${genomicWeight}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Full Raw JSON Tree View */}
                <div className="space-y-space-xs">
                  <div className="text-label-sm text-on-surface-variant font-semibold uppercase">
                    Payload Representation (JSON)
                  </div>
                  <pre className="bg-surface-container-low p-space-sm rounded font-data-mono text-label-sm overflow-x-auto text-on-surface leading-relaxed">
                    {JSON.stringify(rawJsonResponse, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION D: 18-Month Google.org Milestone Tracker */}
        <section className="space-y-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
            <div>
              <div className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                Section D • Impact Governance
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                18-Month Google.org AI for Science Roadmap &amp; Progress
              </h2>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="font-data-mono text-data-mono text-on-surface-variant">
                Overall Execution: <strong>68.2%</strong>
              </span>
              <div className="w-32 bg-surface-container rounded-full h-2 overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-full"
                  style={{ width: "68.2%" }}
                ></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {/* Milestone 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between space-y-space-md border-t-4 border-secondary">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-data-mono text-label-sm font-bold">
                    M1 • M1–M4
                  </span>
                  <span className="flex items-center gap-1 font-label-sm text-label-sm text-secondary font-bold">
                    <span className="material-symbols-outlined text-[16px]">
                      check_circle
                    </span>{" "}
                    100%
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold pt-space-xs">
                  Field Edge Validation
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Deployment of offline-first mobile neural models across 14 primary rural dental dispensaries in Nakuru &amp; Baringo.
                </p>
              </div>
              <div className="space-y-space-xs pt-space-xs font-data-mono text-label-sm border-t border-surface-container-low">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Deliverable:</span>
                  <span className="text-on-surface font-semibold">
                    Android TFLite v1
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Audited Subjects:</span>
                  <span className="text-on-surface font-semibold">
                    12,500 Triaged
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>KEMRI Approval:</span>
                  <span className="text-secondary font-semibold">
                    Approved (Signed)
                  </span>
                </div>
              </div>
              <div className="w-full py-space-xs bg-secondary-container text-on-secondary-container rounded text-center font-label-sm text-label-sm font-bold uppercase tracking-wider">
                Completed &amp; Published
              </div>
            </div>
            {/* Milestone 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between space-y-space-md border-t-4 border-primary">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-data-mono text-label-sm font-bold">
                    M2 • M5–M8
                  </span>
                  <span className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>{" "}
                    85% Active
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold pt-space-xs">
                  Groundwater Telemetry Integration
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Automated ingestion pipelines coupling ion-selective electrode sensors directly into WRMA hydrological spatial GIS datastore.
                </p>
              </div>
              <div className="space-y-space-xs pt-space-xs font-data-mono text-label-sm border-t border-surface-container-low">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Sensor Nodes:</span>
                  <span className="text-on-surface font-semibold">
                    142 of 165 Online
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Sync Frequency:</span>
                  <span className="text-on-surface font-semibold">
                    15-minute telemetry
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Failover Node:</span>
                  <span className="text-secondary font-semibold">
                    Active in Nakuru
                  </span>
                </div>
              </div>
              <div className="w-full py-space-xs bg-surface-container text-on-surface rounded text-center font-label-sm text-label-sm font-bold uppercase tracking-wider">
                In Progress (Sprint 16)
              </div>
            </div>
            {/* Milestone 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between space-y-space-md border-t-4 border-outline-variant">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-data-mono text-label-sm font-bold">
                    M3 • M9–M14
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Upcoming
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold pt-space-xs">
                  WHO Rift Valley Field Pilot
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Peer-reviewed open publication of fused multimodal transformer &amp; deployment of clinical decision support with WHO Afro region.
                </p>
              </div>
              <div className="space-y-space-xs pt-space-xs font-data-mono text-label-sm border-t border-surface-container-low">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Target Target Cohort:</span>
                  <span className="text-on-surface font-semibold">
                    50,000 School-age
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Journal Submission:</span>
                  <span className="text-on-surface font-semibold">
                    Nature Digital Medicine
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>WHO Target Spec:</span>
                  <span className="text-on-surface font-semibold">
                    Protocol Rev 3.1
                  </span>
                </div>
              </div>
              <div className="w-full py-space-xs bg-surface-container-low text-on-surface-variant rounded text-center font-label-sm text-label-sm font-bold uppercase tracking-wider">
                Scheduled (Q3 2025)
              </div>
            </div>
            {/* Milestone 4 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between space-y-space-md border-t-4 border-outline-variant">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-data-mono text-label-sm font-bold">
                    M4 • M15–M18
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Upcoming
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold pt-space-xs">
                  National Health Rollout
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Kenya Ministry of Health federated integration, open API handover, and municipal water treatment trigger integration.
                </p>
              </div>
              <div className="space-y-space-xs pt-space-xs font-data-mono text-label-sm border-t border-surface-container-low">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Jurisdictions:</span>
                  <span className="text-on-surface font-semibold">
                    47 Counties Kenya
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Architecture:</span>
                  <span className="text-on-surface font-semibold">
                    Federated Edge Sync
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Sustainability:</span>
                  <span className="text-on-surface font-semibold">
                    MoH Managed
                  </span>
                </div>
              </div>
              <div className="w-full py-space-xs bg-surface-container-low text-on-surface-variant rounded text-center font-label-sm text-label-sm font-bold uppercase tracking-wider">
                Scheduled (Q1 2026)
              </div>
            </div>
          </div>
          {/* Institutional Sign-Off Card */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col lg:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-[24px]">
                  account_balance
                </span>
              </div>
              <div>
                <div className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Consortium Scientific Oversight Committee
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Joint Steering by University of Nairobi Dental School, Water Resources Authority, and Google.org Research Fellows.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-md font-data-mono text-data-mono text-on-surface-variant text-right shrink-0">
              <div>
                <div className="font-bold text-on-surface">Next Milestone Review</div>
                <div className="text-secondary font-semibold">June 28, 2025 • Nairobi Session</div>
              </div>
              <button className="px-space-md py-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-label-md text-label-md transition-colors">
                Download Audit Report (PDF)
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
