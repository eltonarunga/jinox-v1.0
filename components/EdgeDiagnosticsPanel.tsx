"use client";

import { useState } from "react";

export function EdgeDiagnosticsPanel() {
  const [selectedCounty, setSelectedCounty] = useState<string>("nakuru");
  const [showBboxes, setShowBboxes] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [reportExported, setReportExported] = useState<boolean>(false);
  const [isQueued, setIsQueued] = useState<boolean>(false);

  // Dropdown states
  const [showSubjectDetails, setShowSubjectDetails] = useState<boolean>(false);
  const [showOverlayMenu, setShowOverlayMenu] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [showMarkersMenu, setShowMarkersMenu] = useState<boolean>(false);

  const handleReEstimate = () => {
    setIsComputing(true);
    setTimeout(() => {
      setIsComputing(false);
    }, 600);
  };

  const handleExport = () => {
    setReportExported(true);
    setTimeout(() => setReportExported(false), 2200);
  };

  const handleQueue = () => {
    setIsQueued(true);
    setTimeout(() => setIsQueued(false), 2200);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-gutter-desktop py-space-md max-w-[1720px] mx-auto flex flex-col gap-space-md">
        {/* Streamlined Top Command Bar */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-3 flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            {/* County Dropdown */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                location_on
              </span>
              <select
                className="bg-surface-container-low text-on-surface font-label-md text-label-md px-3 py-1.5 rounded-lg border border-surface-container outline-none cursor-pointer hover:bg-surface-container transition-colors"
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
              >
                <option value="nakuru">Nakuru (Rift Central Zone A)</option>
                <option value="baringo">Baringo (North Trough Basin)</option>
                <option value="naivasha">Naivasha (Lake Volcanic Graben)</option>
                <option value="turkana">Turkana (Lowland Thermal Aquifer)</option>
              </select>
            </div>

            <div className="h-5 w-px bg-surface-container hidden sm:block"></div>

            {/* Subject Metadata Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSubjectDetails(!showSubjectDetails)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors border border-surface-container"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  person
                </span>
                <span>Subject: #KEN-NK-8924</span>
                <span className="material-symbols-outlined text-[16px]">
                  expand_more
                </span>
              </button>

              {showSubjectDetails && (
                <div className="absolute left-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-3 z-50 space-y-2 text-body-sm text-[12px]">
                  <div className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold border-b border-surface-container-low pb-1">
                    Clinical Metadata
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Demographics:</span>
                    <span className="font-semibold text-on-surface">34 yrs • Female</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Exposure:</span>
                    <span className="font-semibold text-error">31 Yrs (Borehole BH-7A)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Triage Status:</span>
                    <span className="px-1.5 py-0.2 rounded bg-surface-container font-data-mono font-semibold">
                      Pass Complete
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edge Engine Live Badge */}
          <div className="flex items-center gap-2 bg-secondary-container/50 text-on-secondary-container px-3 py-1 rounded-full text-data-mono text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Edge MobileNetV4 Active</span>
          </div>
        </div>

        {/* Diagnostic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          {/* LEFT COLUMN: Intraoral Capture (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    photo_camera
                  </span>
                  Intraoral Viewport
                </span>

                {/* Overlay Options Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowOverlayMenu(!showOverlayMenu)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm border border-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      layers
                    </span>
                    <span>Overlay Options</span>
                    <span className="material-symbols-outlined text-[16px]">
                      expand_more
                    </span>
                  </button>

                  {showOverlayMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-2 z-50 space-y-1 text-label-sm text-[12px]">
                      <button
                        type="button"
                        onClick={() => setShowBboxes(!showBboxes)}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-surface-container-low text-on-surface text-left"
                      >
                        <span>Bounding Boxes</span>
                        <span className="font-bold text-secondary">
                          {showBboxes ? "Show" : "Hide"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-surface-container-low text-on-surface text-left"
                      >
                        <span>Lesion Heatmap</span>
                        <span className="font-bold text-secondary">
                          {showHeatmap ? "Show" : "Hide"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Viewport Image */}
              <div className="relative w-full aspect-[4/3] bg-on-primary-fixed rounded-lg overflow-hidden select-none">
                <img
                  className="w-full h-full object-cover"
                  alt="Macro clinical intraoral photograph"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI6Ba5JWJQy-lkpnvNO3HIJeJGO-Eya-aMyEry1SfMSZWcYi0PJwQlQArOFt1_pAH2ODK3KiIGpl8YRvAS3BMvamJZES0sFgSDdPCG5rif9oLOB1Lm-GnbGK8Nv-F_hA--QGvP8aNE0l5O__vHDUH7IlxkAy5ehF9q1iB7pGzS2xZpLCt5O6bIwd2VTi27mL_JrIU1qrNuInjFFzAiUwxwZOm9ZiK_NUYbfkn88Mh1Zv3XkCYcGyw"
                />

                {/* Bounding Box 1 */}
                <div
                  className={`absolute top-[28%] left-[24%] w-[26%] h-[42%] rounded border-2 border-secondary-fixed bg-secondary/15 p-1 transition-opacity ${
                    showBboxes ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span className="bg-secondary text-on-secondary font-data-mono text-[9px] px-1 rounded font-bold">
                    TFI-5 (94.8%)
                  </span>
                </div>

                {/* Bounding Box 2 */}
                <div
                  className={`absolute top-[32%] right-[22%] w-[28%] h-[38%] rounded border-2 border-error-container bg-error/15 p-1 transition-opacity ${
                    showBboxes ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span className="bg-error text-on-error font-data-mono text-[9px] px-1 rounded font-bold">
                    TFI-5 (88.1%)
                  </span>
                </div>

                {/* Heatmap Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-tr from-error/20 via-secondary/25 to-surface-variant/30 mix-blend-color-burn transition-opacity ${
                    showHeatmap ? "opacity-75" : "opacity-0"
                  }`}
                ></div>
              </div>

              {/* TFI Stage Gauge */}
              <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-label-sm text-[11px] text-on-surface-variant uppercase font-semibold">
                    Visual Enamel Severity
                  </div>
                  <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
                    72% Severity
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded bg-error text-on-error font-data-mono text-label-md font-bold">
                    TFI Stage 5
                  </span>
                  <div className="font-label-sm text-[11px] text-error font-medium mt-0.5">
                    Confluent Pitting
                  </div>
                </div>
              </div>

              {/* Extracted Markers Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMarkersMenu(!showMarkersMenu)}
                  className="w-full flex items-center justify-between bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-2 rounded-lg font-label-md text-label-md border border-surface-container transition-colors"
                >
                  <span className="font-bold">Extracted Morphological Markers</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {showMarkersMenu ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {showMarkersMenu && (
                  <div className="mt-2 grid grid-cols-2 gap-2 p-2 bg-surface-container-low rounded-lg border border-surface-container font-data-mono text-[11px]">
                    <div className="p-1.5 rounded bg-surface-container-lowest">
                      <span className="text-on-surface-variant block">Labial Striations:</span>
                      <span className="font-bold text-on-surface">Bilateral Parallels</span>
                    </div>
                    <div className="p-1.5 rounded bg-surface-container-lowest">
                      <span className="text-on-surface-variant block">Pitting:</span>
                      <span className="font-bold text-error">Discrete Focal Pits</span>
                    </div>
                    <div className="p-1.5 rounded bg-surface-container-lowest">
                      <span className="text-on-surface-variant block">Chromogenic:</span>
                      <span className="font-bold text-on-surface">Brown Hydration Ring</span>
                    </div>
                    <div className="p-1.5 rounded bg-surface-container-lowest">
                      <span className="text-on-surface-variant block">Symmetry:</span>
                      <span className="font-bold text-secondary">96.2% Match</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Multimodal Synthesis & CTAs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            {/* Multimodal Risk Hero Card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    hub
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    Multimodal Risk Fusion
                  </h2>
                </div>
                <span className="font-data-mono text-[11px] bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full font-bold">
                  Weight: 45 Visual : 35 Water : 20 Genetics
                </span>
              </div>

              {/* Fused Composite Score */}
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl">
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-surface-container-highest"
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                    ></circle>
                    <circle
                      className="text-secondary"
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                      stroke="currentColor"
                      strokeDasharray="163.6 263.9"
                      strokeLinecap="round"
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <span className="absolute font-display-lg text-[1.5rem] font-bold text-on-surface">
                    62%
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-bold uppercase">
                    Moderate-Severe Endemic Risk
                  </span>
                  <div className="font-headline-xl text-headline-xl text-on-surface font-bold">
                    Dean&apos;s Index: Moderate (TFI 5)
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    High fluoride exposure integrated with visual enamel disruption.
                  </p>
                </div>
              </div>

              {/* Technical Details Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full flex items-center justify-between bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-2 rounded-lg font-label-md text-label-md border border-surface-container transition-colors"
                >
                  <span>Technical Weight Breakdown &amp; Formula</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {showTechnicalDetails ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {showTechnicalDetails && (
                  <div className="mt-2 p-3 bg-surface-container-low rounded-lg border border-surface-container space-y-2 font-data-mono text-[11px]">
                    <div className="flex justify-between">
                      <span>1. Visual Enamel Signal (45%):</span>
                      <span className="font-bold text-error">72 / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Groundwater Sensor Signal (35%):</span>
                      <span className="font-bold text-error">60 / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3. Genetic Susceptibility (20%):</span>
                      <span className="font-bold text-secondary">45 / 100</span>
                    </div>
                    <div className="pt-2 border-t border-surface-container text-secondary font-bold text-center">
                      R_calibrated = (0.45 × 72) + (0.35 × 60) + (0.20 × 45) = 62.4%
                    </div>
                  </div>
                )}
              </div>

              {/* Protocol Recommendation */}
              <div className="bg-surface-container-low p-3 rounded-lg space-y-2">
                <div className="font-label-md text-label-md font-bold text-on-surface uppercase">
                  Autonomous Protocol Recommendation
                </div>
                <blockquote className="font-body-md text-body-md text-on-surface font-medium leading-relaxed italic border-l-2 border-secondary pl-3">
                  “Moderate fluorosis risk signal. Recommend dietary fluoride review, water testing, preventive counseling, and follow-up screening within 6 months.”
                </blockquote>
              </div>

              {/* Primary Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  className="flex-1 px-4 py-2.5 bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                  type="button"
                  onClick={handleExport}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {reportExported ? "download_done" : "ios_share"}
                  </span>
                  <span>
                    {reportExported ? "Report Exported!" : "Export Referral (JSON)"}
                  </span>
                </button>

                <button
                  className="px-4 py-2.5 bg-secondary text-on-secondary hover:bg-on-secondary-container font-label-md text-label-md font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                  type="button"
                  onClick={handleQueue}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isQueued ? "check" : "local_hospital"}
                  </span>
                  <span>
                    {isQueued ? "Queued (#REF-092)" : "Queue Hospital"}
                  </span>
                </button>

                <button
                  className="p-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-lg border border-surface-container transition-colors"
                  type="button"
                  onClick={handleReEstimate}
                  disabled={isComputing}
                  title="Re-run Inference"
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isComputing ? "animate-spin" : ""
                    }`}
                  >
                    refresh
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
