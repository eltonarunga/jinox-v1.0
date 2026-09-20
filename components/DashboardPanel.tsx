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
    <div className="flex flex-col w-full p-space-md max-w-[1720px] mx-auto space-y-md">
      {/* Top Header & Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary-container px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-on-secondary-container">
            Governance &amp; Impact
          </span>
          <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface mt-1">
            Program Milestone Projections
          </h2>
        </div>

        <button
          onClick={handleExportJson}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md text-label-md font-bold text-on-primary shadow-sm hover:bg-primary-container transition"
        >
          <span className="material-symbols-outlined text-[18px]">
            download
          </span>
          Export Report (JSON)
        </button>
      </div>

      {/* Program Health Banner */}
      <div className="rounded-xl border border-surface-container bg-surface-container-lowest p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-label-sm text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
            Pilot Execution Status
          </div>
          <div className="text-headline-lg text-headline-lg font-bold text-on-surface mt-0.5">
            Phase 1 On-Track · {overallProgress}% Completion
          </div>
        </div>

        <div className="w-full md:w-64">
          <div className="flex justify-between text-data-mono text-[12px] font-bold text-on-surface mb-1">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-secondary"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Dropdown */}
      <div className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl border border-surface-container shadow-sm">
        <label className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wide flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            filter_list
          </span>
          Filter Milestones Dropdown:
        </label>

        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="bg-surface-container-low text-on-surface font-label-md text-label-md px-3 py-1.5 rounded-lg border border-surface-container outline-none cursor-pointer font-bold"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-surface-container bg-surface-container-lowest p-4 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-label-sm text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  {s.label}
                </span>
                <span className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-data-mono uppercase text-on-surface-variant font-semibold">
                  {s.category}
                </span>
              </div>

              <div className="font-display-lg text-display-lg font-bold text-secondary mt-1">
                {s.current}
                <span className="ml-1 font-body-sm text-body-sm font-normal text-on-surface-variant">
                  / {s.target}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-surface-container">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: `${Math.min(100, s.pct)}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-data-mono text-[11px] text-on-surface-variant">
                <span>Current: {s.current}</span>
                <span className="font-bold text-on-surface">{s.pct}% completed</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
