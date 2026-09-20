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
  0: { title: "TFI Stage 0: Normal Translucent Enamel", text: "Normal translucency and smooth uniform glass-like texture.", color: "#006a61", porosity: "0.2%", dej: "98.5%", mineral: "96.4%", pittingOpacity: 0.0, defectStart: "#fed7aa", defectMid: "#ffffff" },
  1: { title: "TFI Stage 1: Fine White Lines along Perikymata", text: "Fine white lines traverse the tooth crown along perikymata.", color: "#006a61", porosity: "2.8%", dej: "96.0%", mineral: "93.1%", pittingOpacity: 0.0, defectStart: "#fde68a", defectMid: "#fef3c7" },
  2: { title: "TFI Stage 2: Pronounced White Retzius Striations", text: "Distinct white striae covering less than 25% of anatomical surface.", color: "#006a61", porosity: "5.4%", dej: "94.2%", mineral: "89.8%", pittingOpacity: 0.0, defectStart: "#fde68a", defectMid: "#fef08a" },
  3: { title: "TFI Stage 3: Cloudy Confluent Chalky Patches", text: "Confluent white chalky opacities spread across extensive areas.", color: "#b45309", porosity: "11.6%", dej: "91.0%", mineral: "85.2%", pittingOpacity: 0.1, defectStart: "#d97706", defectMid: "#fde68a" },
  4: { title: "TFI Stage 4: Widespread Chalky Opaque Shell", text: "Entire tooth surface demonstrates opaque porcelain-chalk white appearance.", color: "#b45309", porosity: "18.2%", dej: "88.0%", mineral: "79.5%", pittingOpacity: 0.3, defectStart: "#d97706", defectMid: "#fed7aa" },
  5: { title: "TFI Stage 5: Distinct Pitting & Post-Eruptive Loss", text: "Round pitting <2mm in diameter occurring on outer enamel shell.", color: "#ba1a1a", porosity: "28.4%", dej: "84.0%", mineral: "71.6%", pittingOpacity: 0.85, defectStart: "#b45309", defectMid: "#d97706" },
  6: { title: "TFI Stage 6: Merged Pit Trenches & Ochre Bands", text: "Micro-pits coalesce into horizontal grooves and trenches.", color: "#ba1a1a", porosity: "34.1%", dej: "79.0%", mineral: "66.2%", pittingOpacity: 1.0, defectStart: "#9a3412", defectMid: "#b45309" },
  7: { title: "TFI Stage 7: Extensive Irregular Enamel Breakdown", text: "Loss of outermost enamel layer over areas <50% of crown.", color: "#ba1a1a", porosity: "42.0%", dej: "72.5%", mineral: "59.8%", pittingOpacity: 1.0, defectStart: "#78350f", defectMid: "#9a3412" },
  8: { title: "TFI Stage 8: Loss of >50% Enamel Morphology", text: "Outer enamel shell loss exceeds 50% of crown surface.", color: "#ba1a1a", porosity: "49.5%", dej: "64.0%", mineral: "52.4%", pittingOpacity: 1.0, defectStart: "#451a03", defectMid: "#78350f" },
  9: { title: "TFI Stage 9: Severe Loss of Coronal Dimension", text: "Gross loss of enamel shape, cusps and vertical coronal dimension.", color: "#ba1a1a", porosity: "58.2%", dej: "51.0%", mineral: "44.0%", pittingOpacity: 1.0, defectStart: "#451a03", defectMid: "#78350f" },
};

export function TwinPanel() {
  const [fIntake, setFIntake] = useState<number>(6.2);
  const [durationMonths, setDurationMonths] = useState<number>(52);
  const [genePenetrance, setGenePenetrance] = useState<"low" | "base" | "high">("high");
  const [targetModel, setTargetModel] = useState<string>("incisor");
  const [tfiScore, setTfiScore] = useState<number>(5);
  const [selectedPathway, setSelectedPathway] = useState<string>("icon");

  // Dropdown states
  const [showInputsAccordion, setShowInputsAccordion] = useState<boolean>(true);
  const [showCallouts, setShowCallouts] = useState<boolean>(true);
  const [showGallery, setShowGallery] = useState<boolean>(false);

  const currentStage = TFI_STAGES[tfiScore] || TFI_STAGES[5];

  const handleFluorideChange = (val: number) => {
    setFIntake(val);
    const score = Math.min(9, Math.round((val / 12) * 6 + (durationMonths / 72) * 3));
    setTfiScore(score);
  };

  const PATHWAYS: Record<string, { title: string; rec: string; desc: string }> = {
    icon: {
      title: "Resin Infiltration (Icon® Protocol)",
      rec: "Recommended",
      desc: "15% HCl conditioning followed by low-viscosity TEGDMA monomer capillary occlusion of porous lesion body.",
    },
    cpp: {
      title: "Bio-available CPP-ACP Therapy",
      rec: "Secondary Option",
      desc: "Casein phosphopeptide amorphous calcium phosphate regimen to induce remineralization of sub-surface zones.",
    },
    micro: {
      title: "Enamel Micro-abrasion",
      rec: "Contraindicated",
      desc: "Rotary pumice with 6.6% HCl. Unsafe if hypomineralization depth exceeds 200μm.",
    },
    crown: {
      title: "Indirect Zirconia Full Coverage",
      rec: "Stage 7–9 Only",
      desc: "Reserved for gross loss of tooth coronal vertical dimension with active pulpal sensitivity.",
    },
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-gutter-desktop py-space-md max-w-[1720px] mx-auto flex flex-col gap-space-md">
        {/* Streamlined Top Control Banner */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                Cohort Subject
              </span>
              <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
                Rift-Valley-Child-702B
              </div>
            </div>

            <div className="h-8 w-px bg-surface-container hidden sm:block"></div>

            <div>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                Simulated Stage
              </span>
              <div className="font-headline-lg text-headline-lg font-bold" style={{ color: currentStage.color }}>
                TFI Stage {tfiScore}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg shadow-sm hover:bg-primary-container transition-colors flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                play_arrow
              </span>
              <span>Run Simulation</span>
            </button>

            <button
              className="px-3 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-lg border border-surface-container transition-colors flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              <span>Export Twin</span>
            </button>
          </div>
        </div>

        {/* Primary Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          {/* LEFT: Parameters Accordion (3 cols) */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-space-md">
            {/* Parameters Accordion Card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    tune
                  </span>
                  Micro-Environment Inputs
                </span>
                <button
                  type="button"
                  onClick={() => setShowInputsAccordion(!showInputsAccordion)}
                  className="p-1 rounded text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showInputsAccordion ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </div>

              {showInputsAccordion && (
                <div className="space-y-3">
                  {/* Dental Model Dropdown */}
                  <div>
                    <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1 font-semibold uppercase">
                      Target Dental Model Dropdown
                    </label>
                    <select
                      value={targetModel}
                      onChange={(e) => setTargetModel(e.target.value)}
                      className="w-full bg-surface-container-low text-on-surface p-2 rounded-lg font-body-sm text-body-sm border border-surface-container cursor-pointer outline-none"
                    >
                      <option value="incisor">Maxillary Central Incisor (11/21)</option>
                      <option value="molar">First Permanent Molar (16/26)</option>
                    </select>
                  </div>

                  {/* Fluoride Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-body-sm">
                      <span className="text-on-surface-variant font-medium">Drinking Water F⁻:</span>
                      <span className="font-data-mono font-bold text-error">{fIntake.toFixed(1)} ppm</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="12.0"
                      step="0.1"
                      value={fIntake}
                      onChange={(e) => handleFluorideChange(Number(e.target.value))}
                      className="w-full accent-secondary cursor-pointer h-1.5 bg-surface-container rounded-lg"
                    />
                  </div>

                  {/* Duration Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-body-sm">
                      <span className="text-on-surface-variant font-medium">Crown Exposure:</span>
                      <span className="font-data-mono font-bold text-on-surface">{durationMonths} Mo</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="72"
                      step="1"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                      className="w-full accent-secondary cursor-pointer h-1.5 bg-surface-container rounded-lg"
                    />
                  </div>

                  {/* Genetic Selector */}
                  <div>
                    <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1 font-semibold uppercase">
                      AMELX Genetic Penetrance
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-lg font-label-sm text-[11px]">
                      <button
                        type="button"
                        onClick={() => setGenePenetrance("low")}
                        className={`py-1 rounded text-center font-bold transition-colors ${genePenetrance === "low" ? "bg-surface-container-lowest text-secondary shadow-xs" : "text-on-surface-variant"}`}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenePenetrance("base")}
                        className={`py-1 rounded text-center font-bold transition-colors ${genePenetrance === "base" ? "bg-surface-container-lowest text-secondary shadow-xs" : "text-on-surface-variant"}`}
                      >
                        Base
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenePenetrance("high")}
                        className={`py-1 rounded text-center font-bold transition-colors ${genePenetrance === "high" ? "bg-surface-container-lowest text-secondary shadow-xs" : "text-on-surface-variant"}`}
                      >
                        High
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Cross Section & TFI Stage Scrubber (6 cols) */}
          <div className="lg:col-span-8 xl:col-span-6 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    biotech
                  </span>
                  Sagittal Tooth Cross-Section
                </span>

                {/* Toggle Callouts Dropdown / Switch */}
                <button
                  type="button"
                  onClick={() => setShowCallouts(!showCallouts)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm border border-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    label
                  </span>
                  <span>Anatomical Pins: {showCallouts ? "ON" : "OFF"}</span>
                </button>
              </div>

              {/* Viewport */}
              <div className="relative w-full h-[380px] bg-surface-container-low rounded-lg p-2 flex items-center justify-center overflow-hidden select-none">
                <svg className="w-full h-full max-h-[350px]" viewBox="0 0 540 380">
                  {/* Dentin */}
                  <path d="M 160 140 Q 255 80 345 140 Q 360 210 335 250 L 170 250 Q 145 210 160 140 Z" fill="#fde68a" stroke="#d97706" strokeWidth="0.5"></path>
                  {/* DEJ */}
                  <path d="M 152 145 Q 255 72 353 145" fill="none" stroke="#006a61" strokeWidth="3" strokeDasharray="2,2"></path>
                  {/* Enamel */}
                  <path d="M 135 155 Q 255 40 370 155 Q 360 120 353 145 Q 255 72 152 145 Q 142 125 135 155 Z" fill="#d3e4fe" opacity="0.85"></path>

                  {/* Callout Pins */}
                  {showCallouts && (
                    <g>
                      <line x1="330" y1="90" x2="410" y2="70" stroke="#006a61" strokeWidth="1"></line>
                      <rect x="410" y="55" width="115" height="24" rx="4" fill="#ffffff"></rect>
                      <text x="416" y="70" className="font-data-mono text-[9px] fill-on-surface font-bold">OUTER ENAMEL RIM</text>
                    </g>
                  )}
                </svg>
              </div>

              {/* TFI Stage Scrubber Dropdown & Slider */}
              <div className="p-3 bg-surface-container-low rounded-lg space-y-2 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    TFI Scale Selector Dropdown
                  </span>

                  {/* TFI Dropdown */}
                  <select
                    value={tfiScore}
                    onChange={(e) => setTfiScore(Number(e.target.value))}
                    className="bg-surface-container-lowest text-on-surface font-data-mono font-bold text-body-sm px-2.5 py-1 rounded-lg border border-surface-container outline-none cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                      <option key={s} value={s}>
                        TFI Stage {s}: {TFI_STAGES[s].title.split(":")[1]}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="range"
                  min="0"
                  max="9"
                  step="1"
                  value={tfiScore}
                  onChange={(e) => setTfiScore(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer h-2 bg-surface-container rounded-lg"
                />

                <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                  {currentStage.text}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Clinical Protocol Dropdown (3 cols) */}
          <div className="lg:col-span-12 xl:col-span-3 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    medical_services
                  </span>
                  Clinical Pathway
                </span>
              </div>

              {/* Pathway Selector Dropdown */}
              <div>
                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1 font-semibold uppercase">
                  Select Intervention Dropdown
                </label>
                <select
                  value={selectedPathway}
                  onChange={(e) => setSelectedPathway(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface p-2 rounded-lg font-body-sm text-body-sm border border-surface-container outline-none cursor-pointer"
                >
                  <option value="icon">Resin Infiltration (Icon® Protocol)</option>
                  <option value="cpp">Bio-available CPP-ACP Therapy</option>
                  <option value="micro">Enamel Micro-abrasion</option>
                  <option value="crown">Indirect Zirconia Full Coverage</option>
                </select>
              </div>

              {/* Pathway Detail Card */}
              <div className="p-3 bg-surface-container-low rounded-lg space-y-1.5 border border-surface-container">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    {PATHWAYS[selectedPathway].title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold">
                    {PATHWAYS[selectedPathway].rec}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {PATHWAYS[selectedPathway].desc}
                </p>
              </div>
            </div>

            {/* Collapsible Radiograph Gallery Dropdown */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-2">
              <button
                type="button"
                onClick={() => setShowGallery(!showGallery)}
                className="w-full flex items-center justify-between bg-surface-container-low hover:bg-surface-container text-on-surface p-2.5 rounded-lg font-label-md text-label-md border border-surface-container transition-colors"
              >
                <span className="font-bold">Micro-CT Radiograph Samples</span>
                <span className="material-symbols-outlined text-[18px]">
                  {showGallery ? "expand_less" : "expand_more"}
                </span>
              </button>

              {showGallery && (
                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-surface-container-low border border-surface-container">
                    <span className="font-bold block text-on-surface">TFI 0 Control</span>
                    <span className="text-on-surface-variant">Porosity &lt;0.5%</span>
                  </div>
                  <div className="p-2 rounded bg-surface-container-low border border-surface-container">
                    <span className="font-bold block text-error">TFI 5 Pitted</span>
                    <span className="text-on-surface-variant">Porosity 28.4%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
