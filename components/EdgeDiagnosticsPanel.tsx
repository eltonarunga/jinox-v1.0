"use client";

import { useState } from "react";

export function EdgeDiagnosticsPanel() {
  const [selectedCounty, setSelectedCounty] = useState<string>("nakuru");
  const [showBboxes, setShowBboxes] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [reportExported, setReportExported] = useState<boolean>(false);
  const [isQueued, setIsQueued] = useState<boolean>(false);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);

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

  const handleCalibrate = () => {
    setIsCalibrated(true);
    setTimeout(() => setIsCalibrated(false), 800);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-gutter-desktop py-space-md flex flex-col gap-space-md">
        {/* Top Command Strip: Operational Context & Patient Metadata */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-space-lg">
            {/* County Selector */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  location_on
                </span>
                Surveillance Hub / County
              </label>
              <div className="relative">
                <select
                  className="appearance-none bg-surface-container-low text-on-surface font-label-md text-label-md px-space-md py-1.5 pr-8 rounded-lg outline-none cursor-pointer hover:bg-surface-container transition-colors"
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                >
                  <option value="nakuru">Nakuru (Rift Central Zone A)</option>
                  <option value="baringo">Baringo (North Trough Basin)</option>
                  <option value="naivasha">Naivasha (Lake Volcanic Graben)</option>
                  <option value="turkana">Turkana (Lowland Thermal Aquifer)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 text-[16px] text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container hidden sm:block"></div>
            {/* De-identified Patient Hash */}
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                De-Identified Clinical Subject
              </span>
              <div className="flex items-center gap-space-xs">
                <span className="font-data-mono text-data-mono text-on-surface bg-surface-container px-space-sm py-1 rounded">
                  #KEN-NK-8924
                </span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] uppercase font-semibold">
                  Triage Pass
                </span>
              </div>
            </div>
            {/* Age & Gender Input (Editable Edge Field) */}
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Demographics / Cohort
              </span>
              <div className="flex items-center gap-space-xs font-data-mono text-data-mono text-on-surface">
                <span className="bg-surface-container-low px-space-sm py-1 rounded">
                  34 yrs
                </span>
                <span className="text-on-surface-variant">/</span>
                <span className="bg-surface-container-low px-space-sm py-1 rounded">
                  Female (Ad.)
                </span>
              </div>
            </div>
            {/* Exposure Lifetime Anchor */}
            <div className="hidden xl:flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Residency Fluoride Exposure
              </span>
              <div className="flex items-center gap-1 font-label-md text-label-md text-on-surface">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                <span className="font-semibold">31 Years Lifetime</span>
                <span className="text-on-surface-variant font-body-sm">
                  (Borehole BH-7A)
                </span>
              </div>
            </div>
          </div>
          {/* Edge Capture & Sensor Sync Status Indicator */}
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-1.5 rounded-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface uppercase">
                  Edge Engine Online
                </span>
                <span className="font-data-mono text-[10px] text-on-surface-variant leading-none">
                  ONNX MobileNetV4-Fluorosis-QInt8
                </span>
              </div>
            </div>
            <button
              className={`px-space-md py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-1.5 transition-colors ${
                isCalibrated ? "animate-pulse" : ""
              }`}
              type="button"
              onClick={handleCalibrate}
            >
              <span className="material-symbols-outlined text-[18px]">
                tune
              </span>
              <span>Calibrate</span>
            </button>
          </div>
        </div>

        {/* Main Diagnostic Split: Left (Intraoral Vision) | Right (Multimodal Synthesis) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          {/* LEFT COLUMN: Intraoral Capture & Visual Enamel Feature Extraction (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            {/* Camera Viewport Card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    photo_camera
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
                    Intraoral Enamel Capture
                  </h2>
                </div>
                <span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-data-mono text-[11px]">
                  FOV: Maxillary Labial
                </span>
              </div>
              {/* Capture Stage & Simulated Inspection Frame */}
              <div className="relative w-full aspect-[4/3] bg-on-primary-fixed rounded-lg overflow-hidden shadow-inner flex items-center justify-center group select-none">
                {/* Real High-Detail Intraoral Macro Photograph */}
                <img
                  className="w-full h-full object-cover"
                  alt="Macro clinical intraoral photograph of human maxillary central incisors affected by dental fluorosis"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI6Ba5JWJQy-lkpnvNO3HIJeJGO-Eya-aMyEry1SfMSZWcYi0PJwQlQArOFt1_pAH2ODK3KiIGpl8YRvAS3BMvamJZES0sFgSDdPCG5rif9oLOB1Lm-GnbGK8Nv-F_hA--QGvP8aNE0l5O__vHDUH7IlxkAy5ehF9q1iB7pGzS2xZpLCt5O6bIwd2VTi27mL_JrIU1qrNuInjFFzAiUwxwZOm9ZiK_NUYbfkn88Mh1Zv3XkCYcGyw"
                />
                {/* Neural Network Overlay Gradients & Detection HUD */}
                <div className="absolute inset-0 bg-gradient-to-t from-on-primary-fixed/80 via-transparent to-transparent pointer-events-none"></div>
                {/* Visual Reticle / Diagnostic Grid Lines */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid-pattern"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="#d3e4fe"
                        strokeWidth="0.5"
                        strokeDasharray="2 4"
                      ></path>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)"></rect>
                </svg>
                {/* Bounding Box 1: Left Incisal Opacity Patch */}
                <div
                  className={`absolute top-[28%] left-[24%] w-[26%] h-[42%] rounded border-2 border-secondary-fixed bg-secondary/15 backdrop-blur-[0.5px] transition-all duration-300 flex flex-col justify-between p-1 ${
                    showBboxes ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-secondary text-on-secondary font-data-mono text-[9px] px-1 rounded font-bold uppercase tracking-tight">
                      Lesion L1 • TFI-5
                    </span>
                    <span className="bg-on-primary-fixed text-secondary-fixed font-data-mono text-[9px] px-1 rounded">
                      94.8%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-secondary-fixed font-data-mono">
                    <span>Area: 38.4 mm²</span>
                    <span>Pitting: Present</span>
                  </div>
                </div>
                {/* Bounding Box 2: Right Contralateral Incisal Hypomineralization */}
                <div
                  className={`absolute top-[32%] right-[22%] w-[28%] h-[38%] rounded border-2 border-error-container bg-error/15 backdrop-blur-[0.5px] transition-all duration-300 flex flex-col justify-between p-1 ${
                    showBboxes ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-error text-on-error font-data-mono text-[9px] px-1 rounded font-bold uppercase tracking-tight">
                      Lesion L2 • TFI-5
                    </span>
                    <span className="bg-on-primary-fixed text-error-container font-data-mono text-[9px] px-1 rounded">
                      88.1%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-error-container font-data-mono">
                    <span>Confluent Pits</span>
                    <span>ΔE: +14.2</span>
                  </div>
                </div>
                {/* Heatmap Gradient Overlay (Dynamic Toggle) */}
                <div
                  className={`absolute inset-0 bg-gradient-to-tr from-error/20 via-secondary/25 to-surface-variant/30 mix-blend-color-burn transition-opacity duration-300 pointer-events-none ${
                    showHeatmap ? "opacity-75" : "opacity-0"
                  }`}
                ></div>
                {/* Real-time HUD Status Stamp */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-on-primary font-data-mono text-[10px] pointer-events-none px-1">
                  <div className="flex items-center gap-1 bg-on-primary-fixed/80 backdrop-blur px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
                    <span>Ameloblast Disruption Conf: 91.4%</span>
                  </div>
                  <span className="bg-on-primary-fixed/80 backdrop-blur px-2 py-0.5 rounded">
                    ISO 100 • 1/160s • Ring Macro
                  </span>
                </div>
              </div>
              {/* Controls for HUD Overlays & Capture Actions */}
              <div className="grid grid-cols-2 gap-space-sm">
                <button
                  className={`px-space-sm py-2 rounded-lg text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors ${
                    showBboxes
                      ? "bg-surface-container-highest"
                      : "bg-surface-container-high hover:bg-surface-container-highest"
                  }`}
                  type="button"
                  onClick={() => setShowBboxes(!showBboxes)}
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    crop_free
                  </span>
                  <span>Toggle Bounding Boxes</span>
                </button>
                <button
                  className={`px-space-sm py-2 rounded-lg text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors ${
                    showHeatmap
                      ? "bg-secondary-container"
                      : "bg-surface-container-high hover:bg-surface-container-highest"
                  }`}
                  type="button"
                  onClick={() => setShowHeatmap(!showHeatmap)}
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    heat_pump
                  </span>
                  <span>Lesion Heatmap</span>
                </button>
              </div>
              {/* Tablet Camera Retake / Local Ingestion Shelf */}
              <div className="bg-surface-container-low rounded-lg p-space-md flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[24px]">
                      cloud_upload
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      Tablet Lens Active (Otolux 4K)
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Tap to swap live stream or import intraoral DICOM
                    </span>
                  </div>
                </div>
                <button className="px-space-md py-1.5 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-on-surface-variant transition-colors shadow-sm whitespace-nowrap">
                  Capture Scan
                </button>
              </div>
              {/* Visual Severity Index & TFI Staging Gauges */}
              <div className="bg-surface-container rounded-lg p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      Visual Phenotype Signal
                    </span>
                    <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                      72%{" "}
                      <span className="font-label-md text-label-md font-normal text-on-surface-variant">
                        Severity Index
                      </span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      TFI Enamel Stage
                    </span>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="px-2 py-0.5 rounded bg-error text-on-error font-data-mono text-label-md font-bold">
                        TFI 5
                      </span>
                      <span className="font-label-sm text-label-sm text-error font-semibold">
                        (Confluent Pitting)
                      </span>
                    </div>
                  </div>
                </div>
                {/* Linear Bar Breakdown for TFI Spectrum (Stages 0 to 9) */}
                <div className="flex flex-col gap-1 pt-1">
                  <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-secondary-fixed transition-all"
                      style={{ width: "25%" }}
                    ></div>
                    <div
                      className="h-full bg-secondary transition-all"
                      style={{ width: "25%" }}
                    ></div>
                    <div
                      className="h-full bg-error-container transition-all"
                      style={{ width: "22%" }}
                    ></div>
                    <div
                      className="h-full bg-error transition-all"
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between font-data-mono text-[9px] text-on-surface-variant">
                    <span>TFI-0 (Normal)</span>
                    <span>TFI-3 (Opaque Striations)</span>
                    <span className="text-on-surface font-bold">
                      ▲ TFI-5 (Micro-pits)
                    </span>
                    <span>TFI-9 (Gross Loss)</span>
                  </div>
                </div>
              </div>
              {/* Automated Edge Feature Extraction List */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Extracted Morphological Markers
                </span>
                <div className="grid grid-cols-2 gap-space-xs font-data-mono text-body-sm">
                  <div className="bg-surface-container-low p-space-xs px-space-sm rounded flex items-center justify-between">
                    <span className="text-on-surface-variant">Labial Striations:</span>
                    <span className="font-semibold text-on-surface">Bilateral Parallels</span>
                  </div>
                  <div className="bg-surface-container-low p-space-xs px-space-sm rounded flex items-center justify-between">
                    <span className="text-on-surface-variant">Pitting Morphology:</span>
                    <span className="font-semibold text-error">Discrete Focal Pits</span>
                  </div>
                  <div className="bg-surface-container-low p-space-xs px-space-sm rounded flex items-center justify-between">
                    <span className="text-on-surface-variant">Chromogenic Stain:</span>
                    <span className="font-semibold text-on-surface">Brown Hydration Ring</span>
                  </div>
                  <div className="bg-surface-container-low p-space-xs px-space-sm rounded flex items-center justify-between">
                    <span className="text-on-surface-variant">Contralateral Symmetry:</span>
                    <span className="font-semibold text-secondary">96.2% Match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER/RIGHT COLUMN: Multimodal Fusion Engine (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            {/* Fused Tri-Modal Breakdown Header Card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">
                      hub
                    </span>
                  </div>
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
                      Multimodal Risk Fusion Engine
                    </h2>
                    <span className="font-data-mono text-[11px] text-on-surface-variant">
                      Endpoint: POST /api/risk/predict • Bayesian Calibration v2.4
                    </span>
                  </div>
                </div>
                {/* Live Latency & Edge Footprint Badge */}
                <div className="flex items-center gap-2 bg-surface-container-low px-space-md py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="font-data-mono text-data-mono text-on-surface">
                    Weight Allocation: 45:35:20
                  </span>
                </div>
              </div>
              {/* The Tri-Modal Fusion Triad: 3 Component Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                {/* Modal 1: Visual Enamel Features (45%) */}
                <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between gap-space-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary-container text-on-primary-container font-data-mono text-[10px] rounded-bl font-semibold">
                    Weight: 45%
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        camera_alt
                      </span>
                      <span className="font-label-md text-label-md font-bold">
                        1. Visual Enamel
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Edge Vision Classifier
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display-lg text-display-lg font-bold text-on-surface">
                        72
                      </span>
                      <span className="font-data-mono text-body-sm text-on-surface-variant">
                        / 100
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-error h-full rounded-full"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                    Severe chalky striations and localized micro-pitting detected across central incisors.
                  </p>
                </div>
                {/* Modal 2: Environmental Groundwater Exposure (35%) */}
                <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between gap-space-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary-container text-on-primary-container font-data-mono text-[10px] rounded-bl font-semibold">
                    Weight: 35%
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        water_drop
                      </span>
                      <span className="font-label-md text-label-md font-bold">
                        2. Groundwater
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      WRMA GIS Hydro-Telemetry
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display-lg text-display-lg font-bold text-on-surface">
                        60
                      </span>
                      <span className="font-data-mono text-body-sm text-on-surface-variant">
                        / 100
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-secondary h-full rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                    Ward sensor:{" "}
                    <span className="font-semibold text-error">6.8 ppm F⁻</span> (WHO baseline limit: 1.5 ppm). High chronic aquifer burden.
                  </p>
                </div>
                {/* Modal 3: Craniofacial Genomic Susceptibility (20%) */}
                <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between gap-space-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary-container text-on-primary-container font-data-mono text-[10px] rounded-bl font-semibold">
                    Weight: 20%
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        strikethrough_s
                      </span>
                      <span className="font-label-md text-label-md font-bold">
                        3. Genomics
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Targeted Allele Assay
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display-lg text-display-lg font-bold text-on-surface">
                        45
                      </span>
                      <span className="font-data-mono text-body-sm text-on-surface-variant">
                        / 100
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-secondary-container h-full rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                    Amelogenin{" "}
                    <span className="font-data-mono font-semibold text-on-surface">
                      AMELX / ENAM
                    </span>{" "}
                    risk locus positive. Moderate amelogenesis fragility.
                  </p>
                </div>
              </div>
              {/* Calibrated Composite Risk Indicator (Hero Output) */}
              <div className="bg-gradient-to-br from-surface-container-low to-surface-container rounded-xl p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md">
                {/* Left: Circular Gauge Indicator */}
                <div className="flex items-center gap-space-md">
                  <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-display-lg text-[1.75rem] font-bold text-on-surface leading-none">
                        62
                        <span className="text-label-md font-semibold text-on-surface-variant">
                          %
                        </span>
                      </span>
                      <span className="font-label-sm text-[9px] text-on-surface-variant uppercase font-semibold mt-0.5">
                        Composite
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-space-sm py-1 rounded bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold uppercase tracking-wider">
                        Moderate-Severe Endemic Risk
                      </span>
                      <span className="font-data-mono text-[11px] bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant font-semibold">
                        Tier: mod
                      </span>
                    </div>
                    <div className="font-headline-xl text-headline-xl text-on-surface font-semibold">
                      Dean&apos;s Index: &quot;Moderate&quot;
                    </div>
                    <div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
                      <span>
                        Epidemiological TFI: <strong>Score 5</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Confidence Interval:{" "}
                        <strong>95% [58.4 - 66.2]</strong>
                      </span>
                    </div>
                  </div>
                </div>
                {/* Right: Bayesian Triad Weight Math Snippet */}
                <div className="bg-surface-container-lowest p-space-sm rounded-lg shadow-sm font-data-mono text-data-mono text-on-surface flex flex-col gap-1 w-full md:w-auto">
                  <span className="font-label-sm text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold">
                    Fusion Formulation
                  </span>
                  <div className="text-[11px] text-on-surface">
                    R<sub>calibrated</sub> = (0.45 × 72) + (0.35 × 60) + (0.20 × 45)
                  </div>
                  <div className="text-[11px] text-secondary font-bold">
                    R<sub>calibrated</sub> = 32.4 + 21.0 + 9.0 = 62.4%
                  </div>
                </div>
              </div>
              {/* Clinical Decision Recommendation Box */}
              <div className="bg-surface-container-lowest rounded-lg p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      medical_services
                    </span>
                    <span className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wide">
                      Autonomous Clinical Protocol Recommendation
                    </span>
                  </div>
                  <span className="font-data-mono text-[11px] text-secondary bg-secondary-container px-2 py-0.5 rounded font-semibold">
                    Action Tier 2 Mandate
                  </span>
                </div>
                {/* Proposal Alignment Quote */}
                <blockquote className="bg-surface-container-low p-space-md rounded-lg font-body-lg text-body-lg text-on-surface font-medium leading-relaxed">
                  “Moderate fluorosis risk signal. Recommend dietary fluoride review, water testing, preventive dietary counseling, and follow-up screening within 6 months.”
                </blockquote>
                {/* Protocol Step Badges */}
                <div className="flex flex-wrap items-center gap-space-xs pt-1">
                  <span className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm bg-surface-container px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[14px] text-secondary">
                      check_circle
                    </span>
                    Community Defluoridator Referral (Bone Char / Hydroxyapatite)
                  </span>
                  <span className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm bg-surface-container px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[14px] text-secondary">
                      check_circle
                    </span>
                    Household Potable Source Titration
                  </span>
                  <span className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm bg-surface-container px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[14px] text-secondary">
                      check_circle
                    </span>
                    Pediatric Sibling Vulnerability Assessment
                  </span>
                </div>
              </div>
              {/* Action Controls Rail */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                <div className="flex flex-wrap items-center gap-space-sm">
                  <button
                    className="px-space-lg py-2 bg-primary text-on-primary hover:bg-on-surface-variant font-label-md text-label-md rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    type="button"
                    onClick={handleExport}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {reportExported ? "download_done" : "ios_share"}
                    </span>
                    <span>
                      {reportExported
                        ? "Report Generated!"
                        : "Export Clinical Referral (JSON / PDF)"}
                    </span>
                  </button>
                  <button
                    className="px-space-md py-2 bg-secondary text-on-secondary hover:bg-on-secondary-container font-label-md text-label-md rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    type="button"
                    onClick={handleQueue}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isQueued ? "check" : "local_hospital"}
                    </span>
                    <span>
                      {isQueued
                        ? "Queued (#REF-092)"
                        : "Queue to Nakuru Provincial General"}
                    </span>
                  </button>
                </div>
                <button
                  className="px-space-md py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-1.5 transition-colors"
                  type="button"
                  onClick={handleReEstimate}
                  disabled={isComputing}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isComputing ? "animate-spin" : ""
                    }`}
                  >
                    refresh
                  </span>
                  <span>
                    {isComputing
                      ? "Computing Fusion..."
                      : "Re-run Multimodal Inference"}
                  </span>
                </button>
              </div>
            </div>
            {/* Ground Truth Cross-Validation & Clinical Audit Drawer */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Diagnostic Ground Truth &amp; Audit Log
                </span>
                <span className="font-data-mono text-[11px] text-on-surface-variant">
                  Validated against WHO Technical Report Series 846
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm font-data-mono text-body-sm">
                <div className="bg-surface-container-low p-space-sm rounded">
                  <span className="text-on-surface-variant text-[11px] block">
                    Dean&apos;s Index Classification
                  </span>
                  <span className="font-semibold text-on-surface">
                    Category 4 (Moderate)
                  </span>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded">
                  <span className="text-on-surface-variant text-[11px] block">
                    Tooth Surface Score
                  </span>
                  <span className="font-semibold text-on-surface">
                    Upper Arch Max: 5 / 9
                  </span>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded">
                  <span className="text-on-surface-variant text-[11px] block">
                    Field Investigator Token
                  </span>
                  <span className="font-semibold text-on-surface">
                    NKR-FIELD-DR-MWANGI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Diagnostic Workstation Telemetry Footer Bar */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm px-space-md py-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm font-data-mono text-data-mono text-on-surface-variant">
          <div className="flex flex-wrap items-center gap-space-md">
            <span className="flex items-center gap-1 text-on-surface font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              Inference Latency: 38ms (Edge ONNX runtime)
            </span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                sync
              </span>
              Supabase Synced (Event ID: #882410-NAK)
            </span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-[16px]">
                offline_pin
              </span>
              Offline Cache Ready (3,412 records stored)
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="text-[11px]">WASM SIMD Accelerated</span>
            <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-semibold text-[10px]">
              v2.4.1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
