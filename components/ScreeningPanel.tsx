"use client";

import { useState } from "react";

const STAGES = [
  "Reading imaging signal...",
  "Pulling county fluoride reading...",
  "Checking genetic risk flag...",
  "Fusing multimodal signal...",
  "Complete.",
];

interface PredictResult {
  imaging_signal: number;
  environmental_signal: number;
  genetic_signal: number;
  fused_fluorosis_risk: number;
  tier: "low" | "mod" | "high";
  recommendation: string;
}

const tierFlag: Record<PredictResult["tier"], { label: string; className: string }[]> = {
  high: [
    { label: "High fluorosis risk", className: "bg-risk-high-wash text-risk-high" },
    { label: "Referral suggested", className: "bg-risk-mod-wash text-risk-mod" },
  ],
  mod: [
    { label: "Moderate risk", className: "bg-risk-mod-wash text-risk-mod" },
    { label: "Monitor", className: "bg-risk-low-wash text-risk-low" },
  ],
  low: [{ label: "Low risk", className: "bg-risk-low-wash text-risk-low" }],
};

const ringColor: Record<PredictResult["tier"], string> = {
  high: "#A8442E",
  mod: "#C68B2E",
  low: "#4A7C59",
};

export function ScreeningPanel() {
  const [age, setAge] = useState(34);
  const [county, setCounty] = useState("Nakuru");
  const [captured, setCaptured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [referred, setReferred] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    setResult(null);
    setStageIdx(0);

    for (let i = 0; i < STAGES.length; i++) {
      await new Promise((r) => setTimeout(r, 420));
      setStageIdx(i);
    }

    const res = await fetch("/api/risk/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ county, patientAge: age }),
    });
    const data = await res.json();
    setResult(data.output);
    setLoading(false);
  }

  function reset() {
    setCaptured(false);
    setResult(null);
    setReferred(false);
  }

  const circumference = 170;
  const offset = result
    ? circumference - (circumference * result.fused_fluorosis_risk) / 100
    : circumference;

  return (
    <section>
      <div className="mb-7 max-w-xl">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-clay">
          Layer 5 · Low-Resource AI Diagnostics
        </span>
        <h2 className="font-display text-3xl leading-tight">
          Screening interface for Community Health Promoters
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          This calls a live API route (<code>/api/risk/predict</code>) that fuses the
          intraoral image score with the patient&apos;s county-level water fluoride reading
          and a genetic flag, rather than scoring the image alone.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Left: capture + inputs */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-1 text-lg font-display font-semibold">New screening</h3>
          <p className="mb-4 text-sm text-ink-soft">
            Enter minimal patient context, capture an image, then run analysis.
          </p>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs text-ink-soft">Patient age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-ink-soft">County</label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm"
              >
                {["Nakuru", "Baringo", "Kajiado", "Nairobi", "Kericho", "Turkana"].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  )
                )}
              </select>
            </div>
          </div>

          <button
            onClick={() => setCaptured(true)}
            className={`relative mb-4 flex aspect-[4/3] w-full flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-line ${
              captured
                ? "bg-gradient-to-br from-[#F4E9DD] via-[#EADCC9] to-[#C7AE8B]"
                : "bg-[repeating-linear-gradient(135deg,#DCE7E4_0px,#E9F0EE_2px,#E9F0EE_26px)]"
            }`}
          >
            <div className="pointer-events-none absolute inset-3.5 rounded-lg border-2 border-teal/35" />
            <div className="z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-teal">
              <div className="h-4.5 w-4.5 rounded-full bg-teal" />
            </div>
            <div className="z-10 text-sm text-ink-soft">
              {captured ? "Image captured. Ready to analyze." : "Tap to simulate intraoral capture"}
            </div>
          </button>

          <button
            disabled={!captured || loading}
            onClick={runAnalysis}
            className="w-full rounded-lg bg-teal py-2.5 text-sm font-semibold text-white transition hover:bg-teal-bright disabled:opacity-50"
          >
            Run AI analysis
          </button>

          {loading && (
            <div className="mt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">
                <div
                  className="progress-fill-transition h-full rounded-full bg-gradient-to-r from-teal to-clay"
                  style={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }}
                />
              </div>
              <div className="mt-2 font-mono text-xs text-ink-soft">{STAGES[stageIdx]}</div>
            </div>
          )}
        </div>

        {/* Right: results */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-1 text-lg font-display font-semibold">Fused risk output</h3>
          <p className="mb-4 text-sm text-ink-soft">
            {result
              ? "Screening complete. Scores below feed the referral decision."
              : "Waiting for a screening to run."}
          </p>

          {result && (
            <>
              <div className="mb-4 flex flex-col gap-2.5">
                <SignalRow label="Imaging model" value={result.imaging_signal} color="#0B4F4A" />
                <SignalRow label="Water fluoride" value={result.environmental_signal} color="#B8703D" />
                <SignalRow label="Genetic flag" value={result.genetic_signal} color="#7A6BA8" />
              </div>

              <div className="flex items-center gap-4 rounded-xl bg-teal-wash p-4">
                <div className="relative h-16 w-16 flex-shrink-0">
                  <svg width="64" height="64" className="-rotate-90">
                    <circle cx="32" cy="32" r="27" stroke="#D9E3E0" strokeWidth="6" fill="none" />
                    <circle
                      cx="32"
                      cy="32"
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
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold text-teal">
                    {result.fused_fluorosis_risk}%
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-teal">
                    Fused fluorosis risk
                  </div>
                  <div className="mt-0.5 text-sm">{result.recommendation}</div>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2">
                {tierFlag[result.tier].map((f) => (
                  <span key={f.label} className={`rounded-full px-2.5 py-1 text-xs font-medium ${f.className}`}>
                    {f.label}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-2.5">
                <button
                  onClick={reset}
                  className="flex-1 rounded-lg border border-line py-2.5 text-sm font-semibold hover:border-teal hover:text-teal"
                >
                  New screening
                </button>
                <button
                  onClick={() => setReferred(true)}
                  disabled={referred}
                  className="flex-1 rounded-lg bg-teal py-2.5 text-sm font-semibold text-white hover:bg-teal-bright disabled:opacity-70"
                >
                  {referred ? "Sent to clinician queue" : "Flag for clinician review"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SignalRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr_46px] items-center gap-3">
      <span className="text-xs text-ink-soft">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-surface-alt">
        <div
          className="bar-fill-transition h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-right font-mono text-xs">{value}%</span>
    </div>
  );
}
