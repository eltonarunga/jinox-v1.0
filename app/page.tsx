"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  description: string;
}

const TABS: PlatformTab[] = [
  { id: "climate-health-gis", path: "climate-health-gis", label: "Climate-health GIS", shortLabel: "Climate-health GIS", icon: "public", layer: "Layer 6", description: "Explore environmental and oral-health signals." },
  { id: "screening-tool", path: "screening-tool", label: "Field screening", shortLabel: "Field screening", icon: "photo_camera", layer: "Field intake", description: "Capture and review screening information." },
  { id: "edge-diagnostics", path: "edge-diagnostics", label: "Edge diagnostics", shortLabel: "Edge diagnostics", icon: "psychology", layer: "Layer 5", description: "Review diagnostic outputs and model signals." },
  { id: "digital-twin-simulation", path: "digital-twin-simulation", label: "Digital twin", shortLabel: "Digital twin", icon: "biotech", layer: "Layer 3", description: "Explore simulation and digital-twin workflows." },
  { id: "dataset-api-explorer", path: "dataset-api-explorer", label: "Data & API explorer", shortLabel: "Data & API explorer", icon: "database", layer: "Layers 1–2", description: "Inspect available datasets and API tools." },
  { id: "milestone-dashboard", path: "milestone-dashboard", label: "Project dashboard", shortLabel: "Project dashboard", icon: "space_dashboard", layer: "Governance", description: "Review project milestones and progress." },
];

function Brand() {
  return (
    <Link href="/" className="group inline-flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-4" aria-label="JinoX AI home">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal-900 text-white shadow-sm">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden="true">
          <path d="M7 8.5h18M7 16h11M7 23.5h18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="23" cy="16" r="3.5" fill="#7DE3D4" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[16px] font-bold tracking-[-.04em] text-slate-950">JinoX <span className="text-teal-800">AI</span></span>
        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Clinical intelligence</span>
      </span>
    </Link>
  );
}

function ModuleIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>{name}</span>;
}

function MainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabQuery = searchParams.get("tab");
  const initialTab = TABS.some((t) => t.path === tabQuery) ? (tabQuery as string) : "climate-health-gis";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (tabQuery && TABS.some((t) => t.path === tabQuery)) setActiveTab(tabQuery);
  }, [tabQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleTabChange = (path: string) => {
    setActiveTab(path);
    setMobileNavOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", path);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const activeTabObj = TABS.find((t) => t.path === activeTab) ?? TABS[0];

  const navItems = (
    <>
      <div className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</div>
      {TABS.map((tab) => {
        const active = activeTab === tab.path;
        return (
          <button key={tab.path} type="button" onClick={() => handleTabChange(tab.path)} aria-current={active ? "page" : undefined}
            className={`group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${active ? "bg-teal-50 text-teal-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition ${active ? "bg-white text-teal-800 shadow-sm" : "text-slate-400 group-hover:text-slate-700"}`}>
              <ModuleIcon name={tab.icon} className="text-[19px]" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{tab.shortLabel}</span>
            {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" />}
          </button>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-slate-900 antialiased">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-slate-200/80 bg-white px-4 py-5 lg:flex">
        <Brand />
        <nav ref={navRef} className="mt-5 space-y-1" aria-label="Main workspace navigation">{navItems}</nav>
        <div className="mt-auto space-y-3 pt-6">
          <Link href="/research" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left transition hover:border-teal-200 hover:bg-teal-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-teal-800 shadow-sm"><ModuleIcon name="science" className="text-[20px]" /></span>
            <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800">Research workspace</span><span className="mt-0.5 block text-[11px] text-slate-500">Projects, datasets & consent</span></span>
            <ModuleIcon name="arrow_outward" className="text-[16px] text-slate-400" />
          </Link>
          <div className="flex items-center justify-between px-2 pt-1 text-[10px] text-slate-400"><span>JinoX AI</span><span>Platform workspace</span></div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setMobileNavOpen((open) => !open)} aria-expanded={mobileNavOpen} aria-label="Toggle workspace navigation" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden">
                <ModuleIcon name={mobileNavOpen ? "close" : "menu"} className="text-[21px]" />
              </button>
              <div className="min-w-0">
                <div className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-400 sm:flex"><span>Workspace</span><span className="text-slate-300">/</span><span className="truncate text-teal-800">{activeTabObj.layer}</span></div>
                <h1 className="mt-0.5 truncate text-[15px] font-semibold tracking-[-.025em] text-slate-900 sm:text-base">{activeTabObj.label}</h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-600 md:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" />Workspace</span>
              <Link href="/research" className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-900 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 sm:px-4">
                <ModuleIcon name="science" className="text-[17px]" /><span className="hidden sm:inline">Research</span><span className="sm:hidden">Lab</span>
              </Link>
            </div>
          </div>
        </header>

        {mobileNavOpen && (
          <>
            <button type="button" aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-[2px] lg:hidden" onClick={() => setMobileNavOpen(false)} />
            <nav aria-label="Mobile workspace navigation" className="fixed inset-x-3 top-[76px] z-40 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl lg:hidden">{navItems}<div className="mt-3 border-t border-slate-100 pt-3"><Link href="/research" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-teal-900 hover:bg-teal-50"><ModuleIcon name="science" />Research workspace<ModuleIcon name="arrow_outward" className="ml-auto text-[16px]" /></Link></div></nav>
          </>
        )}

        <main className="mx-auto min-h-[calc(100vh-68px)] max-w-[1800px] px-3 pb-8 pt-4 sm:px-6 sm:pt-6 xl:px-9">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200/80 pb-4 sm:mb-6 sm:pb-5">
            <div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-teal-800">{activeTabObj.layer}</p><h2 className="mt-1.5 text-xl font-semibold tracking-[-.04em] text-slate-950 sm:text-2xl">{activeTabObj.label}</h2><p className="mt-1.5 text-sm leading-6 text-slate-500">{activeTabObj.description}</p></div>
            <div className="hidden items-center gap-2 text-[11px] text-slate-400 sm:flex"><ModuleIcon name="keyboard_command_key" className="text-[15px]" />Choose a module from the workspace navigation</div>
          </div>
          <div className="min-w-0">
            {activeTab === "screening-tool" && <ScreeningPanel />}
            {activeTab === "edge-diagnostics" && <EdgeDiagnosticsPanel />}
            {activeTab === "climate-health-gis" && <FluorosisPanel />}
            {activeTab === "digital-twin-simulation" && <TwinPanel />}
            {activeTab === "dataset-api-explorer" && <ApiExplorerPanel />}
            {activeTab === "milestone-dashboard" && <DashboardPanel />}
          </div>
          <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200/80 pt-4 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>JinoX AI · Clinical and environmental health intelligence</span>
            <span>Prototype workspace · Review outputs in clinical context</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#f6f8f7] text-sm text-slate-500"><div className="flex items-center gap-3"><span className="h-2 w-2 animate-pulse rounded-full bg-teal-700" />Loading JinoX AI workspace…</div></div>}>
      <MainContent />
    </Suspense>
  );
}
