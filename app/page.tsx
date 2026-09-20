"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ScreeningPanel } from "@/components/ScreeningPanel";
import { EdgeDiagnosticsPanel } from "@/components/EdgeDiagnosticsPanel";
import { FluorosisPanel } from "@/components/FluorosisPanel";
import { TwinPanel } from "@/components/TwinPanel";
import { ApiExplorerPanel } from "@/components/ApiExplorerPanel";
import { DashboardPanel } from "@/components/DashboardPanel";

export interface PlatformTab {
  id: string;
  path: string;
  label: string;
}

const TABS: PlatformTab[] = [
  { id: "screening-tool", path: "screening-tool", label: "Screening Tool (Field Capture)" },
  { id: "edge-diagnostics", path: "edge-diagnostics", label: "Edge Diagnostics (Layer 5)" },
  { id: "climate-health-gis", path: "climate-health-gis", label: "Climate-Health GIS (Layer 6)" },
  { id: "digital-twin-simulation", path: "digital-twin-simulation", label: "Digital Twin Simulation (Layer 3)" },
  { id: "dataset-api-explorer", path: "dataset-api-explorer", label: "Dataset & API Explorer (Layers 1-2)" },
  { id: "milestone-dashboard", path: "milestone-dashboard", label: "Milestone Dashboard (Governance)" },
];

function MainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabQuery = searchParams.get("tab");
  const initialTab = TABS.some((t) => t.path === tabQuery)
    ? (tabQuery as string)
    : "climate-health-gis";

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (tabQuery && TABS.some((t) => t.path === tabQuery)) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  const handleTabChange = (path: string) => {
    setActiveTab(path);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", path);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-surface-container">
        <div className="h-28 w-full px-gutter-desktop flex flex-col justify-between">
          <div className="h-14 flex items-center justify-between border-b border-surface-container-low">
            <div className="flex items-center gap-space-md">
              <img
                alt="JinoX AI Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1U_cxs0dzCDbofILyh87PxQkJdz2dBwnQf03eMVj8SHb47Hy4XWjdksTu9ykzrNChnO-x_5CQloBLoF15tfOMGEgyN00to4QOGeQt7Xzd-px3-W2pYiJCwMo2aAJilsS6f-oXi_FlQAsjcgr00QJW4kvBlq7cqgeihYDlXEwK3rywtx2yk4PsJojVyFuGK0-V9IPfVKM3xfhosX70WwEsho1JaPvV-O3csDzKuU3NsHjJZleATH75O1qg"
              />
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  JinoX AI
                </span>
                <span className="px-space-sm py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  Clinical Workstation
                </span>
              </div>
              <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Google.org AI for Science Pilot • Kenya Rift Valley
              </div>
            </div>
            <div className="flex items-center gap-space-lg">
              <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-low font-data-mono text-data-mono text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Supabase Failover Active • Latency 42ms
              </div>
              <div className="relative flex items-center justify-center">
                <button
                  aria-label="Notifications"
                  className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    notifications
                  </span>
                </button>
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-error text-on-error font-label-sm text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
              </div>
              <div className="flex items-center gap-space-sm pl-space-sm border-l border-surface-container">
                <div className="text-right hidden sm:block">
                  <div className="font-label-md text-label-md text-on-surface font-semibold">
                    Dr. A. Mwangi
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Field Lead, Nakuru
                  </div>
                </div>
                <img
                  alt="Dr. A. Mwangi Avatar"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container-high"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1W35mrlFl53qGfVP-c8GRxEAyPM4THrkN5L8udWGpFetXrYReSICRdkkPuB5vUTaSk_Q1auhD_jjt0VY7B8T9hi1ditNrLnPtfzRFfDAitZgaT549YrO5XAazYnUBAxUeQJd0Tf0sYEawahBR36H-cPUJ8vEaV4NgbOZGpH3kqDMLONGQ1Wv5opr2fzl3AdbJl5KYvtG2Anq8NDDDWrfN-ig9J5tPRGHwWMwPFBh3yyDhSz7pk4eVAhog"
                />
              </div>
            </div>
          </div>
          <div className="h-14 flex items-center justify-between overflow-x-auto">
            <nav className="flex items-center h-full gap-space-lg whitespace-nowrap">
              {TABS.map((t) => {
                const isActive = activeTab === t.path;
                return (
                  <button
                    key={t.path}
                    type="button"
                    onClick={() => handleTabChange(t.path)}
                    aria-current={isActive ? "page" : undefined}
                    className={`h-full flex items-center px-space-xs transition-colors font-label-md text-label-md ${
                      isActive
                        ? "text-on-surface font-bold border-b-2 border-secondary"
                        : "border-b-2 border-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </nav>
            <div className="hidden lg:flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                verified_user
              </span>
              <span>
                GDPR / Kenya Data Protection Act Compliant • Zero PII Retained • Model Version v2.4-edge
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-28 bg-background flex-1">
        {activeTab === "screening-tool" && <ScreeningPanel />}
        {activeTab === "edge-diagnostics" && <EdgeDiagnosticsPanel />}
        {activeTab === "climate-health-gis" && <FluorosisPanel />}
        {activeTab === "digital-twin-simulation" && <TwinPanel />}
        {activeTab === "dataset-api-explorer" && <ApiExplorerPanel />}
        {activeTab === "milestone-dashboard" && <DashboardPanel />}
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-surface-container py-space-md mt-auto">
        <div className="w-full px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
            <span>
              © 2025 JinoX AI Health Systems. Research Consortium for Endemic Fluorosis.
            </span>
          </div>
          <div className="flex items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Nakuru Rift Valley Gateway Connected
            </span>
            <span>ISO 27001 Clinical Data Safe</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center font-data-mono text-body-md text-on-surface-variant">
          Initializing JinoX AI Workstation...
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
