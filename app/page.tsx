"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TabNav, Tab } from "@/components/TabNav";
import { ScreeningPanel } from "@/components/ScreeningPanel";
import { FluorosisPanel } from "@/components/FluorosisPanel";
import { TwinPanel } from "@/components/TwinPanel";
import { ApiExplorerPanel } from "@/components/ApiExplorerPanel";
import { DashboardPanel } from "@/components/DashboardPanel";

const tabs: Tab[] = [
  { id: "screening", label: "Screening Tool", num: "01", badge: "Field" },
  { id: "map", label: "Fluorosis Intelligence", num: "02", badge: "GIS" },
  { id: "twin", label: "Digital Twin", num: "03", badge: "Simulation" },
  { id: "api", label: "Research API", num: "04", badge: "Live" },
  { id: "dashboard", label: "Program Dashboard", num: "05", badge: "18-Mo" },
];

function MainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabQuery = searchParams.get("tab");
  const initialTab = tabs.some((t) => t.id === tabQuery) ? (tabQuery as string) : "screening";

  const [active, setActive] = useState(initialTab);

  useEffect(() => {
    if (tabQuery && tabs.some((t) => t.id === tabQuery)) {
      setActive(tabQuery);
    }
  }, [tabQuery]);

  const handleTabChange = (newTab: string) => {
    setActive(newTab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", newTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur shadow-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-7">
          <div className="flex items-center justify-between py-3.5 sm:py-4">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-teal via-teal-bright to-clay shadow-sm flex items-center justify-center">
                <span className="font-display text-white font-bold text-base select-none">JX</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-lg font-bold tracking-tight text-ink">JinoX AI</h1>
                  <span className="rounded-md bg-teal-wash px-1.5 py-0.5 text-[0.65rem] font-mono font-semibold text-teal border border-teal/20">
                    v1.0.0-pilot
                  </span>
                </div>
                <p className="text-[0.7rem] uppercase tracking-wider text-ink-soft">
                  Multimodal Oral &amp; Craniofacial Health Platform · Kenya Pilot
                </p>
              </div>
            </div>

            {/* System Status Indicators */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-line bg-surface-alt/70 px-3 py-1.5 text-xs text-ink-soft">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-low opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-low" />
                </span>
                <span>Active API Routes</span>
                <span className="text-line">|</span>
                <span className="font-mono text-[0.7rem]">Zero Patient PII</span>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <TabNav tabs={tabs} active={active} onChange={handleTabChange} />
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-7 py-8 flex-1 w-full">
        {active === "screening" && <ScreeningPanel />}
        {active === "map" && <FluorosisPanel />}
        {active === "twin" && <TwinPanel />}
        {active === "api" && <ApiExplorerPanel />}
        {active === "dashboard" && <DashboardPanel />}
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface py-6 text-center text-xs text-ink-soft">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>JinoX AI</strong> &middot; Full-Stack Prototype &middot; Google.org Impact Challenge AI for Science Proposal
          </div>
          <div className="flex items-center gap-4 text-[0.72rem]">
            <span>Kenya Ministry of Health Pilot Standard</span>
            <span className="text-line">&bull;</span>
            <span>Not for Direct Unassisted Clinical Diagnosis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-sm text-ink-soft">
          Initializing JinoX AI Platform...
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
