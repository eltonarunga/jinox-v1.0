"use client";

import { useState } from "react";

export function FluorosisPanel() {
  const [activeFilter, setActiveFilter] = useState<"all" | "hot" | "safe">("all");
  const [protocol, setProtocol] = useState<string>("critical");
  const [customSms, setCustomSms] = useState<string>(
    "JINOX ALERT: Nakuru Well #04 exceeds safe fluorosis threshold (7.1 ppm). Divert children <8 yrs to Community Filter Hub B. Ministry of Health Protocol #K-41."
  );
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchSent, setDispatchSent] = useState<boolean>(false);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchSent(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-gutter-desktop py-space-md flex flex-col gap-space-lg">
        {/* Top Telemetry Status Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {/* Stat 1 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">
                Monitored Rift Wells
              </span>
              <span className="flex items-center gap-1 px-space-xs py-0.5 rounded bg-surface-container text-on-secondary-container font-data-mono text-body-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                LIVE 1Hz
              </span>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg font-bold text-on-surface">
                1,482
              </span>
              <span className="font-label-md text-label-md text-on-secondary-container font-semibold">
                +14 this cycle
              </span>
            </div>
            <div className="mt-space-xs flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                sensors
              </span>
              <span>WRMA Telemetry Network Online</span>
            </div>
          </div>
          {/* Stat 2 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">
                Mean Fluoride Level
              </span>
              <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                386% WHO Baseline
              </span>
            </div>
            <div className="mt-space-sm flex items-baseline gap-space-xs">
              <span className="font-display-lg text-display-lg font-bold text-error">
                5.8
              </span>
              <span className="font-headline-lg text-headline-lg text-error font-semibold">
                ppm F⁻
              </span>
              <span className="ml-auto font-data-mono text-body-sm text-on-surface-variant">
                Baseline: 1.5
              </span>
            </div>
            <div className="mt-space-xs w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-error h-full rounded-full"
                style={{ width: "78%" }}
              ></div>
            </div>
          </div>
          {/* Stat 3 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">
                Pop. Vulnerability
              </span>
              <span className="material-symbols-outlined text-primary-container text-[20px]">
                groups
              </span>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg font-bold text-on-surface">
                2.14M
              </span>
              <span className="font-label-md text-label-md text-error font-semibold">
                High Exposure
              </span>
            </div>
            <div className="mt-space-xs flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>Skeletal &amp; Dental Fluorosis</span>
              <span className="font-data-mono text-on-surface font-medium">
                6 Counties
              </span>
            </div>
          </div>
          {/* Stat 4 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">
                Filtration Status
              </span>
              <span className="font-data-mono text-label-sm text-on-secondary-container font-semibold">
                948 / 1,482 Active
              </span>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg font-bold text-on-surface">
                64%
              </span>
              <span className="font-label-md text-label-md text-secondary font-semibold">
                Bone-Char / Alumina
              </span>
            </div>
            <div className="mt-space-xs flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                verified
              </span>
              <span>534 Stations Queued for Refresh</span>
            </div>
          </div>
        </div>

        {/* Main Hydrologic GIS + Spatial Intelligence Workstation */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
          {/* Interactive Environmental Rift Valley Map Container */}
          <div className="xl:col-span-8 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md relative overflow-hidden">
              {/* Map Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-[24px]">
                    public
                  </span>
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">
                      Rift Valley Basin Hydro-Geographic Array
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Layer 6 Telemetry • Coordinate System: WGS 84 / UTM Zone 37N • Hydrologic Rift Axis
                    </p>
                  </div>
                </div>
                {/* Heat Layer Toggles */}
                <div className="flex items-center gap-space-xs bg-surface-container p-1 rounded-xl">
                  <button
                    className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors ${
                      activeFilter === "all"
                        ? "bg-surface-container-lowest text-on-surface shadow-sm font-semibold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setActiveFilter("all")}
                  >
                    Composite GIS
                  </button>
                  <button
                    className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors ${
                      activeFilter === "hot"
                        ? "bg-surface-container-lowest text-on-surface shadow-sm font-semibold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setActiveFilter("hot")}
                  >
                    Hotspots (&gt;8 ppm)
                  </button>
                  <button
                    className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors ${
                      activeFilter === "safe"
                        ? "bg-surface-container-lowest text-on-surface shadow-sm font-semibold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setActiveFilter("safe")}
                  >
                    Potable Safe
                  </button>
                </div>
              </div>
              {/* Synthetic GIS Canvas with SVG Basemap & Overlaid Nodes */}
              <div className="relative w-full h-[460px] rounded-lg bg-surface-container-high overflow-hidden shadow-inner flex items-center justify-center">
                {/* Topo / Satellite Basemap Placeholder */}
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-multiply"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAdWjwHqcukDDAi6bFUKjjNeyS6UCGJkm-Z_4mTvcSZqZFIrvag7SMYfGAGI97JC6-HGPfiMQpWIzO8JqXver-aGGXW42ig7kmDDhJDv8xM6DQBK17nlxkC8_4XFTJVaEnmW-ik2fPZ8mYcCTtz7NFJVrLoFCec8rX6bypWLJtDuw1Ph_mj4QiLpdyioqhnLID9yOnEymRfVXt9hmJRbf6NiZfkxyStBoIt5w8GJq6Vaf2IkUzvHYM')",
                  }}
                ></div>
                {/* Custom Interactive GIS Cartographic Vector Layer */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                  viewBox="0 0 900 520"
                >
                  <defs>
                    <radialGradient cx="50%" cy="50%" id="hotspot-bng" r="50%">
                      <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.8"></stop>
                      <stop offset="60%" stopColor="#ba1a1a" stopOpacity="0.3"></stop>
                      <stop offset="100%" stopColor="#ba1a1a" stopOpacity="0"></stop>
                    </radialGradient>
                    <radialGradient cx="50%" cy="50%" id="hotspot-nkr" r="50%">
                      <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.85"></stop>
                      <stop offset="70%" stopColor="#ba1a1a" stopOpacity="0.25"></stop>
                      <stop offset="100%" stopColor="#ba1a1a" stopOpacity="0"></stop>
                    </radialGradient>
                    <radialGradient cx="50%" cy="50%" id="warm-elm" r="50%">
                      <stop offset="0%" stopColor="#b45309" stopOpacity="0.75"></stop>
                      <stop offset="100%" stopColor="#b45309" stopOpacity="0"></stop>
                    </radialGradient>
                    <radialGradient cx="50%" cy="50%" id="safe-nvh" r="50%">
                      <stop offset="0%" stopColor="#006a61" stopOpacity="0.8"></stop>
                      <stop offset="100%" stopColor="#006a61" stopOpacity="0"></stop>
                    </radialGradient>
                  </defs>
                  {/* Rift Fault Tectonic Lines */}
                  <path
                    d="M 380,20 Q 420,180 435,320 T 480,500"
                    fill="none"
                    opacity="0.6"
                    stroke="#213145"
                    strokeDasharray="6,6"
                    strokeWidth="2.5"
                  ></path>
                  <path
                    d="M 460,10 Q 500,200 510,340 T 545,510"
                    fill="none"
                    opacity="0.4"
                    stroke="#213145"
                    strokeDasharray="4,4"
                    strokeWidth="2"
                  ></path>
                  {/* Lake Baringo Zone */}
                  {(activeFilter === "all" || activeFilter === "hot") && (
                    <>
                      <circle
                        className="animate-pulse"
                        cx="430"
                        cy="90"
                        fill="url(#hotspot-bng)"
                        r="75"
                        style={{ animationDuration: "3s" }}
                      ></circle>
                      <ellipse
                        cx="430"
                        cy="90"
                        fill="#d3e4fe"
                        opacity="0.85"
                        rx="36"
                        ry="50"
                      ></ellipse>
                    </>
                  )}
                  {/* Lake Nakuru Zone */}
                  {(activeFilter === "all" || activeFilter === "hot") && (
                    <>
                      <circle
                        className="animate-pulse"
                        cx="450"
                        cy="250"
                        fill="url(#hotspot-nkr)"
                        r="95"
                        style={{ animationDuration: "2.5s" }}
                      ></circle>
                      <ellipse
                        cx="450"
                        cy="250"
                        fill="#d3e4fe"
                        opacity="0.85"
                        rx="42"
                        ry="34"
                      ></ellipse>
                    </>
                  )}
                  {/* Lake Elementaita Zone */}
                  {activeFilter === "all" && (
                    <>
                      <circle cx="510" cy="325" fill="url(#warm-elm)" r="60"></circle>
                      <ellipse
                        cx="510"
                        cy="325"
                        fill="#d3e4fe"
                        opacity="0.85"
                        rx="28"
                        ry="18"
                      ></ellipse>
                    </>
                  )}
                  {/* Lake Naivasha Basin */}
                  {(activeFilter === "all" || activeFilter === "safe") && (
                    <>
                      <circle cx="540" cy="410" fill="url(#safe-nvh)" r="70"></circle>
                      <ellipse
                        cx="540"
                        cy="410"
                        fill="#d3e4fe"
                        opacity="0.85"
                        rx="46"
                        ry="38"
                      ></ellipse>
                    </>
                  )}
                  {/* Sub-surface Hydro Thermal Aquifer Flow Streamlines */}
                  <path
                    d="M 430,120 C 440,180 450,220 450,250"
                    fill="none"
                    opacity="0.7"
                    stroke="#ba1a1a"
                    strokeWidth="3"
                  ></path>
                  <path
                    d="M 450,280 C 470,300 495,315 510,325"
                    fill="none"
                    opacity="0.8"
                    stroke="#b45309"
                    strokeWidth="2.5"
                  ></path>
                  <path
                    d="M 510,340 C 525,365 535,390 540,410"
                    fill="none"
                    opacity="0.8"
                    stroke="#006a61"
                    strokeWidth="2"
                  ></path>
                </svg>
                {/* Overlayed Clickable Sensor Transducers on Map */}
                {/* Node: Lake Baringo */}
                {(activeFilter === "all" || activeFilter === "hot") && (
                  <div className="absolute top-[68px] left-[45%] transform -translate-x-1/2 z-10 group cursor-pointer pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-lowest shadow-md border-l-4 border-error">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface">
                          Lake Baringo Boreholes
                        </span>
                        <span className="font-data-mono text-[11px] text-error font-bold">
                          8.2 ppm F⁻ (CRITICAL)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Node: Lake Nakuru Axis */}
                {(activeFilter === "all" || activeFilter === "hot") && (
                  <div className="absolute top-[225px] left-[49%] transform -translate-x-1/2 z-10 group cursor-pointer pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-lowest shadow-md border-l-4 border-error">
                      <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface">
                          Lake Nakuru Caldera
                        </span>
                        <span className="font-data-mono text-[11px] text-error font-bold">
                          6.8 ppm F⁻ • 14,280 Screened
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Node: Elementaita Springs */}
                {activeFilter === "all" && (
                  <div className="absolute top-[305px] left-[56%] transform -translate-x-1/2 z-10 group cursor-pointer pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-lowest shadow-md border-l-4 border-outline">
                      <span className="w-2 h-2 rounded-full bg-[#b45309]"></span>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface">
                          Elementaita Alkaline Field
                        </span>
                        <span className="font-data-mono text-[11px] text-[#b45309] font-bold">
                          5.4 ppm F⁻ (ELEVATED)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Node: Lake Naivasha Recharge */}
                {(activeFilter === "all" || activeFilter === "safe") && (
                  <div className="absolute top-[395px] left-[58%] transform -translate-x-1/2 z-10 group cursor-pointer pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-lowest shadow-md border-l-4 border-secondary">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface">
                          Naivasha Freshwater Lens
                        </span>
                        <span className="font-data-mono text-[11px] text-secondary font-bold">
                          1.4 ppm F⁻ (WHO COMPLIANT)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* HUD Overlay Bottom Left: GIS Legend */}
                <div className="absolute bottom-space-md left-space-md bg-surface-container-lowest/95 backdrop-blur-md p-space-sm rounded-lg shadow-md flex flex-col gap-1 max-w-[210px]">
                  <span className="font-label-sm text-label-sm font-bold text-on-surface tracking-wide">
                    Hydro-Fluoride Contours
                  </span>
                  <div className="flex items-center gap-space-xs font-data-mono text-[11px] text-on-surface-variant">
                    <span className="w-3 h-3 rounded-full bg-error"></span>
                    <span>&gt; 6.0 ppm (Severe Endemic)</span>
                  </div>
                  <div className="flex items-center gap-space-xs font-data-mono text-[11px] text-on-surface-variant">
                    <span className="w-3 h-3 rounded-full bg-[#b45309]"></span>
                    <span>2.0 - 5.9 ppm (Elevated Risk)</span>
                  </div>
                  <div className="flex items-center gap-space-xs font-data-mono text-[11px] text-on-surface-variant">
                    <span className="w-3 h-3 rounded-full bg-secondary"></span>
                    <span>≤ 1.5 ppm (WHO Potable Safe)</span>
                  </div>
                </div>
                {/* HUD Overlay Top Right: Spatial Layer Details */}
                <div className="absolute top-space-md right-space-md bg-surface-container-lowest/95 backdrop-blur-md px-space-sm py-1 rounded-lg shadow-sm font-data-mono text-[11px] text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-secondary">
                    satellite_alt
                  </span>
                  <span>Sentinel-2 Hydrology SAR Overlay active</span>
                </div>
              </div>
              {/* Interactive Borehole Quick Inspector Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-space-xs">
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Sub-surface Thermal Leaching
                  </span>
                  <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                    43.2 °C
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Accelerated fluorapatite dissolution
                  </span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Aquifer Depth Variance
                  </span>
                  <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                    184 - 240 m
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Deep borehole drilling horizon
                  </span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Telemetry Station Uptime
                  </span>
                  <span className="font-headline-lg text-headline-lg font-bold text-secondary">
                    99.8%
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Supabase dual-sync gateway
                  </span>
                </div>
              </div>
            </div>
            {/* County Hydrogeology Comparison Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-space-md py-space-sm bg-surface-container-lowest flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    table_chart
                  </span>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">
                    County Hydrochemical Telemetry Ledger
                  </h3>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-data-mono text-label-sm text-on-surface-variant">
                    API: <code className="text-on-surface font-semibold">GET /api/environment/fluoride</code>
                  </span>
                  <button className="px-space-sm py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      download
                    </span>{" "}
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase">
                      <th className="py-space-sm px-space-md">County Name</th>
                      <th className="py-space-sm px-space-md">Fluoride Conc.</th>
                      <th className="py-space-sm px-space-md">Clinical Risk Class</th>
                      <th className="py-space-sm px-space-md">Active Screenings</th>
                      <th className="py-space-sm px-space-md">Telemetry Unit</th>
                      <th className="py-space-sm px-space-md text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md divide-y-0">
                    {/* Nakuru */}
                    <tr className="hover:bg-surface-container transition-colors">
                      <td className="py-space-sm px-space-md font-semibold text-on-surface flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-error"></span>
                        Nakuru County
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono font-bold text-error">
                        6.8 ppm F⁻
                      </td>
                      <td className="py-space-sm px-space-md">
                        <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold uppercase">
                          Critical
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono">
                        14,280 residents
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono text-on-surface-variant text-body-sm">
                        WRMA-NK-04
                      </td>
                      <td className="py-space-sm px-space-md text-right">
                        <button className="text-secondary font-label-sm text-label-sm font-semibold hover:underline">
                          Telemetry Stream →
                        </button>
                      </td>
                    </tr>
                    {/* Baringo */}
                    <tr className="hover:bg-surface-container transition-colors bg-surface-container-low/40">
                      <td className="py-space-sm px-space-md font-semibold text-on-surface flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-error"></span>
                        Baringo County
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono font-bold text-error">
                        8.2 ppm F⁻
                      </td>
                      <td className="py-space-sm px-space-md">
                        <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold uppercase">
                          Severe Anomaly
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono">
                        9,140 residents
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono text-on-surface-variant text-body-sm">
                        WRMA-BR-11
                      </td>
                      <td className="py-space-sm px-space-md text-right">
                        <button className="text-secondary font-label-sm text-label-sm font-semibold hover:underline">
                          Telemetry Stream →
                        </button>
                      </td>
                    </tr>
                    {/* Turkana */}
                    <tr className="hover:bg-surface-container transition-colors">
                      <td className="py-space-sm px-space-md font-semibold text-on-surface flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-[#b45309]"></span>
                        Turkana County
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono font-bold text-[#b45309]">
                        4.1 ppm F⁻
                      </td>
                      <td className="py-space-sm px-space-md">
                        <span className="px-space-xs py-0.5 rounded bg-surface-container text-[#b45309] font-label-sm text-label-sm font-semibold uppercase">
                          Moderate
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono">
                        5,620 residents
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono text-on-surface-variant text-body-sm">
                        WRMA-TK-02
                      </td>
                      <td className="py-space-sm px-space-md text-right">
                        <button className="text-secondary font-label-sm text-label-sm font-semibold hover:underline">
                          Telemetry Stream →
                        </button>
                      </td>
                    </tr>
                    {/* Kajiado */}
                    <tr className="hover:bg-surface-container transition-colors bg-surface-container-low/40">
                      <td className="py-space-sm px-space-md font-semibold text-on-surface flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-[#b45309]"></span>
                        Kajiado County
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono font-bold text-[#b45309]">
                        3.4 ppm F⁻
                      </td>
                      <td className="py-space-sm px-space-md">
                        <span className="px-space-xs py-0.5 rounded bg-surface-container text-[#b45309] font-label-sm text-label-sm font-semibold uppercase">
                          Moderate
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono">
                        7,890 residents
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono text-on-surface-variant text-body-sm">
                        WRMA-KJ-09
                      </td>
                      <td className="py-space-sm px-space-md text-right">
                        <button className="text-secondary font-label-sm text-label-sm font-semibold hover:underline">
                          Telemetry Stream →
                        </button>
                      </td>
                    </tr>
                    {/* Nairobi (Control) */}
                    <tr className="hover:bg-surface-container transition-colors">
                      <td className="py-space-sm px-space-md font-semibold text-on-surface flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        Nairobi (Control)
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono font-bold text-secondary">
                        1.1 ppm F⁻
                      </td>
                      <td className="py-space-sm px-space-md">
                        <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold uppercase">
                          Safe (WHO)
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono">
                        22,400 residents
                      </td>
                      <td className="py-space-sm px-space-md font-data-mono text-on-surface-variant text-body-sm">
                        NCWSC-NRB-01
                      </td>
                      <td className="py-space-sm px-space-md text-right">
                        <button className="text-secondary font-label-sm text-label-sm font-semibold hover:underline">
                          Telemetry Stream →
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Right Column: Hydrogeological Correlation Graph & Alert Advisory Engine */}
          <div className="xl:col-span-4 flex flex-col gap-space-lg">
            {/* Aquifer Depth vs Fluoride Leaching Curve Graph */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    ssid_chart
                  </span>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">
                    Hydrogeological Leaching
                  </h3>
                </div>
                <span className="font-data-mono text-label-sm text-on-surface-variant">
                  R² = 0.892
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Aquifer depth (meters) vs. Fluoride Dissolution Concentration under geothermal gradient.
              </p>
              {/* Inline Technical SVG Chart */}
              <div className="w-full h-52 bg-surface-container-low rounded-lg p-2 flex flex-col justify-between relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 320 160">
                  {/* Grid Lines */}
                  <line
                    x1="40"
                    y1="20"
                    x2="300"
                    y2="20"
                    stroke="#c6c6cd"
                    strokeDasharray="2,2"
                    strokeWidth="0.8"
                  ></line>
                  <line
                    x1="40"
                    y1="60"
                    x2="300"
                    y2="60"
                    stroke="#c6c6cd"
                    strokeDasharray="2,2"
                    strokeWidth="0.8"
                  ></line>
                  <line
                    x1="40"
                    y1="100"
                    x2="300"
                    y2="100"
                    stroke="#c6c6cd"
                    strokeDasharray="2,2"
                    strokeWidth="0.8"
                  ></line>
                  <line
                    x1="40"
                    y1="140"
                    x2="300"
                    y2="140"
                    stroke="#76777d"
                    strokeWidth="1.2"
                  ></line>
                  {/* Y-Axis Labels (ppm F-) */}
                  <text
                    x="32"
                    y="24"
                    fill="#45464d"
                    fontFamily="Inter"
                    fontSize="8"
                    textAnchor="end"
                  >
                    12
                  </text>
                  <text
                    x="32"
                    y="64"
                    fill="#45464d"
                    fontFamily="Inter"
                    fontSize="8"
                    textAnchor="end"
                  >
                    8
                  </text>
                  <text
                    x="32"
                    y="104"
                    fill="#45464d"
                    fontFamily="Inter"
                    fontSize="8"
                    textAnchor="end"
                  >
                    4
                  </text>
                  <text
                    x="32"
                    y="142"
                    fill="#45464d"
                    fontFamily="Inter"
                    fontSize="8"
                    textAnchor="end"
                  >
                    0
                  </text>
                  {/* WHO Threshold line at 1.5 ppm */}
                  <line
                    x1="40"
                    y1="125"
                    x2="300"
                    y2="125"
                    stroke="#006a61"
                    strokeDasharray="4,2"
                    strokeWidth="1"
                  ></line>
                  <text
                    x="298"
                    y="121"
                    fill="#006a61"
                    fontFamily="Inter"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    WHO Cap 1.5 ppm
                  </text>
                  {/* Monsoon High Leaching Curve (Wet Season Flash) */}
                  <path
                    d="M 40,135 Q 120,120 190,75 T 300,30"
                    fill="none"
                    stroke="#ba1a1a"
                    strokeWidth="2.5"
                  ></path>
                  {/* Dry Season Base Aquifer Line */}
                  <path
                    d="M 40,138 Q 130,130 200,98 T 300,55"
                    fill="none"
                    stroke="#006f66"
                    strokeDasharray="3,3"
                    strokeWidth="1.8"
                  ></path>
                  {/* Scatter datapoints with telemetry coordinates */}
                  <circle cx="90" cy="128" r="3" fill="#006a61"></circle>
                  <circle cx="150" cy="108" r="3.5" fill="#b45309"></circle>
                  <circle cx="210" cy="72" r="4" fill="#ba1a1a"></circle>
                  <circle cx="270" cy="40" r="4.5" fill="#ba1a1a"></circle>
                  {/* Depth Marker X Labels (Meters) */}
                  <text x="40" y="154" fill="#45464d" fontFamily="Inter" fontSize="8">
                    0m
                  </text>
                  <text x="120" y="154" fill="#45464d" fontFamily="Inter" fontSize="8">
                    100m
                  </text>
                  <text x="200" y="154" fill="#45464d" fontFamily="Inter" fontSize="8">
                    200m
                  </text>
                  <text x="280" y="154" fill="#45464d" fontFamily="Inter" fontSize="8">
                    300m
                  </text>
                </svg>
              </div>
              <div className="flex items-center justify-between font-body-sm text-body-sm pt-space-xs">
                <span className="flex items-center gap-1 text-on-surface">
                  <span className="w-2.5 h-0.5 bg-error inline-block"></span> High Recharge Rate (Post-Rainfall)
                </span>
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="w-2.5 h-0.5 bg-secondary inline-block"></span> Base Stratum Baseline
                </span>
              </div>
              <div className="mt-space-xs p-space-sm rounded bg-surface-container font-body-sm text-body-sm text-on-surface-variant">
                <strong className="text-on-surface">Key Hydrologic Finding:</strong> Deep boreholes (&gt;180m) in volcanic pyroclastic bedrock show a 2.4x accelerated dissolution rate due to sub-surface hydrothermal venting.
              </div>
            </div>
            {/* Automated Water Advisory & Emergency Dispatcher Panel */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-error text-[20px]">
                    notifications_active
                  </span>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">
                    Early Warning &amp; Advisory Engine
                  </h3>
                </div>
                <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold animate-pulse">
                  1 Anomaly Active
                </span>
              </div>
              {/* Alert Dispatch Box */}
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="font-bold text-on-surface">Station WRMA-NK-04 Anomaly</span>
                  <span className="font-data-mono text-body-sm text-on-surface-variant">08:42 UTC</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Fluoride sensor spike detected at Lake Nakuru Northern Intake: <span className="font-data-mono font-bold text-error">7.1 ppm</span> (Critical threshold tripped: &gt;6.0 ppm).
                </p>
                <div className="mt-space-xs flex items-center gap-space-xs text-label-sm font-label-sm text-on-secondary-container">
                  <span className="material-symbols-outlined text-[16px]">cell_tower</span>
                  <span>48 Community Health Promoters queued for geo-targeted SMS broadcast</span>
                </div>
              </div>
              {/* Interactive SMS Dispatcher Trigger */}
              <form className="flex flex-col gap-space-sm" onSubmit={handleDispatch}>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                  Select Advisory Protocol
                </label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full bg-surface-container-lowest text-on-surface p-space-sm rounded font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="critical">
                    Level 3 Alert: Immediate Borehole Shutdown &amp; Defluoridation Flush
                  </option>
                  <option value="advisory">
                    Level 2 Alert: Household Rainwater Harvesting Advisory
                  </option>
                  <option value="pediatric">
                    Level 1 Alert: High Risk Pediatric Calcium Supplementation Protocol
                  </option>
                </select>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    Custom Broadcast Message
                  </label>
                  <textarea
                    className="w-full bg-surface-container-lowest text-on-surface p-space-sm rounded font-body-sm text-body-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary"
                    rows={3}
                    value={customSms}
                    onChange={(e) => setCustomSms(e.target.value)}
                  />
                </div>
                <button
                  id="dispatch-btn"
                  className={`w-full py-space-sm px-space-md ${
                    dispatchSent ? "bg-secondary" : "bg-primary hover:bg-primary-container"
                  } text-on-primary rounded font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs transition-all`}
                  type="submit"
                  disabled={isDispatching}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isDispatching ? "progress_activity" : dispatchSent ? "done_all" : "send"}
                  </span>
                  <span>
                    {isDispatching
                      ? "Transmitting via Cellular Gateway..."
                      : dispatchSent
                      ? "Broadcast Sent"
                      : "Dispatch SMS to 48 Health Promoters"}
                  </span>
                </button>
                {dispatchSent && (
                  <div className="p-space-xs rounded bg-secondary-container text-on-secondary-container text-center font-label-sm text-label-sm font-bold">
                    ✓ Automated Dispatch Confirmed via Safaricom USSD Gateway
                  </div>
                )}
              </form>
              {/* Edge Model Telemetry Status */}
              <div className="pt-space-xs flex items-center justify-between border-t border-surface-container font-label-sm text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">memory</span>
                  Edge Model v2.4-Hydro
                </span>
                <span className="font-data-mono">Inference: 18ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
