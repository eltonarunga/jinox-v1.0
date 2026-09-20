"use client";

import { useState } from "react";

const CODE_TEMPLATES = {
  curl: `# Transmit patient telemetry + borehole lookup
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
    }
  }'`,
  ts: `import { JinoXClient } from '@jinox/sdk';

const client = new JinoXClient({
  apiKey: process.env.JINOX_API_KEY
});

const prediction = await client.risk.predict({
  encounterId: 'ENC-NKR-2025-0891',
  location: { subCounty: 'Nakuru_West', fluoridePpm: 4.82 },
  telemetry: { ageYears: 11, mmp20Variant: true }
});`,
  python: `from jinox import DiagnosticEngine

engine = DiagnosticEngine(api_key="jinox_live_sec_892a01f")

inference = engine.predict_risk(
    encounter_id="ENC-NKR-2025-0891",
    fluoride_ppm=4.82,
    patient_age=11,
    mmp20_positive=True
)`,
};

export function ApiExplorerPanel() {
  const [activeSection, setActiveSection] = useState<"sandbox" | "model" | "dataset" | "roadmap">("sandbox");
  const [codeLang, setCodeLang] = useState<"curl" | "ts" | "python">("curl");
  const [fLevel, setFLevel] = useState<number>(4.82);
  const [age, setAge] = useState<number>(11);
  const [hasGenotype, setHasGenotype] = useState<boolean>(true);
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Computed inference outputs
  let tfiScore = 1;
  let badgeText = "NOMINAL / SAFE";
  let badgeClass = "px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold text-[11px]";
  let confidence = 94.1;

  if (fLevel > 4.0) {
    tfiScore = hasGenotype ? 6 : 5;
    badgeText = "SEVERE ENDEMIC ANOMALY";
    badgeClass = "px-2 py-0.5 rounded bg-error-container text-on-error-container font-bold text-[11px]";
    confidence = 97.2;
  } else if (fLevel > 1.5) {
    tfiScore = hasGenotype ? 4 : 3;
    badgeText = "ELEVATED THREAT";
    badgeClass = "px-2 py-0.5 rounded bg-surface-container text-on-surface font-bold text-[11px]";
    confidence = 92.5;
  }

  const rawJsonResponse = {
    status: "success",
    inference_epoch: "2025-05-18T14:22:01.492Z",
    fused_prediction: {
      deans_index: Math.min(4, Math.floor(tfiScore / 1.4)),
      tfi_score: tfiScore,
      confidence: confidence / 100,
      recommended_intervention:
        fLevel > 1.5
          ? ["Borehole Defluoridation Triggered", "Pediatric Resin Infiltration Protocol"]
          : ["Routine Annual Screening"],
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
      <div className="w-full px-gutter-desktop py-space-md max-w-[1720px] mx-auto flex flex-col gap-space-md">
        {/* Streamlined Top Control Header */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">
                api
              </span>
              Explorer Module Dropdown:
            </span>

            {/* Section Selection Dropdown */}
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value as any)}
              className="bg-surface-container-low text-on-surface font-label-md text-label-md px-3 py-1.5 rounded-lg border border-surface-container outline-none cursor-pointer font-bold"
            >
              <option value="sandbox">Interactive API Sandbox</option>
              <option value="model">Foundational Model Parity &amp; ROC</option>
              <option value="dataset">Open Data Commons</option>
              <option value="roadmap">Impact Governance Roadmap</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-secondary-container/50 text-on-secondary-container px-3 py-1 rounded-full font-data-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>REST API v2.4-edge Online</span>
          </div>
        </div>

        {/* SECTION 1: Interactive API Sandbox */}
        {activeSection === "sandbox" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md">
            {/* Left: Code Snippet & Request Inputs */}
            <div className="xl:col-span-6 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md font-bold text-on-surface uppercase">
                  Request Configuration
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value as any)}
                    className="bg-surface-container-low text-on-surface font-data-mono text-[11px] px-2 py-1 rounded-lg border border-surface-container"
                  >
                    <option value="curl">cURL</option>
                    <option value="ts">TypeScript SDK</option>
                    <option value="python">Python Client</option>
                  </select>

                  <button
                    onClick={handleCopyCode}
                    className="p-1 rounded text-on-surface-variant hover:text-on-surface"
                    title="Copy Snippet"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {copied ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>

              <pre className="bg-surface-container-low p-3 rounded-lg font-data-mono text-[11px] leading-relaxed overflow-x-auto text-on-surface border border-surface-container">
                {CODE_TEMPLATES[codeLang]}
              </pre>

              {/* Modifiers */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-surface-container-low rounded-lg border border-surface-container text-body-sm text-[12px]">
                <div>
                  <label className="block font-semibold mb-1">Aquifer F⁻ (ppm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fLevel}
                    onChange={(e) => setFLevel(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest px-2 py-1 rounded border border-surface-container font-data-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest px-2 py-1 rounded border border-surface-container font-data-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">MMP20 Genotype</label>
                  <select
                    value={hasGenotype ? "true" : "false"}
                    onChange={(e) => setHasGenotype(e.target.value === "true")}
                    className="w-full bg-surface-container-lowest px-2 py-1 rounded border border-surface-container font-data-mono"
                  >
                    <option value="true">Variant (+)</option>
                    <option value="false">Wild Type</option>
                  </select>
                </div>
              </div>

              {/* Clear Primary CTA */}
              <button
                className="w-full py-2.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
                onClick={triggerInference}
                disabled={isInferring}
              >
                <span className={`material-symbols-outlined text-[18px] ${isInferring ? "animate-spin" : ""}`}>
                  {isInferring ? "sync" : "play_arrow"}
                </span>
                <span>{isInferring ? "Computing Request..." : "Execute API Request"}</span>
              </button>
            </div>

            {/* Right: API Response Card */}
            <div className="xl:col-span-6 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md font-bold text-on-surface uppercase">
                  Response 200 OK
                </span>
                <span className={badgeClass}>{badgeText}</span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg space-y-2 border border-surface-container font-data-mono text-[12px]">
                <div className="flex justify-between items-baseline">
                  <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                    TFI Score: {tfiScore}
                  </span>
                  <span className="text-secondary font-bold">
                    Confidence: {confidence}%
                  </span>
                </div>
              </div>

              <pre className="bg-surface-container-low p-3 rounded-lg font-data-mono text-[11px] leading-relaxed overflow-x-auto text-on-surface border border-surface-container max-h-64">
                {JSON.stringify(rawJsonResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* SECTION 2: Model Validation */}
        {activeSection === "model" && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-4">
            <div className="font-headline-lg text-headline-lg font-bold text-on-surface border-b border-surface-container-low pb-2">
              Foundational Model Parity &amp; Subgroup Audit
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
                <span className="text-label-sm text-[11px] text-on-surface-variant uppercase font-semibold">ROC-AUC</span>
                <div className="font-display-lg text-display-lg font-bold text-on-surface">0.942</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
                <span className="text-label-sm text-[11px] text-on-surface-variant uppercase font-semibold">Sensitivity</span>
                <div className="font-display-lg text-display-lg font-bold text-on-surface">92.8%</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
                <span className="text-label-sm text-[11px] text-on-surface-variant uppercase font-semibold">Specificity</span>
                <div className="font-display-lg text-display-lg font-bold text-on-surface">95.1%</div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Open Data Commons */}
        {activeSection === "dataset" && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-4">
            <div className="font-headline-lg text-headline-lg font-bold text-on-surface border-b border-surface-container-low pb-2">
              Public Research Multimodal Dataset
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container space-y-1">
                <div className="font-bold text-on-surface">Modality 01: Intraoral Images</div>
                <div className="font-data-mono text-headline-lg font-bold text-secondary">42,850 Labeled</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container space-y-1">
                <div className="font-bold text-on-surface">Modality 02: WRMA Hydro-Telemetry</div>
                <div className="font-data-mono text-headline-lg font-bold text-secondary">185,420 Records</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container space-y-1">
                <div className="font-bold text-on-surface">Modality 03: Genotype Profiles</div>
                <div className="font-data-mono text-headline-lg font-bold text-secondary">1,200 Subjects</div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Impact Roadmap */}
        {activeSection === "roadmap" && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-4">
            <div className="font-headline-lg text-headline-lg font-bold text-on-surface border-b border-surface-container-low pb-2">
              Google.org AI for Science 18-Month Milestone Roadmap
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
                <span className="font-bold text-secondary">M1 (M1-M4): Field Edge Validation</span>
                <p className="text-body-sm text-body-sm text-on-surface-variant mt-1">
                  14 rural dispensaries deployed with mobile offline AI models.
                </p>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
                <span className="font-bold text-primary">M2 (M5-M8): Hydro-Telemetry Integration</span>
                <p className="text-body-sm text-body-sm text-on-surface-variant mt-1">
                  Automated telemetry ingestion pipelines from WRMA sensors.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
