"use client";

import { useState, useEffect } from "react";

interface SimulationStage {
  year: number;
  deansIndex: string;
  tfiScore: number;
  histology: string;
  clinicalPresentation: string;
  recommendedIntervention: string;
  enamelColor: string;
  pittingLevel: number; // 0: none, 1: micro, 2: confluent, 3: severe loss
}

const STAGES: SimulationStage[] = [
  {
    year: 0,
    deansIndex: "Normal",
    tfiScore: 0,
    histology: "Uniform hydroxyapatite prismatic crystal lattice. Normal ameloblast function.",
    clinicalPresentation: "Smooth, translucent ivory-white enamel. Perikymata intact.",
    recommendedIntervention: "Standard oral hygiene, fluoridated toothpaste (1000–1450 ppm) in low-fluoride zones.",
    enamelColor: "#FAF8F2",
    pittingLevel: 0,
  },
  {
    year: 1,
    deansIndex: "Questionable",
    tfiScore: 1,
    histology: "Slight increase in subsurface enamel porosity across outer 30–50 μm.",
    clinicalPresentation: "Faint paper-white accentuations along perikymata lines, visible mainly when desiccated.",
    recommendedIntervention: "Verify drinking water source; baseline clinical photography; routine preventive checkup.",
    enamelColor: "#F4EFE6",
    pittingLevel: 0,
  },
  {
    year: 2,
    deansIndex: "Very Mild",
    tfiScore: 2,
    histology: "Subsurface hypomineralization extending into outer third of enamel.",
    clinicalPresentation: "Fine snow-white horizontal striations across incisal and occlusal surfaces.",
    recommendedIntervention: "Water testing; counseling on non-fluoridated bottled/rainwater for children under 8.",
    enamelColor: "#EFE8DA",
    pittingLevel: 0,
  },
  {
    year: 3,
    deansIndex: "Mild",
    tfiScore: 3,
    histology: "Pronounced interprismatic pore volume; porous zone covers up to 50% of crown.",
    clinicalPresentation: "Cloudy white opaque patches covering up to a third of facial enamel surfaces.",
    recommendedIntervention: "Topical casein phosphopeptide-amorphous calcium phosphate (CPP-ACP) remineralization.",
    enamelColor: "#E8DCBA",
    pittingLevel: 0,
  },
  {
    year: 4,
    deansIndex: "Mild to Moderate",
    tfiScore: 4,
    histology: "Marked hypomineralization. Exogenous post-eruptive pigment penetration into porosity.",
    clinicalPresentation: "Continuous chalky chalkiness with initial light tan/brown staining at incisal margins.",
    recommendedIntervention: "Enamel microabrasion with hydrochloric acid-pumice slurry; community filter deployment.",
    enamelColor: "#DFCE9F",
    pittingLevel: 0,
  },
  {
    year: 5,
    deansIndex: "Moderate",
    tfiScore: 5,
    histology: "Loss of outermost hypermineralized enamel shell. Isolated surface micro-pits (<2mm).",
    clinicalPresentation: "Noticeable light brown to dark brown discoloration with small scattered enamel pits.",
    recommendedIntervention: "Resin infiltration (ICON) or direct composite bonding; point-of-use defluoridation unit.",
    enamelColor: "#D6B878",
    pittingLevel: 1,
  },
  {
    year: 6,
    deansIndex: "Moderate to Severe",
    tfiScore: 6,
    histology: "Coalescing enamel micro-cavities due to masticatory stress on fragile hypomineralized enamel.",
    clinicalPresentation: "Definite confluent horizontal bands of brown pitting across facial surfaces.",
    recommendedIntervention: "Conservative direct composite restorations; dietary surveillance; clinical monitoring.",
    enamelColor: "#C99C53",
    pittingLevel: 2,
  },
  {
    year: 7,
    deansIndex: "Severe",
    tfiScore: 7,
    histology: "Extensive loss of outer enamel prism structure (>30% of surface area).",
    clinicalPresentation: "Widespread brown to dark brownish-black pits and furrowing across enamel.",
    recommendedIntervention: "Indirect composite or ceramic veneers; dentin desensitizing agents; strict water source change.",
    enamelColor: "#BA7C3B",
    pittingLevel: 2,
  },
  {
    year: 8,
    deansIndex: "Severe",
    tfiScore: 8,
    histology: "Deep enamel destruction extending to the amelodentinal junction (ADJ).",
    clinicalPresentation: "Loss of normal tooth contour; widespread pitting and stained corroded appearance.",
    recommendedIntervention: "Full-coverage pediatric crowns or restorative prosthodontics; pain/sensitivity management.",
    enamelColor: "#A8602E",
    pittingLevel: 3,
  },
  {
    year: 9,
    deansIndex: "Severe Confluent",
    tfiScore: 9,
    histology: "Complete breakdown of outermost enamel; secondary dentinal sclerosis and tubular occlusion.",
    clinicalPresentation: "Corroded dark brown enamel shell with exposed sensitive dentin; altered occlusion.",
    recommendedIntervention: "Multidisciplinary restorative rehabilitation; county referral hospital follow-up.",
    enamelColor: "#934A26",
    pittingLevel: 3,
  },
  {
    year: 10,
    deansIndex: "Terminal Severe",
    tfiScore: 9,
    histology: "Massive enamel loss, irregular tertiary dentin formation, severe attrition and fracture susceptibility.",
    clinicalPresentation: "Severely mutilated crown shape, deep dark brown-black staining, high secondary fracture rate.",
    recommendedIntervention: "Comprehensive prosthodontic restoration; community bone-char filtration infrastructure.",
    enamelColor: "#7F381F",
    pittingLevel: 3,
  },
];

export function TwinPanel() {
  const [year, setYear] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const stage = STAGES[year];

  // Auto play animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setYear((prev) => {
          if (prev >= 10) {
            setIsPlaying(false);
            return 10;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <section id="panel-twin" role="tabpanel" aria-labelledby="tab-twin">
      <div className="mb-7 max-w-2xl">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-clay/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-clay">
          Layer 3 · Digital Twin Simulation Engine
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink mt-2">
          Biomechanical Enamel Degradation Twin
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Simulates longitudinal ameloblast disruption and post-eruptive porous enamel degradation
          under chronic endemic fluoride exposure (&gt;4.0 ppm F⁻) without water intervention.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Interactive Tooth Visualizer (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-line-soft pb-3 mb-5">
              <div>
                <h3 className="text-lg font-display font-semibold text-ink">
                  Incisal Cross-Section Simulation
                </h3>
                <p className="text-xs text-ink-soft">
                  Progressive hypomineralization time-series at Year {year}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition flex items-center gap-1.5 ${
                    isPlaying
                      ? "bg-clay text-white"
                      : "bg-teal text-white hover:bg-teal-bright"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <span className="h-2 w-2 rounded-sm bg-white" /> Pause
                    </>
                  ) : (
                    <>
                      <span className="text-[0.6rem]">▶</span> Auto Simulate
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setYear(0);
                  }}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-soft hover:bg-surface-alt"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* SVG Tooth Illustration */}
            <div className="flex flex-col items-center justify-center py-4 bg-surface-alt/40 rounded-xl border border-line-soft relative">
              <svg width="280" height="260" viewBox="0 0 280 260" className="drop-shadow-sm">
                <defs>
                  {/* Dentin Gradient */}
                  <linearGradient id="dentinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F5E4B7" />
                    <stop offset="100%" stopColor="#E2CA92" />
                  </linearGradient>

                  {/* Pulp Gradient */}
                  <linearGradient id="pulpGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E07A7A" />
                    <stop offset="100%" stopColor="#C45252" />
                  </linearGradient>
                </defs>

                {/* Gingiva / Gum Base */}
                <ellipse cx="140" cy="195" rx="100" ry="32" fill="#E8B5B5" opacity="0.6" />
                <path
                  d="M40 195 Q140 225 240 195 L240 230 Q140 250 40 230 Z"
                  fill="#D99B9B"
                  opacity="0.8"
                />

                {/* Enamel Crown Shell */}
                <path
                  d="M90 60 C90 35, 120 30, 140 30 C160 30, 190 35, 190 60 L195 170 C195 185, 175 195, 140 195 C105 195, 85 185, 85 170 Z"
                  fill={stage.enamelColor}
                  stroke="#C5BCA8"
                  strokeWidth="2.5"
                  className="transition-colors duration-700"
                />

                {/* Subsurface Pores & Stains */}
                {year > 0 && (
                  <path
                    d="M95 65 C95 45, 120 40, 140 40 C160 40, 185 45, 185 65 L188 160 C188 170, 170 180, 140 180 C110 180, 92 170, 92 160 Z"
                    fill="black"
                    opacity={Math.min(0.35, (year / 10) * 0.4)}
                  />
                )}

                {/* Dentin Layer */}
                <path
                  d="M102 75 C102 55, 122 50, 140 50 C158 50, 178 55, 178 75 L180 165 C180 175, 165 185, 140 185 C115 185, 100 175, 100 165 Z"
                  fill="url(#dentinGrad)"
                  stroke="#D3BA80"
                  strokeWidth="1.5"
                />

                {/* Pulp Chamber & Canal */}
                <path
                  d="M125 105 C125 95, 133 90, 140 90 C147 90, 155 95, 155 105 L150 185 C150 190, 145 195, 140 195 C135 195, 130 190, 130 185 Z"
                  fill="url(#pulpGrad)"
                  opacity="0.85"
                />

                {/* Surface Micro-Pitting Visuals */}
                {stage.pittingLevel >= 1 && (
                  <g fill="#422115" opacity="0.8">
                    <circle cx="108" cy="85" r="2.2" />
                    <circle cx="116" cy="115" r="1.8" />
                    <circle cx="165" cy="95" r="2.5" />
                    <circle cx="170" cy="125" r="2.0" />
                  </g>
                )}
                {stage.pittingLevel >= 2 && (
                  <g fill="#2D1409" opacity="0.85">
                    <ellipse cx="120" cy="70" rx="4" ry="2" />
                    <ellipse cx="155" cy="80" rx="5" ry="2.5" />
                    <circle cx="140" cy="130" r="3" />
                    <ellipse cx="112" cy="140" rx="3.5" ry="1.8" />
                  </g>
                )}
                {stage.pittingLevel >= 3 && (
                  <g fill="#1F0D06">
                    <path d="M100 65 Q115 80 130 68 Q140 85 165 70 Q180 80 185 65 Z" />
                    <ellipse cx="138" cy="110" rx="9" ry="4" />
                    <ellipse cx="160" cy="140" rx="7" ry="3.5" />
                  </g>
                )}

                {/* Anatomical Annotations */}
                <text x="140" y="245" textAnchor="middle" className="font-mono text-[10px]" fill="#4B5B54">
                  Simulated Maxillary Incisor · Transverse Biomechanical Section
                </text>
              </svg>

              {/* Staging overlay badges */}
              <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur rounded-md px-2 py-1 text-[0.68rem] font-mono border border-line">
                TFI Index: <span className="font-bold text-teal">{stage.tfiScore}/9</span>
              </div>
              <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur rounded-md px-2 py-1 text-[0.68rem] font-mono border border-line">
                Dean's: <span className="font-bold text-clay">{stage.deansIndex}</span>
              </div>
            </div>

            {/* Slider Control */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs text-ink">
                <span className="font-medium">Longitudinal Fluoride Exposure Duration:</span>
                <span className="font-mono font-bold text-teal text-sm">
                  {year} {year === 1 ? "Year" : "Years"}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={year}
                onChange={(e) => {
                  setIsPlaying(false);
                  setYear(Number(e.target.value));
                }}
                className="w-full h-2 rounded-lg bg-line accent-teal cursor-pointer"
              />
              <div className="flex justify-between text-[0.65rem] font-mono text-ink-soft">
                <span>0 yr (Baseline)</span>
                <span>2 yrs (Mild)</span>
                <span>5 yrs (Moderate)</span>
                <span>7 yrs (Severe)</span>
                <span>10 yrs (Terminal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Histological & Clinical Profile (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-line-soft pb-3 mb-4">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-clay">
                Pathological Assessment
              </span>
              <h3 className="text-xl font-display font-bold text-ink mt-0.5">
                Year {year} · {stage.deansIndex} Fluorosis
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-line bg-surface-alt/50 p-3.5">
                <div className="font-semibold text-ink uppercase tracking-wider text-[0.68rem] mb-1 text-teal">
                  Clinical Presentation
                </div>
                <p className="text-ink leading-relaxed font-medium">
                  {stage.clinicalPresentation}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-surface-alt/50 p-3.5">
                <div className="font-semibold text-ink uppercase tracking-wider text-[0.68rem] mb-1 text-clay">
                  Micro-Structure & Histology
                </div>
                <p className="text-ink-soft leading-relaxed">
                  {stage.histology}
                </p>
              </div>

              <div className="rounded-xl border border-teal/30 bg-teal-wash/60 p-3.5">
                <div className="font-semibold text-teal uppercase tracking-wider text-[0.68rem] mb-1">
                  Public Health & Clinical Recommendation
                </div>
                <p className="text-ink leading-relaxed font-medium">
                  {stage.recommendedIntervention}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-line-soft pt-4 text-[0.7rem] text-ink-soft leading-relaxed">
            Simulated in accordance with the <em>Thylstrup-Fejerskov Index (TFI)</em> and WHO criteria for
            endemic dental fluorosis longitudinal progression in East African volcanic aquifers.
          </div>
        </div>
      </div>
    </section>
  );
}
