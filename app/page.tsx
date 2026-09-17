"use client";

import { useState } from "react";
import { TabNav, Tab } from "@/components/TabNav";
import { ScreeningPanel } from "@/components/ScreeningPanel";
import { FluorosisPanel } from "@/components/FluorosisPanel";
import { TwinPanel } from "@/components/TwinPanel";
import { ApiExplorerPanel } from "@/components/ApiExplorerPanel";
import { DashboardPanel } from "@/components/DashboardPanel";

const tabs: Tab[] = [
  { id: "screening", label: "Screening Tool", num: "01" },
  { id: "map", label: "Fluorosis Intelligence", num: "02" },
  { id: "twin", label: "Digital Twin", num: "03" },
  { id: "api", label: "Research API", num: "04" },
  { id: "dashboard", label: "Program Dashboard", num: "05" },
];

export default function Home() {
  const [active, setActive] = useState("screening");

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-7">
          <div className="flex items-center justify-between py-4.5">
            <div className="flex items-center gap-3">
              <div className="relative h-8.5 w-8.5 flex-shrink-0 rounded-[9px] bg-gradient-to-br from-teal via-teal-bright to-clay" />
              <div>
                <div className="font-display text-lg font-bold">JinoX AI</div>
                <div className="text-[0.72rem] uppercase tracking-wide text-ink-soft">
                  Full-Stack Prototype · Kenya Pilot Build
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-risk-low shadow-[0_0_0_3px_#E4EFE6]" />
              Live API routes · no patient data
            </div>
          </div>
          <TabNav tabs={tabs} active={active} onChange={setActive} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-7 py-9">
        {active === "screening" && <ScreeningPanel />}
        {active === "map" && <FluorosisPanel />}
        {active === "twin" && <TwinPanel />}
        {active === "api" && <ApiExplorerPanel />}
        {active === "dashboard" && <DashboardPanel />}
      </main>

      <footer className="border-t border-line py-5 text-center text-xs text-ink-soft">
        JinoX AI &middot; Full-stack prototype (Next.js + Supabase schema) &middot; Not for
        clinical use
      </footer>
    </div>
  );
}
