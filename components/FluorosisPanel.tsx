"use client";

import { useState } from "react";

export function FluorosisPanel() {
  const [activeFilter, setActiveFilter] = useState<"all" | "hot" | "safe">("all");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [protocol, setProtocol] = useState<string>("critical");
  const [customSms, setCustomSms] = useState<string>(
    "JINOX ALERT: Nakuru Well #04 exceeds safe threshold (7.1 ppm). Divert children <8 yrs to Community Filter Hub B."
  );
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchSent, setDispatchSent] = useState<boolean>(false);

  // Dropdowns state
  const [showMapLayersMenu, setShowMapLayersMenu] = useState<boolean>(false);
  const [showMapLegend, setShowMapLegend] = useState<boolean>(false);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchSent(true);
    }, 1200);
  };

  const COUNTIES = [
    { name: "Nakuru County", fLevel: "6.8 ppm F⁻", risk: "Critical", riskClass: "bg-error-container text-on-error-container", screened: "14,280", unit: "WRMA-NK-04", id: "nakuru" },
    { name: "Baringo County", fLevel: "8.2 ppm F⁻", risk: "Severe Anomaly", riskClass: "bg-error-container text-on-error-container", screened: "9,140", unit: "WRMA-BR-11", id: "baringo" },
    { name: "Turkana County", fLevel: "4.1 ppm F⁻", risk: "Moderate", riskClass: "bg-surface-container text-[#b45309]", screened: "5,620", unit: "WRMA-TK-02", id: "turkana" },
    { name: "Kajiado County", fLevel: "3.4 ppm F⁻", risk: "Moderate", riskClass: "bg-surface-container text-[#b45309]", screened: "7,890", unit: "WRMA-KJ-09", id: "kajiado" },
    { name: "Nairobi (Control)", fLevel: "1.1 ppm F⁻", risk: "Safe (WHO)", riskClass: "bg-secondary-container text-on-secondary-container", screened: "22,400", unit: "NCWSC-NRB-01", id: "nairobi" },
  ];

  const filteredCounties = countyFilter === "all" ? COUNTIES : COUNTIES.filter(c => c.id === countyFilter);

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-gutter-desktop py-space-md max-w-[1720px] mx-auto flex flex-col gap-space-md">
        {/* Streamlined Top Telemetry Summary Ribbon */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                Monitored Wells
              </span>
              <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
                1,482 Wells
              </div>
            </div>

            <div className="h-8 w-px bg-surface-container hidden sm:block"></div>

            <div>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                Mean Rift Level
              </span>
              <div className="font-headline-lg text-headline-lg font-bold text-error">
                5.8 ppm F⁻
              </div>
            </div>

            <div className="h-8 w-px bg-surface-container hidden md:block"></div>

            <div>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                High Risk Exposure Pop.
              </span>
              <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
                2.14M
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-secondary-container/50 text-on-secondary-container px-3 py-1 rounded-full text-data-mono text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>WRMA 1Hz Telemetry Live</span>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md">
          {/* LEFT: Interactive Environmental Map & Ledger (8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-space-md">
            {/* GIS Map Card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              {/* Map Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container-low pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    public
                  </span>
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                      Rift Valley Hydro-GIS Array
                    </h2>
                  </div>
                </div>

                {/* Map Options Dropdowns */}
                <div className="flex items-center gap-2">
                  {/* Layer Filter Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMapLayersMenu(!showMapLayersMenu)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        layers
                      </span>
                      <span>Map Layer: {activeFilter.toUpperCase()}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        expand_more
                      </span>
                    </button>

                    {showMapLayersMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-1.5 z-50 space-y-1 text-label-md text-label-md">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFilter("all");
                            setShowMapLayersMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded transition-colors ${
                            activeFilter === "all" ? "bg-secondary-container font-bold text-on-secondary-container" : "hover:bg-surface-container-low text-on-surface"
                          }`}
                        >
                          Composite GIS
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFilter("hot");
                            setShowMapLayersMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded transition-colors ${
                            activeFilter === "hot" ? "bg-secondary-container font-bold text-on-secondary-container" : "hover:bg-surface-container-low text-on-surface"
                          }`}
                        >
                          Hotspots (&gt;8 ppm)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFilter("safe");
                            setShowMapLayersMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded transition-colors ${
                            activeFilter === "safe" ? "bg-secondary-container font-bold text-on-secondary-container" : "hover:bg-surface-container-low text-on-surface"
                          }`}
                        >
                          Potable Safe
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Toggle Map Legend */}
                  <button
                    type="button"
                    onClick={() => setShowMapLegend(!showMapLegend)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      legend_toggle
                    </span>
                    <span>Legend</span>
                  </button>
                </div>
              </div>

              {/* GIS Canvas */}
              <div className="relative w-full h-[400px] rounded-lg bg-surface-container-high overflow-hidden select-none">
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-multiply"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAdWjwHqcukDDAi6bFUKjjNeyS6UCGJkm-Z_4mTvcSZqZFIrvag7SMYfGAGI97JC6-HGPfiMQpWIzO8JqXver-aGGXW42ig7kmDDhJDv8xM6DQBK17nlxkC8_4XFTJVaEnmW-ik2fPZ8mYcCTtz7NFJVrLoFCec8rX6bypWLJtDuw1Ph_mj4QiLpdyioqhnLID9yOnEymRfVXt9hmJRbf6NiZfkxyStBoIt5w8GJq6Vaf2IkUzvHYM')",
                  }}
                ></div>

                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 520">
                  <path d="M 380,20 Q 420,180 435,320 T 480,500" fill="none" opacity="0.6" stroke="#213145" strokeDasharray="6,6" strokeWidth="2.5"></path>
                  {(activeFilter === "all" || activeFilter === "hot") && (
                    <ellipse cx="450" cy="250" fill="#ba1a1a" opacity="0.3" rx="90" ry="70"></ellipse>
                  )}
                  {(activeFilter === "all" || activeFilter === "safe") && (
                    <ellipse cx="540" cy="410" fill="#006a61" opacity="0.4" rx="60" ry="50"></ellipse>
                  )}
                </svg>

                {/* Nodes */}
                {(activeFilter === "all" || activeFilter === "hot") && (
                  <div className="absolute top-[225px] left-[49%] transform -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-lowest/95 shadow-md border-l-4 border-error">
                      <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                      <div className="font-label-sm text-[12px] font-bold text-on-surface">
                        Lake Nakuru Caldera: 6.8 ppm F⁻
                      </div>
                    </div>
                  </div>
                )}

                {/* Collapsible Legend Drawer Overlay */}
                {showMapLegend && (
                  <div className="absolute bottom-3 left-3 bg-surface-container-lowest/95 backdrop-blur p-3 rounded-xl shadow-lg border border-surface-container z-20 space-y-1 font-data-mono text-[11px]">
                    <div className="font-bold text-on-surface">Hydro-Fluoride Legend</div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                      <span>&gt; 6.0 ppm (Severe Endemic)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#b45309]"></span>
                      <span>2.0 - 5.9 ppm (Elevated Risk)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                      <span>≤ 1.5 ppm (WHO Potable Safe)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* County Ledger Table Card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    table_chart
                  </span>
                  County Telemetry Ledger
                </span>

                {/* County Filter Dropdown */}
                <select
                  value={countyFilter}
                  onChange={(e) => setCountyFilter(e.target.value)}
                  className="bg-surface-container-low text-on-surface font-label-md text-label-md px-3 py-1 rounded-lg border border-surface-container cursor-pointer outline-none"
                >
                  <option value="all">Filter County: All (5)</option>
                  <option value="nakuru">Nakuru County</option>
                  <option value="baringo">Baringo County</option>
                  <option value="turkana">Turkana County</option>
                  <option value="kajiado">Kajiado County</option>
                  <option value="nairobi">Nairobi (Control)</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-[13px]">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant uppercase font-semibold font-label-sm text-[11px]">
                      <th className="py-2 px-3">County</th>
                      <th className="py-2 px-3">Fluoride Conc.</th>
                      <th className="py-2 px-3">Risk Category</th>
                      <th className="py-2 px-3">Screened Pop.</th>
                      <th className="py-2 px-3">Unit Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {filteredCounties.map((c) => (
                      <tr key={c.name} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-2 px-3 font-semibold text-on-surface">{c.name}</td>
                        <td className="py-2 px-3 font-data-mono font-bold text-on-surface">{c.fLevel}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded font-label-sm text-[10px] font-bold uppercase ${c.riskClass}`}>
                            {c.risk}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-data-mono">{c.screened}</td>
                        <td className="py-2 px-3 font-data-mono text-on-surface-variant">{c.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Leaching Graph & Advisory Dispatcher (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-space-md">
            {/* Early Warning & Advisory Dispatcher */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-2">
                <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-error">
                    notifications_active
                  </span>
                  Early Warning Dispatcher
                </span>
                <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-[10px] font-bold">
                  1 Anomaly
                </span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg text-body-sm text-[12px] space-y-1">
                <div className="font-bold text-on-surface">WRMA-NK-04 Anomaly Triggered</div>
                <div className="text-on-surface-variant">
                  Intake spike detected: <span className="font-data-mono font-bold text-error">7.1 ppm</span> (&gt;6.0 ppm cap).
                </div>
              </div>

              <form className="space-y-3" onSubmit={handleDispatch}>
                <div>
                  <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1 font-semibold uppercase">
                    Select Advisory Protocol Dropdown
                  </label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface p-2 rounded-lg font-body-sm text-body-sm border border-surface-container focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
                  >
                    <option value="critical">Level 3: Immediate Borehole Shutdown</option>
                    <option value="advisory">Level 2: Rainwater Harvesting Advisory</option>
                    <option value="pediatric">Level 1: Pediatric Calcium Protocol</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1 font-semibold uppercase">
                    Broadcast Message
                  </label>
                  <textarea
                    className="w-full bg-surface-container-low text-on-surface p-2 rounded-lg font-body-sm text-body-sm resize-none border border-surface-container focus:outline-none focus:ring-1 focus:ring-secondary"
                    rows={3}
                    value={customSms}
                    onChange={(e) => setCustomSms(e.target.value)}
                  />
                </div>

                {/* Clear Primary CTA */}
                <button
                  className={`w-full py-2.5 px-4 ${
                    dispatchSent ? "bg-secondary text-on-secondary" : "bg-primary hover:bg-primary-container text-on-primary"
                  } rounded-lg font-label-md text-label-md font-bold flex items-center justify-center gap-2 transition-all shadow-sm`}
                  type="submit"
                  disabled={isDispatching}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isDispatching ? "progress_activity" : dispatchSent ? "done_all" : "send"}
                  </span>
                  <span>
                    {isDispatching
                      ? "Transmitting..."
                      : dispatchSent
                      ? "Broadcast Confirmed"
                      : "Dispatch SMS Alert"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
