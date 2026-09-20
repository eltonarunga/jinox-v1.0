"use client";

import { useState } from "react";

export function ScreeningPanel() {
  const [patientAge, setPatientAge] = useState<number>(11);
  const [selectedBorehole, setSelectedBorehole] = useState<string>("BH-40291");
  const [dailyIntake, setDailyIntake] = useState<number>(2.5);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedCount, setCapturedCount] = useState<number>(2);
  const [syncStatus, setSyncStatus] = useState<string>("Offline Cache (14 Queued)");
  const [isSynced, setIsSynced] = useState<boolean>(false);

  // Accordion / Collapsible state
  const [showSessionDetails, setShowSessionDetails] = useState<boolean>(false);
  const [showOverlayMenu, setShowOverlayMenu] = useState<boolean>(false);
  const [showPhenotypeMenu, setShowPhenotypeMenu] = useState<boolean>(false);
  const [showDirectivesMenu, setShowDirectivesMenu] = useState<boolean>(false);

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
    setSyncStatus("Syncing to Cloud...");
    setTimeout(() => {
      setSyncStatus("Synced to Cloud");
      setIsSynced(true);
    }, 1200);
  };

  const activePhenotypeCount = Object.values(phenotypes).filter(Boolean).length;
  const activeDirectivesCount = Object.values(directives).filter(Boolean).length;

  return (
    <div className="flex flex-col w-full">
      {/* Minimalist Field Session Context Banner */}
      <section className="w-full bg-surface-container-lowest border-b border-surface-container px-gutter-desktop py-3">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-space-md">
          {/* Active Patient Identity Badge */}
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Active Subject:
              </span>
              <span className="font-data-mono text-body-md text-on-surface font-bold">
                #RFT-2025-0984
              </span>
              <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] uppercase font-bold">
                Pediatric
              </span>
            </div>

            {/* Session Info Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSessionDetails(!showSessionDetails)}
                className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface font-label-md text-label-md px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  info
                </span>
                <span>Session Context</span>
                <span className="material-symbols-outlined text-[16px]">
                  expand_more
                </span>
              </button>

              {showSessionDetails && (
                <div className="absolute left-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-3 z-50 space-y-2.5 text-body-sm text-[12px]">
                  <div className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold border-b border-surface-container-low pb-1">
                    Mobile Unit &amp; Operator Details
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Van Unit:</span>
                    <span className="font-semibold text-on-surface">
                      Rongai Mobile Van #04
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Operator:</span>
                    <span className="font-semibold text-on-surface">
                      Mary Wanjiku (CHEW #4102)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Intraoral Wand:</span>
                    <span className="font-data-mono text-on-surface font-semibold">
                      Otolux 4K v2.1
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-surface-container-low">
                    <span className="text-on-surface-variant">Sync State:</span>
                    <span className="font-data-mono text-secondary font-bold">
                      Offline Cache (14 Queued)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-space-sm">
            <button
              className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md px-3 py-1.5 rounded-lg transition-colors border border-surface-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                qr_code_scanner
              </span>
              <span>Scan QR</span>
            </button>
            <button
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-4 py-1.5 rounded-lg transition-colors shadow-sm font-semibold"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                person_add
              </span>
              <span>New Patient</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Tri-Pane Clinical Telemetry Layout */}
      <div className="w-full px-gutter-desktop py-space-md max-w-[1720px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          {/* ================= LEFT COLUMN: Patient Intake & Exposure ================= */}
          <aside className="lg:col-span-3 flex flex-col gap-space-md">
            {/* Patient Demographics Card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    clinical_notes
                  </span>
                  Intake Profile
                </span>
                <span className="font-data-mono text-[11px] text-on-surface-variant">
                  Phase 1 Triage
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1 font-medium">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full bg-surface-container-low px-2.5 py-1.5 rounded-lg font-data-mono text-body-md text-on-surface font-bold border border-surface-container focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1 font-medium">
                    Biological Sex
                  </label>
                  <div className="bg-surface-container-low px-2.5 py-1.5 rounded-lg font-label-md text-label-md text-on-surface font-semibold border border-surface-container">
                    Female (F)
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1 font-medium">
                  School / Ward Location
                </label>
                <div className="bg-surface-container-low px-2.5 py-1.5 rounded-lg font-body-sm text-body-sm text-on-surface font-medium border border-surface-container truncate">
                  Kiamunyi Primary, Ward B
                </div>
              </div>
            </div>

            {/* Hydrogeological Water Source Dropdown Section */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    water_drop
                  </span>
                  Water Source &amp; Exposure
                </span>
                <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-[10px] font-bold">
                  7.2 ppm F⁻
                </span>
              </div>

              <div>
                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1 font-medium">
                  Primary Water Source Dropdown
                </label>
                <select
                  value={selectedBorehole}
                  onChange={(e) => setSelectedBorehole(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg px-2.5 py-2 border border-surface-container focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
                >
                  <option value="BH-40291">Borehole BH-40291 (Municipal Intake)</option>
                  <option value="BH-02">Menengai Well #02 (Unregulated)</option>
                  <option value="BH-FEED">Rongai Shallow Spring Feed</option>
                  <option value="BH-TAP">Lake Nakuru Basin Water Tap</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">Untreated Daily Intake:</span>
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
                  className="w-full bg-surface-container h-1.5 rounded-full accent-secondary cursor-pointer"
                />
              </div>
            </div>

            {/* Phenotype Checklist Dropdown / Menu */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    checklist
                  </span>
                  Clinical Phenotypes
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-data-mono text-[11px] font-semibold">
                  {activePhenotypeCount} / 4 Selected
                </span>
              </div>

              {/* Phenotypes Dropdown Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPhenotypeMenu(!showPhenotypeMenu)}
                  className="w-full flex items-center justify-between bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-2 rounded-lg font-label-md text-label-md border border-surface-container transition-colors"
                >
                  <span>Select Phenotype Symptoms</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {showPhenotypeMenu ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {showPhenotypeMenu && (
                  <div className="mt-2 space-y-2 p-2 bg-surface-container-low rounded-lg border border-surface-container">
                    <label className="flex items-center gap-2 text-body-sm text-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={phenotypes.mottledEnamel}
                        onChange={(e) =>
                          setPhenotypes({ ...phenotypes, mottledEnamel: e.target.checked })
                        }
                        className="accent-secondary rounded"
                      />
                      <span>Bilateral Mottled Enamel</span>
                    </label>
                    <label className="flex items-center gap-2 text-body-sm text-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={phenotypes.brownStaining}
                        onChange={(e) =>
                          setPhenotypes({ ...phenotypes, brownStaining: e.target.checked })
                        }
                        className="accent-secondary rounded"
                      />
                      <span>Endemic Brown Staining</span>
                    </label>
                    <label className="flex items-center gap-2 text-body-sm text-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={phenotypes.microPitting}
                        onChange={(e) =>
                          setPhenotypes({ ...phenotypes, microPitting: e.target.checked })
                        }
                        className="accent-secondary rounded"
                      />
                      <span>Micro-Pitting Structural Loss</span>
                    </label>
                    <label className="flex items-center gap-2 text-body-sm text-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={phenotypes.jointPain}
                        onChange={(e) =>
                          setPhenotypes({ ...phenotypes, jointPain: e.target.checked })
                        }
                        className="accent-secondary rounded"
                      />
                      <span>Joint / Skeletal Stiffness Flag</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ================= CENTER COLUMN: Live Intraoral Capture ================= */}
          <main className="lg:col-span-6 flex flex-col gap-space-md">
            {/* Camera Stage */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden flex flex-col">
              {/* Camera Header Toolbar */}
              <div className="bg-surface-container-low px-4 py-2 flex items-center justify-between border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    4K Wand Live Stream
                  </span>
                </div>

                {/* Overlay Options Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowOverlayMenu(!showOverlayMenu)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors border border-surface-container"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      tune
                    </span>
                    <span>Camera Options</span>
                    <span className="material-symbols-outlined text-[16px]">
                      expand_more
                    </span>
                  </button>

                  {showOverlayMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-2 z-50 space-y-1 text-label-sm text-[12px]">
                      <button className="w-full flex items-center justify-between p-2 rounded hover:bg-surface-container-low text-on-surface text-left">
                        <span>Antifog Lens Heater</span>
                        <span className="text-secondary font-bold">ON</span>
                      </button>
                      <button className="w-full flex items-center justify-between p-2 rounded hover:bg-surface-container-low text-on-surface text-left">
                        <span>Zoom Level</span>
                        <span className="font-data-mono font-bold">2.5x</span>
                      </button>
                      <button className="w-full flex items-center justify-between p-2 rounded hover:bg-surface-container-low text-on-surface text-left">
                        <span>Alignment Grid</span>
                        <span className="text-on-surface-variant">Active</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Viewport Image */}
              <div className="relative w-full aspect-[4/3] bg-primary overflow-hidden flex items-center justify-center">
                <img
                  className="w-full h-full object-cover select-none"
                  alt="Macro clinical photography of pediatric maxillary anterior teeth"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDofz30K0OHJqOrTcHJa-moZNhT4BRiiqn7Q1piQ-AKIETy4t8L-tcG2XFk0TNfgAfSuVQtcJg3xgSDZsnoFBEospRYLt20dUT7Y6ZrCcb4Oy0sgsqoMe6LIzS_NMmqb_jpCenmN-2xLcbSO3SURNWrJDZ3ivMQHeS_HfNGPCQg6m1YBfkBgLLf6TJUX9swY_8n6oCUeoY85NZbOPkSpT9Fd0UaV4vpniBd1X6Sq8vMc27p1aBgmrI"
                />

                {/* Layer 5 Bounding Box Overlay */}
                <div className="absolute top-[28%] left-[22%] w-[32%] h-[36%] border-2 border-secondary bg-secondary/10 rounded pointer-events-auto cursor-pointer group shadow-sm">
                  <div className="absolute -top-6 left-0 bg-secondary text-on-secondary px-2 py-0.5 rounded font-data-mono text-[10px] font-bold">
                    Disruption 94.2%
                  </div>
                </div>

                <div className="absolute top-[35%] right-[25%] w-[26%] h-[28%] border-2 border-error bg-error/10 rounded pointer-events-auto cursor-pointer group shadow-sm">
                  <div className="absolute -top-6 left-0 bg-error text-on-error px-2 py-0.5 rounded font-data-mono text-[10px] font-bold">
                    Micro-Pits TFI 5
                  </div>
                </div>
              </div>

              {/* Main Capture Frame CTA Strip */}
              <div className="p-4 bg-surface-container-low flex items-center justify-between gap-4 border-t border-surface-container">
                <button
                  className="bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md px-4 py-2 rounded-lg border border-surface-container transition-colors"
                  type="button"
                  onClick={() => setCapturedCount(0)}
                >
                  Retake All
                </button>

                <button
                  className="flex-1 max-w-sm flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg py-2.5 px-6 rounded-lg shadow-sm font-bold transition-all active:scale-[0.99]"
                  type="button"
                  onClick={handleCaptureFrame}
                  disabled={isCapturing}
                >
                  <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
                    {isCapturing ? "sync" : "photo_camera"}
                  </span>
                  <span>{isCapturing ? "Processing..." : "Capture Frame"}</span>
                </button>
              </div>
            </div>

            {/* View Capture Carousel */}
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-container shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Capture Carousel (4 Views)
                </span>
                <span className="font-data-mono text-label-sm text-on-surface-variant">
                  Completed: {capturedCount} / 4
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div
                  className={`relative rounded-lg overflow-hidden border p-1 ${
                    capturedCount >= 1 ? "border-secondary bg-secondary-container/20" : "border-surface-container bg-surface-container-low"
                  }`}
                >
                  <div className="aspect-[4/3] rounded overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="1. Maxillary Labial"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjDTkDxAx72Ln7X5L7MCFO1BABdIty1gWZ2Iw2qmsiZJpA2fDp43SBVGuA6czLR_F9nlG-ffI0a_Sw8zn4fi5rMq5p4mvXGvCokkwc2i7Zw2B8WiW3pOP1U-Gz5DLteHW3HcXpUjJByiQRkD_X5IAdNp2R5gO90MoCdvfSDW7SYlNXC4DMrNGdr7MhCetWQIPvXfUGN5Pj36ZPMMW_ifJ1aVDJmJ79XcPD0-Kq4SD9ABXXUExrgFQ"
                    />
                  </div>
                  <div className="mt-1 font-label-sm text-[10px] font-semibold text-center truncate">
                    1. Maxillary
                  </div>
                </div>

                <div
                  className={`relative rounded-lg overflow-hidden border p-1 ${
                    capturedCount >= 2 ? "border-secondary bg-secondary-container/20" : "border-surface-container bg-surface-container-low"
                  }`}
                >
                  <div className="aspect-[4/3] rounded overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="2. Mandibular Labial"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxlAgR8oowKR2ovdWCK8yK6JmzoHiFo5p83yEUuqOErnt27-bWhiERl8K14l2Ptf11Xy8nXGexPYkrDNXVGjS9AIkXgrDGn4jThwTdwHpgtL3MIbNYgVhQB3i6ZPuw7h8AKbjU3cTg2w9HaIF0vHCOfmrwXpHZU6ZWRanLtCKaIuotiKLdpOFGuEk6rEYfCg1CS4vX6l2Zyr3sdNPWbNsz-XXdG6zDV13Qib537WxprpGLTai--CI"
                    />
                  </div>
                  <div className="mt-1 font-label-sm text-[10px] font-semibold text-center truncate">
                    2. Mandibular
                  </div>
                </div>

                <div
                  className={`relative rounded-lg overflow-hidden border p-1 ${
                    capturedCount >= 3 ? "border-secondary bg-secondary-container/20" : "border-surface-container bg-surface-container-low"
                  }`}
                >
                  <div className="aspect-[4/3] rounded bg-surface-container flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      camera_alt
                    </span>
                  </div>
                  <div className="mt-1 font-label-sm text-[10px] font-semibold text-center truncate">
                    3. Lingual
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-surface-container p-1 bg-surface-container-low opacity-60">
                  <div className="aspect-[4/3] rounded bg-surface-container flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                      hourglass_empty
                    </span>
                  </div>
                  <div className="mt-1 font-label-sm text-[10px] font-semibold text-center truncate">
                    4. Right Molar
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* ================= RIGHT COLUMN: AI Assessment & Actions ================= */}
          <aside className="lg:col-span-3 flex flex-col gap-space-md">
            {/* Fused Risk Summary */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    account_tree
                  </span>
                  AI Multimodal Fusion
                </span>
                <span className="px-2 py-0.5 rounded bg-error text-on-error font-bold text-[10px] uppercase">
                  Tier 3 Alert
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
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
                  <span className="absolute font-headline-lg text-headline-lg font-extrabold text-on-surface">
                    78%
                  </span>
                </div>
                <div>
                  <div className="font-label-md text-label-md font-bold text-on-surface">
                    WHO Dean&apos;s Grade 5
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    TFI Score 5-6 • Subsurface pitting with severe brown staining.
                  </div>
                </div>
              </div>
            </div>

            {/* Field Directives Dropdown Menu */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    task_alt
                  </span>
                  Triage Protocol Actions
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-data-mono text-[11px] font-bold">
                  {activeDirectivesCount}/4
                </span>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDirectivesMenu(!showDirectivesMenu)}
                  className="w-full flex items-center justify-between bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-2 rounded-lg font-label-md text-label-md border border-surface-container transition-colors"
                >
                  <span>Select Applied Protocols</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {showDirectivesMenu ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {showDirectivesMenu && (
                  <div className="mt-2 space-y-2 p-2 bg-surface-container-low rounded-lg border border-surface-container">
                    <label className="flex items-center gap-2 text-body-sm text-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={directives.potableVoucher}
                        onChange={(e) =>
                          setDirectives({ ...directives, potableVoucher: e.target.checked })
                        }
                        className="accent-secondary rounded"
                      />
                      <span>Potable Safe Water Voucher Issued</span>
                    </label>
                    <label className="flex items-center gap-2 text-body-sm text-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={directives.cppAcpApplied}
                        onChange={(e) =>
                          setDirectives({ ...directives, cppAcpApplied: e.target.checked })
                        }
                        className="accent-secondary rounded"
                      />
                      <span>Topical CPP-ACP Applied</span>
                    </label>
                    <label className="flex items-center gap-2 text-body-sm text-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={directives.hospitalReferral}
                        onChange={(e) =>
                          setDirectives({ ...directives, hospitalReferral: e.target.checked })
                        }
                        className="accent-secondary rounded"
                      />
                      <span>Hospital Resin Infiltration Referral</span>
                    </label>
                    <label className="flex items-center gap-2 text-body-sm text-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={directives.resamplingFlag}
                        onChange={(e) =>
                          setDirectives({ ...directives, resamplingFlag: e.target.checked })
                        }
                        className="accent-secondary rounded"
                      />
                      <span>Borehole Water Resampling Flag</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Clear Primary Sync CTA */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-2">
              <button
                className={`w-full flex items-center justify-center gap-2 ${
                  isSynced ? "bg-secondary" : "bg-primary hover:bg-primary-container"
                } text-on-primary font-label-lg text-label-lg py-3 rounded-lg font-bold shadow-sm transition-all active:scale-[0.99]`}
                type="button"
                onClick={handleSyncCloud}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isSynced ? "cloud_done" : "cloud_upload"}
                </span>
                <span>{syncStatus}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
