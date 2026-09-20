"use client";

import { useState } from "react";

interface TfiStage {
  title: string;
  text: string;
  color: string;
  porosity: string;
  dej: string;
  mineral: string;
  pittingOpacity: number;
  defectStart: string;
  defectMid: string;
}

const TFI_STAGES: Record<number, TfiStage> = {
  0: {
    title: "TFI Stage 0: Normal Translucent Enamel",
    text: "Enamel exhibits normal translucency and smooth uniform glass-like texture. No abnormal white opacity or structural porous deficits.",
    color: "#006a61",
    porosity: "0.2%",
    dej: "98.5%",
    mineral: "96.4%",
    pittingOpacity: 0.0,
    defectStart: "#fed7aa",
    defectMid: "#ffffff",
  },
  1: {
    title: "TFI Stage 1: Fine White Lines along Perikymata",
    text: "Fine white lines traverse the tooth crown along perikymata perimeters. The tooth appears nearly normal in unlit wet clinical triage.",
    color: "#006a61",
    porosity: "2.8%",
    dej: "96.0%",
    mineral: "93.1%",
    pittingOpacity: 0.0,
    defectStart: "#fde68a",
    defectMid: "#fef3c7",
  },
  2: {
    title: "TFI Stage 2: Pronounced White Retzius Striations",
    text: "More distinct white striae; occasional confluent chalky bands covering less than 25% of the total buccal anatomical surface.",
    color: "#006a61",
    porosity: "5.4%",
    dej: "94.2%",
    mineral: "89.8%",
    pittingOpacity: 0.0,
    defectStart: "#fde68a",
    defectMid: "#fef08a",
  },
  3: {
    title: "TFI Stage 3: Cloudy Confluent Chalky Patches",
    text: "Confluent white chalky opacities spread across extensive areas. Enamel lacks natural luster, exhibiting dry parchment appearance upon desiccation.",
    color: "#b45309",
    porosity: "11.6%",
    dej: "91.0%",
    mineral: "85.2%",
    pittingOpacity: 0.1,
    defectStart: "#d97706",
    defectMid: "#fde68a",
  },
  4: {
    title: "TFI Stage 4: Widespread Chalky Opaque Shell",
    text: "Entire tooth surface demonstrates opaque porcelain-chalk white appearance. Subtle micro-fissures begin tracking through the outer hypermineralized shell.",
    color: "#b45309",
    porosity: "18.2%",
    dej: "88.0%",
    mineral: "79.5%",
    pittingOpacity: 0.3,
    defectStart: "#d97706",
    defectMid: "#fed7aa",
  },
  5: {
    title: "TFI Stage 5: Distinct Pitting & Post-Eruptive Loss",
    text: "Round pitting less than 2mm in diameter occurring on outer enamel. Subsurface pore space reaches 28.4%, creating elevated friability and dark pigmentation uptake.",
    color: "#ba1a1a",
    porosity: "28.4%",
    dej: "84.0%",
    mineral: "71.6%",
    pittingOpacity: 0.85,
    defectStart: "#b45309",
    defectMid: "#d97706",
  },
  6: {
    title: "TFI Stage 6: Merged Pit Trenches & Ochre Bands",
    text: "Micro-pits coalesce into horizontal grooves and trenches across the middle third. Moderate brown staining from dietary tannins penetrating porous subsurface.",
    color: "#ba1a1a",
    porosity: "34.1%",
    dej: "79.0%",
    mineral: "66.2%",
    pittingOpacity: 1.0,
    defectStart: "#9a3412",
    defectMid: "#b45309",
  },
  7: {
    title: "TFI Stage 7: Extensive Irregular Enamel Breakdown",
    text: "Loss of outermost enamel layer over areas <50% of the anatomical crown. Dark brown stained hypomineralized enamel exposed to oral cavity.",
    color: "#ba1a1a",
    porosity: "42.0%",
    dej: "72.5%",
    mineral: "59.8%",
    pittingOpacity: 1.0,
    defectStart: "#78350f",
    defectMid: "#9a3412",
  },
  8: {
    title: "TFI Stage 8: Loss of >50% Enamel Morphology",
    text: "Loss of outer enamel shell exceeds 50% of crown surface. Remaining enamel is paper-thin and brittle; dentin surfaces often partly uncovered.",
    color: "#ba1a1a",
    porosity: "49.5%",
    dej: "64.0%",
    mineral: "52.4%",
    pittingOpacity: 1.0,
    defectStart: "#451a03",
    defectMid: "#78350f",
  },
  9: {
    title: "TFI Stage 9: Severe Loss of Coronal Dimension",
    text: "Gross loss of enamel shape and cusps. Masticatory wear fractures fragile margins down to cervical thirds, resulting in direct pulpal risk.",
    color: "#ba1a1a",
    porosity: "58.2%",
    dej: "51.0%",
    mineral: "44.0%",
    pittingOpacity: 1.0,
    defectStart: "#451a03",
    defectMid: "#78350f",
  },
};

export function TwinPanel() {
  const [fIntake, setFIntake] = useState<number>(6.2);
  const [durationMonths, setDurationMonths] = useState<number>(52);
  const [genePenetrance, setGenePenetrance] = useState<"low" | "base" | "high">("high");
  const [targetModel, setTargetModel] = useState<"incisor" | "molar">("incisor");
  const [tfiScore, setTfiScore] = useState<number>(5);

  const currentStage = TFI_STAGES[tfiScore] || TFI_STAGES[5];

  const handleFluorideChange = (val: number) => {
    setFIntake(val);
    const score = Math.min(9, Math.round((val / 12) * 6 + (durationMonths / 72) * 3));
    setTfiScore(score);
  };

  const handleDurationChange = (val: number) => {
    setDurationMonths(val);
    const score = Math.min(9, Math.round((fIntake / 12) * 6 + (val / 72) * 3));
    setTfiScore(score);
  };

  const handleResetBaseline = () => {
    setFIntake(6.2);
    setDurationMonths(52);
    setGenePenetrance("high");
    setTfiScore(5);
  };

  return (
    <div className="flex flex-col w-full">
      {/* System Status Rail & Simulation Context */}
      <div className="w-full bg-surface-container-low px-gutter-desktop py-space-sm flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
            <span className="font-data-mono text-data-mono text-on-surface uppercase font-bold">
              DIGITAL TWIN ENGINE v3.4-BIO
            </span>
            <span>•</span>
            <span>Biochemical Enamel Matrix Simulation</span>
          </div>
          <div className="hidden md:flex items-center gap-space-xs bg-surface-container px-space-sm py-0.5 rounded-lg text-on-surface font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[15px] text-secondary">
              memory
            </span>
            <span>WASM Enamel Solver: Converged (4.2ms)</span>
          </div>
        </div>
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs font-data-mono text-data-mono text-on-surface-variant">
            <span>
              Cohort: <strong className="text-on-surface">Rift-Valley-Child-702B</strong>
            </span>
            <span className="px-space-xs bg-surface-variant text-on-surface rounded">
              TFI Index Engine
            </span>
          </div>
          <button
            className="flex items-center gap-space-xs px-space-sm py-1 bg-surface text-on-surface hover:bg-surface-container rounded font-label-sm text-label-sm transition-colors"
            id="resetSimulationBtn"
            type="button"
            onClick={handleResetBaseline}
          >
            <span className="material-symbols-outlined text-[14px]">
              restart_alt
            </span>
            <span>Reset Baseline</span>
          </button>
          <button className="flex items-center gap-space-xs px-space-md py-1 bg-primary text-on-primary rounded font-label-sm text-label-sm shadow-sm hover:bg-surface-tint transition-colors">
            <span className="material-symbols-outlined text-[14px]">
              download
            </span>
            <span>Export Biomechanical Twin</span>
          </button>
        </div>
      </div>

      {/* Primary Stage Layout */}
      <div className="w-full px-gutter-desktop py-space-lg flex flex-col gap-space-lg">
        {/* Header Block & Cohort Profile Bar */}
        <div className="w-full bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="px-space-sm py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-data-mono text-data-mono uppercase tracking-wider">
                Layer 3 Active Twin
              </span>
              <span className="px-space-sm py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span> High Risk Enamel Attrition
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Active Window: Amelogenesis Stage (Pre-eruptive Matrix Mineralization)
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Biomechanical Fluorosis Progression Simulator
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
              Coupled reaction-diffusion solver quantifying ameloblast vacuolation, delayed amelogenin cleavage, and hyper-porous subsurface micro-architecture calibrated against Thylstrup-Fejerskov Index (TFI 0–9).
            </p>
          </div>
          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-space-md bg-surface-container-low p-space-sm rounded-lg shrink-0">
            <div className="flex flex-col px-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Simulated Age
              </span>
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                11.4 <span className="font-body-sm text-body-sm font-normal">yrs</span>
              </span>
            </div>
            <div className="w-px h-8 bg-surface-container"></div>
            <div className="flex flex-col px-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Current TFI Score
              </span>
              <span
                className="font-headline-lg text-headline-lg font-bold"
                style={{ color: currentStage.color }}
              >
                TFI {tfiScore}
              </span>
            </div>
            <div className="w-px h-8 bg-surface-container"></div>
            <div className="flex flex-col px-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Predicted DEJ Failure
              </span>
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Age 21.8
              </span>
            </div>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left Panel: Exposure & Biochemical Sliders (3 Cols) */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-space-md">
            {/* Cohort Amelogenesis Controls */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    science
                  </span>
                  <span className="font-headline-lg text-headline-lg text-on-surface">
                    Micro-Environment
                  </span>
                </div>
                <span className="font-data-mono text-data-mono text-on-surface-variant">
                  INPUT PARAMETERS
                </span>
              </div>
              {/* Parameter 1: Fluoride Intake */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex justify-between items-center font-label-md text-label-md">
                  <span className="text-on-surface font-medium flex items-center gap-1">
                    Drinking Water F⁻
                    <span
                      className="material-symbols-outlined text-on-surface-variant text-[14px]"
                      title="Groundwater borehole fluoride concentration"
                    >
                      info
                    </span>
                  </span>
                  <span className="font-data-mono text-data-mono text-error font-bold bg-error-container/40 px-space-xs py-0.5 rounded">
                    {fIntake.toFixed(1)} ppm
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12.0"
                  step="0.1"
                  value={fIntake}
                  onChange={(e) => handleFluorideChange(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer h-2 bg-surface-container rounded-lg"
                />
                <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span>0.5 (WHO Safe)</span>
                  <span className="text-error font-semibold">1.5 (Threshold)</span>
                  <span>12.0 ppm</span>
                </div>
              </div>
              {/* Parameter 2: Exposure Duration */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex justify-between items-center font-label-md text-label-md">
                  <span className="text-on-surface font-medium">
                    Crown Exposure Window
                  </span>
                  <span className="font-data-mono text-data-mono text-on-surface font-bold bg-surface-container px-space-xs py-0.5 rounded">
                    {durationMonths} Months
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="72"
                  step="1"
                  value={durationMonths}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer h-2 bg-surface-container rounded-lg"
                />
                <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span>0 mo (Neonatal)</span>
                  <span>36 mo (Premolar)</span>
                  <span>72 mo (Late Molar)</span>
                </div>
              </div>
              {/* Parameter 3: Genetic Penetrance (AMELX / ENAM) */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-md text-label-md text-on-surface font-medium">
                  AMELX / ENAM Genetic Co-Factor
                </span>
                <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-lg">
                  <button
                    type="button"
                    className={`py-1 px-2 text-center rounded font-label-sm text-label-sm transition-all ${
                      genePenetrance === "low"
                        ? "bg-surface-container-lowest text-secondary font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setGenePenetrance("low")}
                  >
                    Low
                  </button>
                  <button
                    type="button"
                    className={`py-1 px-2 text-center rounded font-label-sm text-label-sm transition-all ${
                      genePenetrance === "base"
                        ? "bg-surface-container-lowest text-secondary font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setGenePenetrance("base")}
                  >
                    Baseline
                  </button>
                  <button
                    type="button"
                    className={`py-1 px-2 text-center rounded font-label-sm text-label-sm transition-all ${
                      genePenetrance === "high"
                        ? "bg-surface-container-lowest text-secondary font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setGenePenetrance("high")}
                  >
                    Elevated
                  </button>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Elevated allele penetrance accelerates ameloblast ER stress response under fluoride ion burden.
                </p>
              </div>
              {/* Parameter 4: Dietary Co-factors */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-md text-label-md text-on-surface font-medium">
                  Dietary Ca²⁺ / PO₄³⁻ Status
                </span>
                <select className="w-full rounded p-space-xs font-body-md text-body-md text-on-surface bg-surface-container-low focus:bg-surface-container-lowest">
                  <option value="malnourished">
                    Deficient (High Free Bioavailable F⁻)
                  </option>
                  <option value="moderate">
                    Sub-optimal Pastoralist Baseline
                  </option>
                  <option value="optimal">
                    Replete / Fortified Bioavailability
                  </option>
                </select>
              </div>
            </div>
            {/* Tooth Anatomic Selector Card */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide">
                Target Dental Model
              </span>
              <div className="grid grid-cols-2 gap-space-sm">
                <button
                  type="button"
                  className={`flex flex-col items-center p-space-sm rounded-lg font-label-md text-label-md transition-all ${
                    targetModel === "incisor"
                      ? "bg-surface-container-high text-on-surface font-semibold"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                  onClick={() => setTargetModel("incisor")}
                >
                  <span className="material-symbols-outlined text-[28px] text-secondary">
                    dentistry
                  </span>
                  <span>Maxillary Incisor</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                    Esthetic Zone (11/21)
                  </span>
                </button>
                <button
                  type="button"
                  className={`flex flex-col items-center p-space-sm rounded-lg font-label-md text-label-md transition-all ${
                    targetModel === "molar"
                      ? "bg-surface-container-high text-on-surface font-semibold"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                  onClick={() => setTargetModel("molar")}
                >
                  <span className="material-symbols-outlined text-[28px]">
                    medical_services
                  </span>
                  <span>First Permanent Molar</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                    Masticatory Zone (16/26)
                  </span>
                </button>
              </div>
              {/* Morphological Depth Sensor */}
              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs mt-space-xs">
                <div className="flex justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">
                    Enamel Thickness (Buccal)
                  </span>
                  <span className="font-data-mono text-data-mono font-bold text-on-surface">
                    1.82 mm
                  </span>
                </div>
                <div className="flex justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">
                    Mineral Volume Fraction
                  </span>
                  <span className="font-data-mono text-data-mono font-bold text-error">
                    {currentStage.mineral} (Norm: &gt;96%)
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full"
                    style={{ width: currentStage.mineral }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel: 3D Cross-Sectional Digital Twin Canvas (6 Cols on XL, 5 on LG) */}
          <div className="lg:col-span-8 xl:col-span-6 flex flex-col gap-space-md">
            {/* Interactive Biomechanical Tooth Render Viewport */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              {/* Viewport Header Toolbar */}
              <div className="bg-surface-container-low px-space-md py-space-sm flex items-center justify-between border-b border-surface-container">
                <div className="flex items-center gap-space-sm">
                  <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-surface-container font-data-mono text-data-mono text-on-surface font-semibold">
                    SLICE: SAGITTAL MICROSCOPIC DEJ
                  </span>
                  <span className="text-on-surface-variant font-label-sm text-label-sm">
                    Zoom: 240x
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button className="px-space-sm py-0.5 rounded bg-surface text-on-surface hover:bg-surface-container font-label-sm text-label-sm transition-colors">
                    Micro-CT View
                  </button>
                  <button className="px-space-sm py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold transition-colors">
                    Porosity Heatmap
                  </button>
                  <button className="p-1 rounded text-on-surface-variant hover:bg-surface-container">
                    <span className="material-symbols-outlined text-[18px]">
                      fullscreen
                    </span>
                  </button>
                </div>
              </div>
              {/* Main SVG Canvas Stage representing Enamel & DEJ Cross Section */}
              <div className="relative w-full h-[420px] bg-gradient-to-b from-surface-container-low via-surface to-surface-container-low flex items-center justify-center p-space-md overflow-hidden select-none">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(#006a61 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                ></div>
                {/* Vector Anatomical Digital Twin: Cross Section */}
                <svg
                  className="w-full h-full max-h-[380px] drop-shadow-md transition-all duration-500"
                  viewBox="0 0 540 380"
                >
                  <defs>
                    <linearGradient
                      id="outerEnamelGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#eff4ff" stopOpacity="0.95"></stop>
                      <stop offset="100%" stopColor="#d3e4fe" stopOpacity="0.8"></stop>
                    </linearGradient>
                    <linearGradient
                      id="fluorosisDefectGrad"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor={currentStage.defectStart}
                        stopOpacity="0.75"
                      ></stop>
                      <stop
                        offset="50%"
                        stopColor={currentStage.defectMid}
                        stopOpacity="0.55"
                      ></stop>
                      <stop
                        offset="100%"
                        stopColor="#fed7aa"
                        stopOpacity="0.15"
                      ></stop>
                    </linearGradient>
                    <linearGradient
                      id="dentinGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="50%"
                    >
                      <stop offset="0%" stopColor="#fef3c7"></stop>
                      <stop offset="100%" stopColor="#fde68a"></stop>
                    </linearGradient>
                    <linearGradient
                      id="pulpGrad"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#fda4af"></stop>
                      <stop offset="100%" stopColor="#e11d48"></stop>
                    </linearGradient>
                    <pattern
                      id="porosityPattern"
                      width="12"
                      height="12"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="2" cy="2" r="1.2" fill="#9a3412" fillOpacity="0.6"></circle>
                      <circle cx="8" cy="8" r="1.6" fill="#78350f" fillOpacity="0.7"></circle>
                      <circle cx="10" cy="3" r="0.9" fill="#b45309" fillOpacity="0.4"></circle>
                    </pattern>
                  </defs>
                  {/* Root Structure & Bone Outline */}
                  <path
                    d="M 170 240 L 190 350 Q 200 370 215 365 L 255 280 L 290 365 Q 305 370 315 350 L 335 240 Z"
                    fill="#e5eeff"
                    opacity="0.6"
                  ></path>
                  {/* Pulp Cavity */}
                  <path
                    d="M 235 150 Q 255 120 270 150 Q 280 210 285 320 L 275 325 L 265 240 L 255 240 L 245 325 L 235 320 Z"
                    fill="url(#pulpGrad)"
                  ></path>
                  <text
                    x="246"
                    y="220"
                    className="font-data-mono text-[9px] fill-on-surface-variant font-bold"
                  >
                    PULP
                  </text>
                  {/* Dentin Body */}
                  <path
                    d="M 160 140 Q 255 80 345 140 Q 360 210 335 250 L 170 250 Q 145 210 160 140 Z"
                    fill="url(#dentinGrad)"
                    stroke="#d97706"
                    strokeWidth="0.5"
                  ></path>
                  <text
                    x="180"
                    y="190"
                    className="font-data-mono text-[10px] fill-on-surface font-semibold tracking-wider"
                  >
                    CORONAL DENTIN
                  </text>
                  {/* Dentin-Enamel Junction (DEJ) Interfacial Layer */}
                  <path
                    d="M 152 145 Q 255 72 353 145"
                    fill="none"
                    stroke="#006a61"
                    strokeWidth="3"
                    strokeDasharray="2,2"
                  ></path>
                  {/* Enamel Layer */}
                  <path
                    d="M 135 155 Q 255 40 370 155 Q 360 120 353 145 Q 255 72 152 145 Q 142 125 135 155 Z"
                    fill="url(#outerEnamelGrad)"
                  ></path>
                  {/* Fluorotic Hypomineralization Subsurface Zone */}
                  <path
                    d="M 144 148 Q 255 60 361 148 Q 355 110 255 78 Q 150 110 144 148 Z"
                    fill="url(#fluorosisDefectGrad)"
                    className="transition-all duration-300"
                  ></path>
                  {/* Micro-pitting and surface structural fissures layer */}
                  <g opacity={currentStage.pittingOpacity}>
                    <path
                      d="M 210 68 C 215 74, 218 73, 222 67"
                      fill="none"
                      stroke="#78350f"
                      strokeWidth="2.5"
                    ></path>
                    <path
                      d="M 248 58 C 253 66, 258 64, 263 57"
                      fill="none"
                      stroke="#78350f"
                      strokeWidth="3"
                    ></path>
                    <path
                      d="M 288 64 C 292 70, 296 71, 300 64"
                      fill="none"
                      stroke="#78350f"
                      strokeWidth="2"
                    ></path>
                    <circle cx="255" cy="62" r="6" fill="#9a3412" fillOpacity="0.85"></circle>
                    <circle cx="220" cy="71" r="3.5" fill="#78350f" fillOpacity="0.75"></circle>
                    <circle cx="295" cy="67" r="4.2" fill="#78350f" fillOpacity="0.8"></circle>
                  </g>
                  {/* Dynamic High-Porosity Subsurface Infill Overlay */}
                  <path
                    d="M 152 138 Q 255 65 352 138 Q 345 105 255 76 Q 160 105 152 138 Z"
                    fill="url(#porosityPattern)"
                    opacity={(tfiScore / 9) * 0.9}
                    className="transition-opacity duration-300"
                  ></path>
                  {/* Callout Pin: Outer Hypermineralized Rim */}
                  <g className="cursor-pointer">
                    <line x1="330" y1="90" x2="410" y2="70" stroke="#006a61" strokeWidth="1"></line>
                    <circle cx="330" cy="90" r="3" fill="#006a61"></circle>
                    <rect x="410" y="55" width="115" height="26" rx="4" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"></rect>
                    <text x="416" y="67" className="font-data-mono text-[9px] fill-on-surface font-bold">
                      OUTER ENAMEL RIM
                    </text>
                    <text x="416" y="77" className="font-body-sm text-[8px] fill-secondary font-medium">
                      Pseudo-Intact (20-50μm)
                    </text>
                  </g>
                  {/* Callout Pin: Subsurface Hypomineralized Lesion */}
                  <g className="cursor-pointer">
                    <line x1="260" y1="85" x2="110" y2="60" stroke="#ba1a1a" strokeWidth="1"></line>
                    <circle cx="260" cy="85" r="3" fill="#ba1a1a"></circle>
                    <rect x="25" y="45" width="125" height="34" rx="4" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"></rect>
                    <text x="31" y="58" className="font-data-mono text-[9px] fill-error font-bold">
                      HYPOMINERALIZATION
                    </text>
                    <text x="31" y="68" className="font-body-sm text-[8px] fill-on-surface-variant">
                      Delayed crystal maturation
                    </text>
                    <text x="31" y="76" className="font-data-mono text-[8px] fill-error font-bold">
                      Pore vol: {currentStage.porosity}
                    </text>
                  </g>
                  {/* Callout Pin: DEJ Structural Integrity */}
                  <g className="cursor-pointer">
                    <line x1="220" y1="125" x2="105" y2="145" stroke="#006a61" strokeWidth="1"></line>
                    <circle cx="220" cy="125" r="3" fill="#006a61"></circle>
                    <rect x="15" y="135" width="115" height="26" rx="4" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"></rect>
                    <text x="21" y="147" className="font-data-mono text-[9px] fill-on-surface font-bold">
                      DEJ JUNCTION GAUGE
                    </text>
                    <text x="21" y="157" className="font-data-mono text-[8px] fill-secondary font-bold">
                      {currentStage.dej} Interlocking Shear
                    </text>
                  </g>
                </svg>
                {/* Bottom Left Micro Gauge Indicators inside Viewport */}
                <div className="absolute bottom-space-sm left-space-sm flex flex-col gap-space-xs bg-surface-container-lowest/90 backdrop-blur p-space-sm rounded-lg shadow-sm">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      DEJ Shear Strength:
                    </span>
                    <span className="font-data-mono text-data-mono font-bold text-secondary">
                      {currentStage.dej}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Volumetric Porosity:
                    </span>
                    <span className="font-data-mono text-data-mono font-bold text-error">
                      {currentStage.porosity}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Apatite Dissolution Rate:
                    </span>
                    <span className="font-data-mono text-data-mono font-bold text-on-surface">
                      3.8x baseline
                    </span>
                  </div>
                </div>
                {/* Bottom Right Diagnostic Legend */}
                <div className="absolute bottom-space-sm right-space-sm flex items-center gap-space-xs bg-surface-container-lowest/90 backdrop-blur px-space-sm py-1 rounded font-label-sm text-label-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fde68a]"></span>
                  <span className="text-on-surface-variant">Dentin</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b45309] ml-1"></span>
                  <span className="text-on-surface-variant">Hypomineralized</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d3e4fe] ml-1"></span>
                  <span className="text-on-surface-variant">Outer Rim</span>
                </div>
              </div>
              {/* TFI 0 to TFI 9 Interactive Progression Stepper / Scrubber */}
              <div className="p-space-md bg-surface-container-low flex flex-col gap-space-sm border-t border-surface-container">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-lg text-headline-lg text-on-surface">
                      TFI Clinical Scale Scrubber
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      (Thylstrup-Fejerskov Index)
                    </span>
                  </div>
                  <span
                    className="font-label-md text-label-md px-space-sm py-0.5 rounded font-semibold"
                    style={{
                      backgroundColor:
                        tfiScore >= 5
                          ? "#ffdad6"
                          : tfiScore >= 3
                          ? "#fef3c7"
                          : "#e5eeff",
                      color:
                        tfiScore >= 5
                          ? "#93000a"
                          : tfiScore >= 3
                          ? "#b45309"
                          : "#006a61",
                    }}
                  >
                    TFI {tfiScore}: {currentStage.title.split(":")[1]}
                  </span>
                </div>
                {/* Step Slider */}
                <div className="flex flex-col gap-1">
                  <input
                    type="range"
                    min="0"
                    max="9"
                    step="1"
                    value={tfiScore}
                    onChange={(e) => setTfiScore(Number(e.target.value))}
                    className="w-full accent-secondary cursor-pointer h-2 bg-surface-container-highest rounded-lg"
                  />
                  {/* Stepper Ticks */}
                  <div className="grid grid-cols-10 text-center font-data-mono text-data-mono text-on-surface-variant pt-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                      <span
                        key={val}
                        className={`cursor-pointer ${
                          val === tfiScore ? "font-bold text-error" : "hover:text-on-surface"
                        }`}
                        onClick={() => setTfiScore(val)}
                      >
                        TFI {val}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Stage Descriptor Box */}
                <div className="p-space-sm bg-surface-container-lowest rounded-lg flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                    biotech
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {currentStage.title}
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {currentStage.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Longitudinal Trajectory & Clinical Treatment Pathways */}
          <div className="lg:col-span-12 xl:col-span-3 flex flex-col gap-space-md">
            {/* Risk Trajectory Graph */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-headline-lg text-headline-lg text-on-surface">
                  Longitudinal Trajectory
                </span>
                <span className="font-data-mono text-data-mono text-secondary font-bold">
                  AGE 6 → 25
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Structural intactness simulation comparing status-quo versus deep defluoridation intervention.
              </p>
              {/* SVG Sparkline / Graph */}
              <div className="w-full bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1">
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>Crown Integrity %</span>
                  <span>Age Horizon</span>
                </div>
                <svg className="w-full h-28" viewBox="0 0 280 120">
                  <line x1="0" y1="30" x2="280" y2="30" stroke="#e5eeff" strokeWidth="1"></line>
                  <line x1="0" y1="60" x2="280" y2="60" stroke="#e5eeff" strokeWidth="1"></line>
                  <line x1="0" y1="90" x2="280" y2="90" stroke="#e5eeff" strokeWidth="1"></line>
                  <path
                    d="M 10 20 L 70 35 L 120 42 L 180 44 L 270 45"
                    fill="none"
                    stroke="#006a61"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  ></path>
                  <circle cx="270" cy="45" r="3.5" fill="#006a61"></circle>
                  <path
                    d="M 10 20 L 70 35 L 120 60 L 180 95 L 270 115"
                    fill="none"
                    stroke="#ba1a1a"
                    strokeWidth="2.5"
                    strokeDasharray="4,3"
                    strokeLinecap="round"
                  ></path>
                  <circle cx="270" cy="115" r="3.5" fill="#ba1a1a"></circle>
                  <text x="125" y="38" className="font-data-mono text-[8px] fill-secondary font-bold">
                    Defluoridated Safe Water
                  </text>
                  <text x="125" y="80" className="font-data-mono text-[8px] fill-error font-bold">
                    Unmitigated Exposure
                  </text>
                </svg>
                <div className="flex items-center justify-between font-label-sm text-label-sm pt-1 border-t border-surface-container">
                  <span className="flex items-center gap-1 text-secondary font-semibold">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span> With Bone-Char Filter (78% retain)
                  </span>
                  <span className="flex items-center gap-1 text-error font-semibold">
                    <span className="w-2 h-2 rounded-full bg-error"></span> Failure @ 21.8y
                  </span>
                </div>
              </div>
            </div>

            {/* Clinical Treatment Pathway Recommendation Engine */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-headline-lg text-headline-lg text-on-surface">
                  Clinical Decision Protocol
                </span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface font-semibold">
                  Triage Grade 3
                </span>
              </div>
              {/* Protocol Cards */}
              <div className="flex flex-col gap-space-xs">
                {/* Pathway 1: Active Infiltration */}
                <div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      Resin Infiltration (Icon® Protocol)
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary font-bold">
                      Recommended
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    15% HCl conditioning followed by low-viscosity TEGDMA monomer capillary occlusion of porous lesion body.
                  </p>
                </div>
                {/* Pathway 2: Remineralization */}
                <div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      Bio-available CPP-ACP Therapy
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Secondary
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Casein phosphopeptide amorphous calcium phosphate regimen to induce remineralization of sub-surface zones.
                  </p>
                </div>
                {/* Pathway 3: Micro-abrasion */}
                <div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      Enamel Micro-abrasion
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Contraindicated
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Rotary pumice with 6.6% hydrochloric acid. Unsafe if hypomineralization depth exceeds 200μm.
                  </p>
                </div>
                {/* Pathway 4: Full Restorative Crown */}
                <div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      Indirect Zirconia Full Coverage
                    </span>
                    <span className="font-label-sm text-label-sm text-error font-semibold">
                      Stage 7–9 Only
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Reserved for gross loss of tooth coronal vertical dimension with active pulpal sensitivity.
                  </p>
                </div>
              </div>
              {/* Community Defluoridation Mitigation Action Box */}
              <div className="p-space-sm bg-secondary-container rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-secondary-container font-bold">
                    Link Borehole Defluoridator
                  </span>
                  <span className="font-body-sm text-body-sm text-on-secondary-container">
                    Community Unit #4 (Kuresoi North)
                  </span>
                </div>
                <button className="px-space-sm py-1 bg-secondary text-on-secondary rounded font-label-sm text-label-sm font-semibold hover:bg-on-secondary-container transition-colors">
                  Dispatch Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comparative Micro-CT Radiograph Gallery (Bottom Section) */}
        <div className="w-full bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-space-xs">
            <div>
              <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                Histological Ground Truth
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Micro-CT Radiographic Validation Samples
              </h2>
            </div>
            <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
              <span>
                Synced with Field Mobile Scanners • KEMRI Nairobi Fluorosis Biobank
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
            {/* Sample 1: Healthy Control */}
            <div className="flex flex-col bg-surface-container-low rounded-lg overflow-hidden group">
              <div
                className="h-36 w-full relative bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXUA1oow4Tt60tx4gO92EjsKznxjEhEDJxA2Efw5CZSLuER98JnF3JLeZX8Lj51WPxhl8L3YHUk71-Xnkn_5oKFfau6UmT8dDuA67dC7ZPdw7myjsFXYFgN5GYfpV3TIcLilnRg1OVeTYUzqkmnJLsBkVBsY25K1m1jN7p-4pAl0iEt93DIFEgTCCK_6TEy4mmfKAHelQHCf0W6FFJpHNj7vqbqMlS2iZ5wPy0cwEZ6FvfTUo3-0M')",
                }}
              >
                <div className="absolute top-2 left-2 px-space-xs py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-data-mono text-data-mono">
                  TFI 0 (Control)
                </div>
              </div>
              <div className="p-space-sm flex flex-col gap-0.5">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Normal Prism Structure
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Porosity &lt; 0.5% • Prism cores intact
                </span>
              </div>
            </div>
            {/* Sample 2: Moderate TFI 3 */}
            <div className="flex flex-col bg-surface-container-low rounded-lg overflow-hidden group">
              <div
                className="h-36 w-full relative bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD5YsYgqGg5KqeuLj-K4ElYOT-rTr4ZflMz1OF3Auvwi0fuSzKewMit2JH7sHHOdkRF_xN5r3fO67U7thtDRMZiT2ue5ZzymGuHxl4FFE5J0kaRtaiwt1X6CnXXjDihmVd1MeTsrrdde6ixdGYg6yceza-94J3sCHaVwcWUcV0mF3HpzWA5cAqRWYxEpqHJGwImC0Y2Ac4TkFtTWO7vrC09DcI0mN5nm7B9T6TRggYbzVAhEWnRFeE')",
                }}
              >
                <div className="absolute top-2 left-2 px-space-xs py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-data-mono text-data-mono">
                  TFI 3 (Moderate)
                </div>
              </div>
              <div className="p-space-sm flex flex-col gap-0.5">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Cloudy Subsurface Lamination
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Porosity 8.2% • Extended striae of Retzius
                </span>
              </div>
            </div>
            {/* Sample 3: Severe Pitted TFI 5 */}
            <div className="flex flex-col bg-surface-container-high rounded-lg overflow-hidden ring-2 ring-secondary group">
              <div
                className="h-36 w-full relative bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbBNlGIh7C5WzHsHjez4FW3UA6RLbz8TmiYUTGv6-CEHLHNiIck6w-Ad8Yrk6sbxIiiqSpvVtwR2TIc-GlioNfvZj-lsv7pbcVP3Nf_Pin2myakXcdAD3Rl3-EPztp11rKvzhL1oUscVct5vYfk60KV6MEsoHjCRKTgpfkj2We4oQrY1zHr3LhDSSTQ6sh4i0s4RG3a8EhKJbYshRsJgdE-EqJLFq_QWJYNZxgM2JcnM6Lj_yfXnA')",
                }}
              >
                <div className="absolute top-2 left-2 px-space-xs py-0.5 rounded bg-error text-on-error font-data-mono text-data-mono">
                  TFI 5 (Simulated Match)
                </div>
              </div>
              <div className="p-space-sm flex flex-col gap-0.5">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Focal Enamel Micro-Craters
                </span>
                <span className="font-body-sm text-body-sm text-error font-medium">
                  Porosity 28.4% • Post-eruptive loss
                </span>
              </div>
            </div>
            {/* Sample 4: Gross Destruction TFI 8 */}
            <div className="flex flex-col bg-surface-container-low rounded-lg overflow-hidden group">
              <div
                className="h-36 w-full relative bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMM9yaJtmTB8O433yunJ3EMM6pjln8iSzvNlhTVdUoJNrAsQB4qGOxohjicnpYc6SreIG-rHBri4B6EeufNwhUh72WcdXFXvZZpk9cAnRO8LmZ8BS3gAOL2TEn2zIDPivtyqlNC2idgDsUURcqIRunNxTLEHZ5tlkWZ-52z19kRqdP0d2mgDLdkRJ1a9mKc4t3-23wlGgN_fLxoy12XV730KViCbKUtrRTX7kYw4Wu75241IYihXM')",
                }}
              >
                <div className="absolute top-2 left-2 px-space-xs py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-data-mono text-data-mono">
                  TFI 8 (Advanced)
                </div>
              </div>
              <div className="p-space-sm flex flex-col gap-0.5">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Gross Anatomical Collapse
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Porosity &gt; 50% • Total outer shell shearing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
