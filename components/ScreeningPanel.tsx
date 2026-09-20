"use client";

import { useState } from "react";

export function ScreeningPanel() {
  const [patientAge, setPatientAge] = useState<number>(11);
  const [selectedBorehole, setSelectedBorehole] = useState<string>("BH-40291");
  const [dailyIntake, setDailyIntake] = useState<number>(2.5);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedCount, setCapturedCount] = useState<number>(2);
  const [syncStatus, setSyncStatus] = useState<string>("Offline Cache");
  const [isSynced, setIsSynced] = useState<boolean>(false);

  // Checkboxes for Phenotype Observations
  const [phenotypes, setPhenotypes] = useState({
    mottledEnamel: true,
    brownStaining: true,
    microPitting: true,
    jointPain: true,
  });

  // Directives checklist
  const [directives, setDirectives] = useState({
    potableVoucher: true,
    cppAcpApplied: true,
    hospitalReferral: false,
    resamplingFlag: false,
  });

  const handleCaptureFrame = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      if (capturedCount < 4) {
        setCapturedCount((prev) => prev + 1);
      }
    }, 600);
  };

  const handleSyncCloud = () => {
    setSyncStatus("Syncing...");
    setTimeout(() => {
      setSyncStatus("Synced to Cloud");
      setIsSynced(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Field Session Context Banner */}
      <section className="w-full bg-surface-container-lowest border-b border-surface-container shadow-sm px-gutter-desktop py-space-md">
        <div className="max-w-[1720px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          {/* Session & Operator Details */}
          <div className="flex flex-wrap items-center gap-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  directions_car
                </span>
              </div>
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Unit Session
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span className="font-data-mono text-data-mono text-on-surface font-semibold">
                    Nakuru North / Rongai Sub-County
                  </span>
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  Sub-County Mobile Van #04 • Zone Kiamunyi Sector 3
                </div>
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container hidden md:block"></div>
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[20px]">
                  badge
                </span>
              </div>
              <div>
                <div className="font-label-md text-label-md text-on-surface font-semibold">
                  Mary Wanjiku, CHEW #4102
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant font-data-mono">
                  Kit: Otolux Intraoral 4K Wand v2.1 (Calibrated)
                </div>
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container hidden lg:block"></div>
            {/* Offline Sync Indicator */}
            <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                sync_saved_locally
              </span>
              <span className="font-data-mono text-data-mono text-on-surface font-medium">
                Offline Sync Active
              </span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-bold shadow-sm">
                14 Queued
              </span>
              <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant ml-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  battery_horiz_075
                </span>{" "}
                88%
              </span>
            </div>
          </div>
          {/* Active Patient Toolbar */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="bg-surface-container-low px-space-sm py-1 rounded flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Active Record
              </span>
              <span className="font-data-mono text-body-md text-on-surface font-bold">
                #RFT-2025-0984
              </span>
              <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] uppercase font-bold">
                Pediatric
              </span>
            </div>
            <button
              className="flex items-center gap-space-xs bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md px-space-sm py-1.5 rounded transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                qr_code_scanner
              </span>
              <span>Scan Health Card</span>
            </button>
            <button
              className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-1.5 rounded transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                person_add
              </span>
              <span>New Subject</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Tri-Pane Clinical Telemetry Layout */}
      <div className="w-full px-gutter-desktop py-space-lg max-w-[1720px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* ================= LEFT COLUMN: Patient Intake & Environmental Exposure ================= */}
          <aside className="lg:col-span-3 flex flex-col gap-space-md">
            {/* Patient Identity & Baseline */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-space-md py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-on-surface">
                    clinical_notes
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold tracking-tight">
                    Intake &amp; Demographics
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-data-mono">
                  Triage Phase 1
                </span>
              </div>
              <div className="p-space-md space-y-space-md">
                <div className="grid grid-cols-2 gap-space-sm">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-medium">
                      Age (Years)
                    </label>
                    <div className="bg-surface-container-low px-space-sm py-1.5 rounded flex items-center justify-between">
                      <input
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="font-data-mono text-body-md text-on-surface font-semibold bg-transparent w-16 focus:outline-none"
                      />
                      <span className="font-label-sm text-[10px] text-on-secondary-container bg-secondary-container px-1 rounded">
                        Primary
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-medium">
                      Biological Sex
                    </label>
                    <div className="bg-surface-container-low px-space-sm py-1.5 rounded">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        Female (F)
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-medium">
                    School / Ward Residency
                  </label>
                  <div className="bg-surface-container-low px-space-sm py-1.5 rounded flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      school
                    </span>
                    <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                      Kiamunyi Primary, Ward B
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-medium">
                    Rift Valley Lifelong Duration
                  </label>
                  <div className="flex items-center justify-between bg-surface-container-low px-space-sm py-1.5 rounded">
                    <span className="font-label-md text-label-md text-on-surface">
                      {patientAge} Consecutive Years
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Water Hydrology & Hydrogeological Telemetry */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-space-md py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    water_drop
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    WRMA Aquifer Signal
                  </span>
                </div>
                <span className="font-label-sm text-[10px] font-data-mono px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  GPS Matched
                </span>
              </div>
              <div className="p-space-md space-y-space-md">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Primary Borehole Source
                    </label>
                    <span className="font-data-mono text-label-sm text-secondary font-semibold">
                      ID: {selectedBorehole}
                    </span>
                  </div>
                  <select
                    value={selectedBorehole}
                    onChange={(e) => setSelectedBorehole(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md rounded px-space-sm py-1.5 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="BH-40291">
                      Borehole BH-40291 (Municipal / WRMA Active)
                    </option>
                    <option value="BH-02">
                      Menengai Crater Aquifer Well #02 (Unregulated)
                    </option>
                    <option value="BH-FEED">
                      Rongai Shallow Spring Feed (Seasonal)
                    </option>
                    <option value="BH-TAP">
                      Lake Nakuru Basin Water Project Tap
                    </option>
                  </select>
                </div>
                {/* Fluoride Alert Tile */}
                <div className="bg-error-container/40 p-space-sm rounded-lg flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-on-error-container">
                      <span className="material-symbols-outlined text-[18px]">
                        warning
                      </span>
                      <span className="font-label-md text-label-md font-bold">
                        7.2 ppm F⁻ Detected
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] uppercase font-bold text-on-error-container bg-error-container px-1.5 py-0.5 rounded">
                      Severe Endemic
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-error-container">
                    Exceeds WHO potable threshold (1.5 mg/L) by{" "}
                    <strong className="font-bold">380%</strong>. Highly corrosive to ameloblast mineralization in ages &lt;12.
                  </p>
                </div>
                {/* Daily Consumption Slider Display */}
                <div className="space-y-1">
                  <div className="flex justify-between text-body-sm font-body-sm">
                    <span className="text-on-surface-variant">
                      Daily Untreated Intake:
                    </span>
                    <span className="font-data-mono font-bold text-on-surface">
                      {dailyIntake} L / day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.1"
                    value={dailyIntake}
                    onChange={(e) => setDailyIntake(Number(e.target.value))}
                    className="w-full bg-surface-container h-2 rounded-full overflow-hidden accent-secondary cursor-pointer"
                  />
                  <div className="flex justify-between font-label-sm text-[10px] text-on-surface-variant">
                    <span>Low (&lt;1L)</span>
                    <span>Normative (1.5L)</span>
                    <span className="font-bold text-error">High (&gt;2.0L)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Phenotype & Biomarker Assays */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
              <div>
                <div className="bg-surface-container-low px-space-md py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[18px] text-on-surface">
                      checklist
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Phenotype Observation
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {Object.values(phenotypes).filter(Boolean).length}/4 Checked
                  </span>
                </div>
                <div className="p-space-md space-y-2.5">
                  <label className="flex items-start gap-space-sm cursor-pointer p-1.5 rounded hover:bg-surface-container-low transition-colors">
                    <input
                      type="checkbox"
                      checked={phenotypes.mottledEnamel}
                      onChange={(e) =>
                        setPhenotypes({ ...phenotypes, mottledEnamel: e.target.checked })
                      }
                      className="mt-0.5 accent-secondary rounded"
                    />
                    <span className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-medium">
                        Bilateral Mottled Enamel
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Opaque chalky striations across labial surface
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-space-sm cursor-pointer p-1.5 rounded hover:bg-surface-container-low transition-colors">
                    <input
                      type="checkbox"
                      checked={phenotypes.brownStaining}
                      onChange={(e) =>
                        setPhenotypes({ ...phenotypes, brownStaining: e.target.checked })
                      }
                      className="mt-0.5 accent-secondary rounded"
                    />
                    <span className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-medium">
                        Endemic Brown Staining
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Chromogenic iron-fluorapatite complex deposition
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-space-sm cursor-pointer p-1.5 rounded hover:bg-surface-container-low transition-colors">
                    <input
                      type="checkbox"
                      checked={phenotypes.microPitting}
                      onChange={(e) =>
                        setPhenotypes({ ...phenotypes, microPitting: e.target.checked })
                      }
                      className="mt-0.5 accent-secondary rounded"
                    />
                    <span className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-medium">
                        Micro-Pitting / Structural Loss
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Confluent surface breaches on #11 and #21
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-space-sm cursor-pointer p-1.5 rounded hover:bg-surface-container-low transition-colors">
                    <input
                      type="checkbox"
                      checked={phenotypes.jointPain}
                      onChange={(e) =>
                        setPhenotypes({ ...phenotypes, jointPain: e.target.checked })
                      }
                      className="mt-0.5 accent-secondary rounded"
                    />
                    <span className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-medium">
                        Joint / Skeletal Pain Flag
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Patient reports persistent stiffness in patellar region
                      </span>
                    </span>
                  </label>
                </div>
              </div>
              {/* Rapid Saliva Assay strip */}
              <div className="p-space-md pt-0">
                <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-error">
                      genetics
                    </span>
                    <div>
                      <div className="font-label-sm text-label-sm font-bold text-on-surface">
                        AMELX / MMP20 Dipstick
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        Rapid Saliva Biomarker
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-[10px] font-bold uppercase bg-error-container text-on-error-container px-2 py-0.5 rounded">
                      High Risk (+)
                    </span>
                    <div className="font-data-mono text-[11px] text-on-surface-variant">
                      Enamel Cleavage Altered
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ================= CENTER COLUMN: Live Intraoral Capture & Edge AI ================= */}
          <main className="lg:col-span-6 flex flex-col gap-space-md">
            {/* Capture Viewport Housing */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              {/* Viewport Header Toolbar */}
              <div className="bg-surface-container-low px-space-md py-2 flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-md">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Live 4K Wand Feed
                    </span>
                  </div>
                  <span className="h-4 w-px bg-surface-container"></span>
                  <span className="font-data-mono text-label-sm text-on-surface-variant">
                    820 Lux (Daylight Auto-Bal)
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button
                    className="p-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                    title="Heater Antifog"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      mode_heat
                    </span>
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-surface-container font-data-mono text-label-sm text-on-surface hover:bg-surface-container-high transition-colors"
                    type="button"
                  >
                    2.5x Zoom
                  </button>
                  <button
                    className="p-1 rounded bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Grid Toggle"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      grid_4x4
                    </span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      psychology
                    </span>
                    <span>Layer 5 Edge AI Active</span>
                  </button>
                </div>
              </div>
              {/* Main Live Frame Viewport */}
              <div className="relative w-full aspect-[4/3] bg-primary overflow-hidden flex items-center justify-center">
                {/* Simulated Dental Image Placeholder */}
                <img
                  className="w-full h-full object-cover select-none"
                  alt="Macro clinical photography of pediatric maxillary anterior teeth showing severe dental fluorosis."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDofz30K0OHJqOrTcHJa-moZNhT4BRiiqn7Q1piQ-AKIETy4t8L-tcG2XFk0TNfgAfSuVQtcJg3xgSDZsnoFBEospRYLt20dUT7Y6ZrCcb4Oy0sgsqoMe6LIzS_NMmqb_jpCenmN-2xLcbSO3SURNWrJDZ3ivMQHeS_HfNGPCQg6m1YBfkBgLLf6TJUX9swY_8n6oCUeoY85NZbOPkSpT9Fd0UaV4vpniBd1X6Sq8vMc27p1aBgmrI"
                />
                {/* Visual Reticle / Framing Overlay */}
                <div className="absolute inset-4 pointer-events-none border border-on-primary/20 rounded-lg flex flex-col justify-between p-2">
                  <div className="flex justify-between font-data-mono text-[10px] text-on-primary/80 uppercase">
                    <span>FOV: Maxillary Labial Quadrant 1-2</span>
                    <span>FPS: 60 | Shutter: 1/250s</span>
                  </div>
                  <div className="flex justify-between font-data-mono text-[10px] text-on-primary/80">
                    <span>Dist: 18.2mm</span>
                    <span>White Point: 5500K</span>
                  </div>
                </div>
                {/* Edge AI Bounding Box 1: Disruption */}
                <div className="absolute top-[28%] left-[22%] w-[32%] h-[36%] border-2 border-secondary bg-secondary/10 rounded pointer-events-auto cursor-pointer group shadow-sm">
                  <div className="absolute -top-7 left-0 bg-secondary text-on-secondary px-2 py-0.5 rounded font-data-mono text-[11px] font-bold whitespace-nowrap flex items-center gap-1 shadow-sm">
                    <span>Ameloblast Disruption</span>
                    <span className="bg-surface-container-lowest text-secondary px-1 rounded text-[9px]">
                      94.2%
                    </span>
                  </div>
                  <div className="hidden group-hover:block absolute bottom-1 left-1 bg-surface-container-lowest text-on-surface font-data-mono text-[10px] p-1.5 rounded shadow-md border border-surface-container">
                    <div>Area: 28.4mm²</div>
                    <div>Density: High Subsurface Porosity</div>
                  </div>
                </div>
                {/* Edge AI Bounding Box 2: Micro-Pits */}
                <div className="absolute top-[35%] right-[25%] w-[26%] h-[28%] border-2 border-error bg-error/10 rounded pointer-events-auto cursor-pointer group shadow-sm">
                  <div className="absolute -top-7 left-0 bg-error text-on-error px-2 py-0.5 rounded font-data-mono text-[11px] font-bold whitespace-nowrap flex items-center gap-1 shadow-sm">
                    <span>Micro-Pits TFI 5</span>
                    <span className="bg-surface-container-lowest text-error px-1 rounded text-[9px]">
                      89.1%
                    </span>
                  </div>
                  <div className="hidden group-hover:block absolute bottom-1 left-1 bg-surface-container-lowest text-on-surface font-data-mono text-[10px] p-1.5 rounded shadow-md border border-surface-container">
                    <div>Depth: ~180μm Loss</div>
                    <div>Pitting: Confluent Cluster</div>
                  </div>
                </div>
                {/* Heatmap Gradient Calibration Tag */}
                <div className="absolute bottom-3 right-3 bg-primary/80 backdrop-blur-md px-2.5 py-1 rounded text-on-primary font-data-mono text-[11px] flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                  <span>Model: EdgeMobileNet-Fluorosis-v2.4</span>
                </div>
              </div>
              {/* Capture & Retake Command Strip */}
              <div className="p-space-md bg-surface-container-low flex items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <button
                    className="flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md px-space-md py-2 rounded shadow-sm transition-colors"
                    type="button"
                    onClick={() => setCapturedCount(0)}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      replay
                    </span>
                    <span>Retake</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md px-space-md py-2 rounded shadow-sm transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      blur_on
                    </span>
                    <span>Segmentation Heatmap</span>
                  </button>
                </div>
                <button
                  className="flex-1 max-w-xs flex items-center justify-center gap-space-sm bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg py-2.5 px-space-lg rounded shadow transition-all active:scale-[0.98]"
                  type="button"
                  onClick={handleCaptureFrame}
                  disabled={isCapturing}
                >
                  <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
                    {isCapturing ? "sync" : "photo_camera"}
                  </span>
                  <span className="font-bold">
                    {isCapturing ? "Processing..." : "Capture Frame"}
                  </span>
                  <span className="font-data-mono text-label-sm bg-surface-container/20 text-on-primary px-1.5 py-0.5 rounded ml-1">
                    [Space]
                  </span>
                </button>
              </div>
            </div>

            {/* Multi-Angle Tooth Capture Queue (Thumbnail Carousel) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Standard 4-View Capture Strip
                </span>
                <span className="font-data-mono text-label-sm text-on-surface-variant">
                  Completed: {capturedCount} / 4 Views
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                {/* Thumbnail 1: Maxillary Labial (Active & Verified) */}
                <div
                  className={`relative rounded-lg overflow-hidden bg-surface-container-high p-1 ${
                    capturedCount >= 1 ? "ring-2 ring-secondary" : ""
                  }`}
                >
                  <div className="relative aspect-[4/3] rounded overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="Close up clinical view of anterior maxillary teeth"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjDTkDxAx72Ln7X5L7MCFO1BABdIty1gWZ2Iw2qmsiZJpA2fDp43SBVGuA6czLR_F9nlG-ffI0a_Sw8zn4fi5rMq5p4mvXGvCokkwc2i7Zw2B8WiW3pOP1U-Gz5DLteHW3HcXpUjJByiQRkD_X5IAdNp2R5gO90MoCdvfSDW7SYlNXC4DMrNGdr7MhCetWQIPvXfUGN5Pj36ZPMMW_ifJ1aVDJmJ79XcPD0-Kq4SD9ABXXUExrgFQ"
                    />
                    {capturedCount >= 1 && (
                      <div className="absolute top-1 right-1 bg-secondary text-on-secondary w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="mt-1 px-1 flex justify-between items-center font-label-sm text-[11px]">
                    <span className="font-semibold text-on-surface truncate">
                      1. Maxillary Labial
                    </span>
                    <span className="text-secondary font-bold">
                      {capturedCount >= 1 ? "Done" : "Ready"}
                    </span>
                  </div>
                </div>
                {/* Thumbnail 2: Mandibular Labial (Captured) */}
                <div className="relative rounded-lg overflow-hidden bg-surface-container p-1 hover:bg-surface-container-high transition-colors cursor-pointer">
                  <div className="relative aspect-[4/3] rounded overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="Lower mandibular anterior teeth"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxlAgR8oowKR2ovdWCK8yK6JmzoHiFo5p83yEUuqOErnt27-bWhiERl8K14l2Ptf11Xy8nXGexPYkrDNXVGjS9AIkXgrDGn4jThwTdwHpgtL3MIbNYgVhQB3i6ZPuw7h8AKbjU3cTg2w9HaIF0vHCOfmrwXpHZU6ZWRanLtCKaIuotiKLdpOFGuEk6rEYfCg1CS4vX6l2Zyr3sdNPWbNsz-XXdG6zDV13Qib537WxprpGLTai--CI"
                    />
                    {capturedCount >= 2 && (
                      <div className="absolute top-1 right-1 bg-secondary text-on-secondary w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="mt-1 px-1 flex justify-between items-center font-label-sm text-[11px]">
                    <span className="font-semibold text-on-surface truncate">
                      2. Mandibular Labial
                    </span>
                    <span className="text-secondary font-bold">
                      {capturedCount >= 2 ? "Done" : "Ready"}
                    </span>
                  </div>
                </div>
                {/* Thumbnail 3: Lingual Occlusal (Ready to capture) */}
                <div className="relative rounded-lg overflow-hidden bg-surface-container-low p-1 border-2 border-dashed border-secondary/60 flex flex-col justify-between">
                  <div className="aspect-[4/3] rounded bg-surface-container-high flex flex-col items-center justify-center text-center p-2">
                    <span className="material-symbols-outlined text-[24px] text-secondary animate-pulse">
                      camera_alt
                    </span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant font-medium mt-1">
                      {capturedCount >= 3 ? "Captured" : "Ready"}
                    </span>
                  </div>
                  <div className="mt-1 px-1 flex justify-between items-center font-label-sm text-[11px]">
                    <span className="font-semibold text-on-surface truncate">
                      3. Lingual Occlusal
                    </span>
                    <span className="font-data-mono text-secondary font-bold">
                      {capturedCount >= 3 ? "Done" : "Active"}
                    </span>
                  </div>
                </div>
                {/* Thumbnail 4: Right Molar Quadrant (Pending) */}
                <div className="relative rounded-lg overflow-hidden bg-surface-container-low p-1 opacity-75">
                  <div className="aspect-[4/3] rounded bg-surface-container flex flex-col items-center justify-center text-center p-2">
                    <span className="material-symbols-outlined text-[22px] text-on-surface-variant">
                      hourglass_top
                    </span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant font-medium mt-1">
                      {capturedCount >= 4 ? "Captured" : "Pending"}
                    </span>
                  </div>
                  <div className="mt-1 px-1 flex justify-between items-center font-label-sm text-[11px]">
                    <span className="font-semibold text-on-surface-variant truncate">
                      4. Right Molar
                    </span>
                    <span className="font-data-mono text-on-surface-variant">
                      {capturedCount >= 4 ? "Done" : "Wait"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* ================= RIGHT COLUMN: Diagnostic Decision Support & Protocols ================= */}
          <aside className="lg:col-span-3 flex flex-col gap-space-md">
            {/* Instant Multimodal Fusion Result */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-space-md py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-on-surface">
                    account_tree
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Multimodal AI Fusion
                  </span>
                </div>
                <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-error text-on-error font-bold uppercase tracking-wider">
                  Tier 3 Alert
                </span>
              </div>
              <div className="p-space-md flex flex-col gap-space-md">
                {/* Circular Gauge & Composite Metric */}
                <div className="flex items-center gap-space-md">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-surface-container stroke-current"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3.5"
                      ></path>
                      <path
                        className="text-error stroke-current"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeDasharray="78, 100"
                        strokeLinecap="round"
                        strokeWidth="3.8"
                      ></path>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="font-display-lg text-headline-xl text-on-surface font-extrabold leading-none">
                        78<span className="text-label-md font-normal">%</span>
                      </span>
                      <span className="font-label-sm text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
                        Severe Risk
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-label-md text-label-md text-on-surface font-bold">
                      Composite Fluorosis Load
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                      Integrates optical tooth enamel disruption, regional hydrogeology, and host biomarkers.
                    </p>
                  </div>
                </div>
                {/* Signal Contribution Breakdown Bars */}
                <div className="space-y-2 bg-surface-container-low p-space-sm rounded-lg">
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface mb-1">
                      <span>Edge Intraoral Image Signal</span>
                      <span className="font-data-mono font-bold">
                        82 / 100{" "}
                        <span className="text-on-surface-variant font-normal">
                          (45% wt)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div className="bg-error h-full rounded-full w-[82%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface mb-1">
                      <span>WRMA Borehole Water Signal</span>
                      <span className="font-data-mono font-bold">
                        74 / 100{" "}
                        <span className="text-on-surface-variant font-normal">
                          (35% wt)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div className="bg-error/80 h-full rounded-full w-[74%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface mb-1">
                      <span>Genetic / Salivary Marker</span>
                      <span className="font-data-mono font-bold">
                        70 / 100{" "}
                        <span className="text-on-surface-variant font-normal">
                          (20% wt)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full w-[70%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Epidemiological Staging & Dean's Index */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-space-md py-2 flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Epidemiological Staging
                </span>
                <span className="font-data-mono text-label-sm text-on-surface-variant">
                  WHO Standards
                </span>
              </div>
              <div className="p-space-md space-y-space-sm">
                <div className="bg-surface-container-low p-space-sm rounded flex items-center justify-between">
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">
                      WHO Dean&apos;s Index
                    </div>
                    <div className="font-label-md text-label-md text-on-surface font-bold">
                      Severe Fluorosis (Grade 5)
                    </div>
                  </div>
                  <span className="font-display-lg text-headline-lg font-extrabold text-error">
                    5.0
                  </span>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">
                      Thylstrup-Fejerskov Index (TFI)
                    </span>
                    <span className="font-data-mono text-label-sm font-bold text-on-surface">
                      Score 5-6
                    </span>
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface font-medium">
                    Distinct pitting with coalescent subsurface enamel loss and severe widespread brown pigment banding.
                  </div>
                </div>
              </div>
            </div>

            {/* Mandated Field Intervention Protocol Checklist */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
              <div>
                <div className="bg-surface-container-low px-space-md py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      task_alt
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Field Triage Directives
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">
                    {Object.values(directives).filter(Boolean).length}/4 Complete
                  </span>
                </div>
                <div className="p-space-md space-y-2">
                  <label className="flex items-start gap-space-sm p-1.5 rounded bg-surface-container-low cursor-pointer">
                    <input
                      type="checkbox"
                      checked={directives.potableVoucher}
                      onChange={(e) =>
                        setDirectives({ ...directives, potableVoucher: e.target.checked })
                      }
                      className="mt-0.5 accent-secondary rounded"
                    />
                    <span className="flex-1 font-body-sm text-body-sm text-on-surface font-medium">
                      Fluoride-Free Potable Voucher Issued (Nakuru Safe Station #12)
                    </span>
                  </label>
                  <label className="flex items-start gap-space-sm p-1.5 rounded bg-surface-container-low cursor-pointer">
                    <input
                      type="checkbox"
                      checked={directives.cppAcpApplied}
                      onChange={(e) =>
                        setDirectives({ ...directives, cppAcpApplied: e.target.checked })
                      }
                      className="mt-0.5 accent-secondary rounded"
                    />
                    <span className="flex-1 font-body-sm text-body-sm text-on-surface font-medium">
                      High-Concentration Topical CPP-ACP Remineralization Applied
                    </span>
                  </label>
                  <label className="flex items-start gap-space-sm p-1.5 rounded bg-surface-container-lowest border border-surface-container cursor-pointer hover:bg-surface-container-low transition-colors">
                    <input
                      type="checkbox"
                      checked={directives.hospitalReferral}
                      onChange={(e) =>
                        setDirectives({ ...directives, hospitalReferral: e.target.checked })
                      }
                      className="mt-0.5 accent-secondary rounded"
                    />
                    <span className="flex-1 font-body-sm text-body-sm text-on-surface">
                      Referral to Nakuru Provincial Hospital for Icon® Micro-Infiltration
                    </span>
                  </label>
                  <label className="flex items-start gap-space-sm p-1.5 rounded bg-surface-container-lowest border border-surface-container cursor-pointer hover:bg-surface-container-low transition-colors">
                    <input
                      type="checkbox"
                      checked={directives.resamplingFlag}
                      onChange={(e) =>
                        setDirectives({ ...directives, resamplingFlag: e.target.checked })
                      }
                      className="mt-0.5 accent-secondary rounded"
                    />
                    <span className="flex-1 font-body-sm text-body-sm text-on-surface">
                      WRMA Borehole BH-40291 Resampling Inspection Flag Dispatched
                    </span>
                  </label>
                </div>
              </div>
              {/* Final Sync & Submission Actions */}
              <div className="p-space-md pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-space-sm">
                  <button
                    className="flex items-center justify-center gap-1 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md py-2 rounded shadow-sm transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      save
                    </span>
                    <span>Offline Cache</span>
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md py-2 rounded shadow-sm transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      picture_as_pdf
                    </span>
                    <span>Triage Card</span>
                  </button>
                </div>
                <button
                  className={`w-full flex items-center justify-center gap-space-sm ${
                    isSynced ? "bg-secondary" : "bg-primary hover:bg-primary-container"
                  } text-on-primary font-label-lg text-label-lg py-3 rounded shadow transition-all active:scale-[0.99]`}
                  type="button"
                  onClick={handleSyncCloud}
                >
                  <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
                    {isSynced ? "cloud_done" : "cloud_upload"}
                  </span>
                  <span className="font-bold">{syncStatus}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
