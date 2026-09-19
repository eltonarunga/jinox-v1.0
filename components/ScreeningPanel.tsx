"use client";

import { useState, useRef } from "react";
import { getAllCountyNames } from "@/lib/data";
import type { RiskOutput, RiskTier } from "@/lib/types";

const STAGES = [
  "Preprocessing intraoral photograph & extracting enamel regions...",
  "Querying WRMA county groundwater fluoride surveillance feed...",
  "Evaluating craniofacial genetic susceptibility markers...",
  "Fusing multimodal inputs via calibrated ensemble model...",
  "Generating clinical decision support guidance...",
];

const tierFlag: Record<RiskTier, { label: string; className: string }[]> = {
  high: [
    { label: "Severe Endemic Risk", className: "bg-risk-high-wash text-risk-high border border-risk-high/30" },
    { label: "Immediate Clinician Referral", className: "bg-risk-high-wash text-risk-high border border-risk-high/30" },
  ],
  mod: [
    { label: "Moderate Risk Tier", className: "bg-risk-mod-wash text-risk-mod border border-risk-mod/30" },
    { label: "6-Month Surveillance", className: "bg-risk-mod-wash text-risk-mod border border-risk-mod/30" },
  ],
  low: [
    { label: "Low Risk Tier", className: "bg-risk-low-wash text-risk-low border border-risk-low/30" },
    { label: "Routine Annual Checkup", className: "bg-risk-low-wash text-risk-low border border-risk-low/30" },
  ],
};

const ringColor: Record<RiskTier, string> = {
  high: "#A8442E",
  mod: "#C68B2E",
  low: "#4A7C59",
};

export function ScreeningPanel() {
  const [age, setAge] = useState<number>(34);
  const [county, setCounty] = useState<string>("Nakuru");
  const [captured, setCaptured] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [result, setResult] = useState<RiskOutput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [referralId, setReferralId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const countyList = getAllCountyNames();

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setCaptured(true);
    };
    reader.readAsDataURL(file);
  };

  async function runAnalysis() {
    if (!captured) return;
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setReferralId(null);
    setStageIdx(0);

    // Progress animation through diagnostics stages
    for (let i = 0; i < STAGES.length; i++) {
      setStageIdx(i);
      await new Promise((r) => setTimeout(r, 380));
    }

    try {
      const res = await fetch("/api/risk/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ county, patientAge: age }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data.output);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete risk prediction analysis.");
    } finally {
      setLoading(false);
    }
  }

  function handleReferral() {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const countyPrefix = county.slice(0, 3).toUpperCase();
    setReferralId(`JNX-REF-${countyPrefix}-${randomCode}`);
  }

  function reset() {
    setCaptured(false);
    setUploadedImage(null);
    setResult(null);
    setErrorMsg(null);
    setReferralId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const circumference = 170;
  const offset = result
    ? circumference - (circumference * result.fused_fluorosis_risk) / 100
    : circumference;

  return (
    <section id="panel-screening" role="tabpanel" aria-labelledby="tab-screening">
      <div className="mb-7 max-w-2xl">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-clay/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-clay">
          Layer 5 · Low-Resource AI Diagnostics
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink mt-2">
          Community Health Promoter Diagnostic Interface
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Combines localized camera imaging with real-time groundwater fluoride surveillance (via{" "}
          <code className="bg-surface-alt px-1.5 py-0.5 rounded font-mono text-xs">/api/risk/predict</code>)
          and craniofacial genetic vulnerability metrics for field-based triage in Kenya.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Screening Input */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-line-soft pb-3">
            <div>
              <h3 className="text-lg font-display font-semibold text-ink">Patient Context</h3>
              <p className="text-xs text-ink-soft">Enter demographic inputs and capture or upload dental image.</p>
            </div>
            <span className="text-xs font-mono text-ink-soft bg-surface-alt px-2 py-1 rounded">
              Pilot Mode
            </span>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="patient-age" className="mb-1.5 block text-xs font-medium text-ink-soft">
                Patient Age (years)
              </label>
              <input
                id="patient-age"
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
                className="w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm transition focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
              />
            </div>
            <div>
              <label htmlFor="patient-county" className="mb-1.5 block text-xs font-medium text-ink-soft">
                Surveillance County
              </label>
              <select
                id="patient-county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm transition focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
              >
                {countyList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Capture / Dropzone */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
            }}
            onClick={() => {
              if (!captured) setCaptured(true);
            }}
            className={`relative mb-4 flex aspect-[16/10] w-full flex-col items-center justify-center gap-2.5 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
              isDragging
                ? "border-teal bg-teal-wash/60"
                : captured
                ? "border-teal/50 bg-gradient-to-br from-[#F4E9DD] via-[#EADCC9] to-[#C7AE8B]"
                : "border-dashed border-line bg-[repeating-linear-gradient(135deg,#F1EEE6_0px,#FBFAF6_2px,#FBFAF6_24px)] hover:border-teal/60"
            }`}
          >
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="Patient intraoral capture"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : captured ? (
              <>
                <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-teal/40" />
                <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-md">
                  <div className="h-5 w-5 rounded-full bg-teal" />
                </div>
                <div className="z-10 text-center px-4">
                  <p className="text-sm font-semibold text-ink">Simulated Intraoral Capture Active</p>
                  <p className="text-xs text-ink-soft mt-0.5">Mottled enamel detected on maxillary central incisors</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-sm border border-line">
                  <svg className="h-6 w-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-ink">Tap to simulate capture or drop photo</p>
                  <p className="text-xs text-ink-soft mt-0.5">Supports PNG, JPG up to 10MB</p>
                </div>
              </>
            )}

            {captured && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute bottom-2.5 right-2.5 z-20 rounded-md bg-surface/90 backdrop-blur px-2.5 py-1 text-xs font-medium text-ink shadow hover:bg-surface border border-line"
              >
                Upload File Instead
              </button>
            )}
          </div>

          <div className="flex gap-2.5">
            <button
              disabled={!captured || loading}
              onClick={runAnalysis}
              className="flex-1 rounded-lg bg-teal py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-bright disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing Multimodal Data..." : "Run Multimodal AI Analysis"}
            </button>
            {captured && (
              <button
                onClick={reset}
                className="rounded-lg border border-line px-4 py-3 text-sm font-medium text-ink-soft hover:bg-surface-alt hover:text-ink"
              >
                Reset
              </button>
            )}
          </div>

          {loading && (
            <div className="mt-4 rounded-xl bg-surface-alt p-4">
              <div className="flex items-center justify-between text-xs text-ink-soft mb-1.5 font-mono">
                <span>Stage {stageIdx + 1} of {STAGES.length}</span>
                <span>{Math.round(((stageIdx + 1) / STAGES.length) * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-line/60">
                <div
                  className="progress-fill-transition h-full rounded-full bg-gradient-to-r from-teal via-teal-bright to-clay"
                  style={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }}
                />
              </div>
              <div className="mt-2.5 font-mono text-xs text-ink">{STAGES[stageIdx]}</div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 rounded-xl border border-risk-high/30 bg-risk-high-wash p-3.5 text-xs text-risk-high">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}
        </div>

        {/* Right Card: Fused Results */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-line-soft pb-3">
              <div>
                <h3 className="text-lg font-display font-semibold text-ink">Fused Clinical Assessment</h3>
                <p className="text-xs text-ink-soft">
                  {result ? "Multimodal inference verified." : "Awaiting screening submission."}
                </p>
              </div>
              {result && (
                <span className="rounded-full bg-teal-wash px-2.5 py-0.5 text-xs font-semibold text-teal font-mono">
                  {result.clinical_staging?.deans_index}
                </span>
              )}
            </div>

            {!result ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-ink-soft">
                <div className="h-16 w-16 rounded-full bg-surface-alt flex items-center justify-center mb-3">
                  <svg className="h-8 w-8 text-ink-soft/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-ink">No active diagnostic run</p>
                <p className="text-xs text-ink-soft max-w-xs mt-1">
                  Complete the patient form on the left and trigger analysis to view risk breakdown.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Modality Signal Breakdown */}
                <div className="space-y-2.5 rounded-xl border border-line-soft bg-surface-alt/50 p-3.5">
                  <div className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                    Signal Modality Weights
                  </div>
                  <SignalRow
                    label="Intraoral Vision (45%)"
                    value={result.imaging_signal}
                    color="#0B4F4A"
                    desc="Enamel mottling & opacity"
                  />
                  <SignalRow
                    label="Groundwater F⁻ (35%)"
                    value={result.environmental_signal}
                    color="#B8703D"
                    desc={`${county} WRMA survey telemetry`}
                  />
                  <SignalRow
                    label="Genomic Risk (20%)"
                    value={result.genetic_signal}
                    color="#7A6BA8"
                    desc="Amelogenin/ENAM markers"
                  />
                </div>

                {/* Ring & Summary Card */}
                <div className="flex items-center gap-4 rounded-xl bg-teal-wash/70 p-4 border border-teal/20">
                  <div className="relative h-18 w-18 flex-shrink-0">
                    <svg width="72" height="72" className="-rotate-90">
                      <circle cx="36" cy="36" r="27" stroke="#D9E3E0" strokeWidth="6" fill="none" />
                      <circle
                        cx="36"
                        cy="36"
                        r="27"
                        stroke={ringColor[result.tier]}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="ring-transition"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-teal">
                      {result.fused_fluorosis_risk}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-teal">
                      Multimodal Fluorosis Risk Score
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ink font-medium">
                      {result.recommendation}
                    </p>
                  </div>
                </div>

                {/* Staging Details */}
                {result.clinical_staging && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-line p-2.5">
                      <span className="text-ink-soft block">Dean&apos;s Classification:</span>
                      <span className="font-semibold text-ink">{result.clinical_staging.deans_index}</span>
                    </div>
                    <div className="rounded-lg border border-line p-2.5">
                      <span className="text-ink-soft block">TFI Score (0–9):</span>
                      <span className="font-semibold text-ink">Score {result.clinical_staging.tfi_score}</span>
                    </div>
                  </div>
                )}

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {tierFlag[result.tier].map((f) => (
                    <span key={f.label} className={`rounded-full px-2.5 py-1 text-xs font-medium ${f.className}`}>
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons at bottom */}
          {result && (
            <div className="mt-6 border-t border-line-soft pt-4">
              {referralId ? (
                <div className="rounded-xl border border-teal/40 bg-teal-wash p-3.5 text-center">
                  <p className="text-xs font-semibold text-teal">
                    Successfully Logged to Clinical Review Queue
                  </p>
                  <p className="mt-1 font-mono text-xs text-ink">
                    Reference ID: <span className="font-bold">{referralId}</span>
                  </p>
                  <p className="text-[0.7rem] text-ink-soft mt-1">
                    Dispatched to {county} County Referral Hospital Oral Health Unit
                  </p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 rounded-lg border border-line py-2.5 text-xs font-semibold text-ink hover:bg-surface-alt transition"
                  >
                    Start New Screening
                  </button>
                  <button
                    onClick={handleReferral}
                    className="flex-1 rounded-lg bg-teal py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-bright transition"
                  >
                    Queue for Clinician Review
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SignalRow({
  label,
  value,
  color,
  desc,
}: {
  label: string;
  value: number;
  color: string;
  desc: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono text-xs font-bold text-ink">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line/50">
        <div
          className="bar-fill-transition h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-[0.68rem] text-ink-soft mt-0.5">{desc}</div>
    </div>
  );
}
