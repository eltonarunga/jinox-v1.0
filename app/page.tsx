"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
  shortLabel: string;
  icon: string;
  layer: string;
}

const TABS: PlatformTab[] = [
  {
    id: "screening-tool",
    path: "screening-tool",
    label: "Screening Tool (Field Capture)",
    shortLabel: "Field Screening",
    icon: "photo_camera",
    layer: "Field Intake",
  },
  {
    id: "edge-diagnostics",
    path: "edge-diagnostics",
    label: "Edge Diagnostics (Layer 5)",
    shortLabel: "Edge Diagnostics",
    icon: "psychology",
    layer: "Layer 5",
  },
  {
    id: "climate-health-gis",
    path: "climate-health-gis",
    label: "Climate-Health GIS (Layer 6)",
    shortLabel: "Climate GIS",
    icon: "public",
    layer: "Layer 6",
  },
  {
    id: "digital-twin-simulation",
    path: "digital-twin-simulation",
    label: "Digital Twin Simulation (Layer 3)",
    shortLabel: "Digital Twin",
    icon: "biotech",
    layer: "Layer 3",
  },
  {
    id: "dataset-api-explorer",
    path: "dataset-api-explorer",
    label: "Dataset & API Explorer (Layers 1-2)",
    shortLabel: "API & Data Explorer",
    icon: "api",
    layer: "Layers 1-2",
  },
  {
    id: "milestone-dashboard",
    path: "milestone-dashboard",
    label: "Milestone Dashboard (Governance)",
    shortLabel: "Milestone Dashboard",
    icon: "insights",
    layer: "Governance",
  },
];

function MainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabQuery = searchParams.get("tab");
  const initialTab = TABS.some((t) => t.path === tabQuery)
    ? (tabQuery as string)
    : "climate-health-gis";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const moduleDropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabQuery && TABS.some((t) => t.path === tabQuery)) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moduleDropdownRef.current &&
        !moduleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModuleDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = (path: string) => {
    setActiveTab(path);
    setIsModuleDropdownOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", path);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const activeTabObj = TABS.find((t) => t.path === activeTab) || TABS[2];

  return (
    <>
      {/* Streamlined Minimalist Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md border-b border-surface-container shadow-xs">
        <div className="h-16 w-full px-gutter-desktop max-w-[1720px] mx-auto flex items-center justify-between gap-space-md">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-2">
              <img
                alt="JinoX AI Logo"
                className="h-7 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1U_cxs0dzCDbofILyh87PxQkJdz2dBwnQf03eMVj8SHb47Hy4XWjdksTu9ykzrNChnO-x_5CQloBLoF15tfOMGEgyN00to4QOGeQt7Xzd-px3-W2pYiJCwMo2aAJilsS6f-oXi_FlQAsjcgr00QJW4kvBlq7cqgeihYDlXEwK3rywtx2yk4PsJojVyFuGK0-V9IPfVKM3xfhosX70WwEsho1JaPvV-O3csDzKuU3NsHjJZleATH75O1qg"
              />
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                JinoX AI
              </span>
            </div>

            <div className="h-5 w-px bg-surface-container hidden sm:block"></div>

            {/* Module Switcher Dropdown */}
            <div className="relative" ref={moduleDropdownRef}>
              <button
                type="button"
                onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors border border-surface-container"
                aria-expanded={isModuleDropdownOpen}
                aria-label="Select Workstation Module"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  {activeTabObj.icon}
                </span>
                <span className="truncate max-w-[160px] sm:max-w-xs">
                  {activeTabObj.shortLabel}
                </span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant ml-1">
                  unfold_more
                </span>
              </button>

              {isModuleDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container py-1.5 z-50">
                  <div className="px-3 py-1.5 font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold border-b border-surface-container-low">
                    Clinical Modules
                  </div>
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.path;
                    return (
                      <button
                        key={tab.path}
                        type="button"
                        onClick={() => handleTabChange(tab.path)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left font-label-md text-label-md transition-colors ${
                          isActive
                            ? "bg-secondary-container/60 text-on-secondary-container font-bold"
                            : "text-on-surface hover:bg-surface-container-low"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isActive ? "text-secondary" : "text-on-surface-variant"
                            }`}
                          >
                            {tab.icon}
                          </span>
                          <span>{tab.shortLabel}</span>
                        </div>
                        <span className="font-data-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                          {tab.layer}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Status & User Controls */}
          <div className="flex items-center gap-space-sm">
            {/* Live Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container font-data-mono text-[11px] font-medium border border-secondary-container">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>Rift Valley Telemetry Live</span>
            </div>

            {/* Profile & System Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface"
                aria-expanded={isMenuOpen}
                aria-label="User & System Menu"
              >
                <div className="relative">
                  <img
                    alt="Dr. A. Mwangi Avatar"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container-high"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1W35mrlFl53qGfVP-c8GRxEAyPM4THrkN5L8udWGpFetXrYReSICRdkkPuB5vUTaSk_Q1auhD_jjt0VY7B8T9hi1ditNrLnPtfzRFfDAitZgaT549YrO5XAazYnUBAxUeQJd0Tf0sYEawahBR36H-cPUJ8vEaV4NgbOZGpH3kqDMLONGQ1Wv5opr2fzl3AdbJl5KYvtG2Anq8NDDDWrfN-ig9J5tPRGHwWMwPFBh3yyDhSz7pk4eVAhog"
                  />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-error border-2 border-surface-container-lowest"></span>
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-label-md text-label-md font-semibold leading-tight">
                    Dr. A. Mwangi
                  </div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant leading-tight">
                    Nakuru Field Lead
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  arrow_drop_down
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-3 z-50 space-y-3">
                  {/* Profile Header */}
                  <div className="flex items-center gap-3 pb-2 border-b border-surface-container-low">
                    <img
                      alt="Dr. A. Mwangi Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida/AEtjO1W35mrlFl53qGfVP-c8GRxEAyPM4THrkN5L8udWGpFetXrYReSICRdkkPuB5vUTaSk_Q1auhD_jjt0VY7B8T9hi1ditNrLnPtfzRFfDAitZgaT549YrO5XAazYnUBAxUeQJd0Tf0sYEawahBR36H-cPUJ8vEaV4NgbOZGpH3kqDMLONGQ1Wv5opr2fzl3AdbJl5KYvtG2Anq8NDDDWrfN-ig9J5tPRGHwWMwPFBh3yyDhSz7pk4eVAhog"
                    />
                    <div>
                      <div className="font-label-md text-label-md font-bold text-on-surface">
                        Dr. A. Mwangi
                      </div>
                      <div className="font-body-sm text-[11px] text-on-surface-variant">
                        Field Lead • Nakuru Rift Station
                      </div>
                    </div>
                  </div>

                  {/* System Notifications Summary */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                      <span>Notifications &amp; System</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-error text-on-error font-bold">
                        3 Alerts
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-low text-body-sm text-[12px] space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Supabase Failover Active (42ms)
                      </div>
                      <div className="text-on-surface-variant text-[11px]">
                        Google.org AI for Science Pilot • Kenya Rift Valley
                      </div>
                    </div>
                  </div>

                  {/* Compliance & Data Policy Info */}
                  <div className="p-2 rounded-lg bg-surface-container text-body-sm text-[11px] text-on-surface-variant space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-on-surface">
                      <span className="material-symbols-outlined text-[14px] text-secondary">
                        verified_user
                      </span>
                      <span>Compliance Verified</span>
                    </div>
                    <div>
                      GDPR &amp; Kenya Data Protection Act Compliant • Zero PII Retained • Model v2.4-edge
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full pt-16 bg-background flex-1">
        {activeTab === "screening-tool" && <ScreeningPanel />}
        {activeTab === "edge-diagnostics" && <EdgeDiagnosticsPanel />}
        {activeTab === "climate-health-gis" && <FluorosisPanel />}
        {activeTab === "digital-twin-simulation" && <TwinPanel />}
        {activeTab === "dataset-api-explorer" && <ApiExplorerPanel />}
        {activeTab === "milestone-dashboard" && <DashboardPanel />}
      </main>

      {/* Clean Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-surface-container py-3 mt-auto">
        <div className="w-full px-gutter-desktop max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-body-sm text-[12px] text-on-surface-variant">
            <span>
              © 2025 JinoX AI Health Systems • Research Consortium for Endemic Fluorosis
            </span>
          </div>
          <div className="flex items-center gap-4 font-label-sm text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Nakuru Gateway Connected
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
