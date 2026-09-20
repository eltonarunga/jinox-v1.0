"use client";

import { useState, useMemo } from "react";
import { dashboardStats } from "@/lib/data";

const CATEGORIES = [
  { id: "all", label: "All Milestones" },
  { id: "diagnostics", label: "Diagnostics & AI" },
  { id: "community", label: "Field & Screenings" },
  { id: "operations", label: "Facilities & Mapping" },
  { id: "research", label: "Academic & Publications" },
];

export function DashboardPanel() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredStats = useMemo(() => {
    if (activeCategory === "all") return dashboardStats;
    return dashboardStats.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const overallProgress = useMemo(() => {
    const total = dashboardStats.reduce((acc, s) => acc + s.pct, 0);
    return Math.round(total / dashboardStats.length);
  }, []);

  const handleExportJson = () => {
    const exportData = {
      project: "JinoX AI — Oral & Craniofacial Health Platform",
      pilot: "Kenya Endemic Fluorosis Pilot",
      exported_at: new Date().toISOString(),
      overall_target_progress_pct: overallProgress,
      milestones: dashboardStats,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jinox-ai-pilot-milestones-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full p-space-md max-w-[1720px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-secondary-container px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-on-secondary-container">
            Governance &amp; Impact
          </span>
          <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface mt-2">
            18-Month Program Milestone Projections
          </h2>
          <p className="mt-2 text-body-md text-body-md text-on-surface-variant max-w-2xl">
            Cumulative performance metrics and capacity rollout across Nakuru and Rift Valley pilot
            counties, aligned with the Google.org Impact Challenge AI for Science proposal targets.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-label-md text-label-md font-semibold text-on-surface shadow-sm hover:bg-surface-container-low transition self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px] text-secondary">
            download
          </span>
          Export Report (JSON)
        </button>
      </div>

      {/* Program Health Banner */}
      <div className="rounded-2xl border border-surface-container bg-surface-container-lowest p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">
              Pilot Execution Status
            </div>
            <div className="text-headline-lg text-headline-lg font-bold text-on-surface mt-1">
              Phase 1 On-Track · {overallProgress}% Aggregate Target Completion
            </div>
            <p className="text-body-sm text-body-sm text-on-surface-variant mt-1">
              Mid-term evaluation projected for Q3. Clinical pipeline active across 9 health facilities.
            </p>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between text-data-mono text-data-mono font-semibold text-on-surface mb-1.5">
              <span>Overall Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 text-label-sm text-label-sm">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-lg px-3 py-1.5 font-medium transition whitespace-nowrap ${
              activeCategory === cat.id
                ? "bg-secondary text-on-secondary shadow-sm font-semibold"
                : "bg-surface-container-lowest border border-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-surface-container bg-surface-container-lowest p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  {s.label}
                </span>
                <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-label-sm font-data-mono capitalize text-on-surface-variant">
                  {s.category}
                </span>
              </div>

              <div className="font-display-lg text-display-lg font-bold text-secondary mt-1">
                {s.current}
                <span className="ml-1.5 font-body-sm text-body-sm font-normal text-on-surface-variant">
                  / target {s.target}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-container">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-700"
                  style={{ width: `${Math.min(100, s.pct)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-data-mono text-data-mono text-on-surface-variant">
                <span>Current: {s.current}</span>
                <span className="font-semibold text-on-surface">{s.pct}% completed</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Research and Governance Context Note */}
      <div className="mt-7 rounded-xl border-l-4 border-secondary bg-secondary-container/40 p-4 text-body-sm text-body-sm text-on-surface shadow-sm">
        <p className="font-semibold text-secondary mb-0.5">Ethical Oversight &amp; Data Governance</p>
        All simulated milestones comply with the proposed governance framework: patient-level intraoral
        imaging data is processed strictly at edge nodes on Community Health Promoter tablets with federated
        weight updates. Only anonymized environmental surveillance metrics are persisted to public research endpoints.
      </div>
    </div>
  );
}
