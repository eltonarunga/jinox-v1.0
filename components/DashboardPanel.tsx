"use client";

import { useState, useMemo } from "react";
import { dashboardStats } from "@/lib/data";
import type { DashboardStatItem } from "@/lib/types";

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
    <section id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 max-w-5xl">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-clay/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-clay">
            Governance &amp; Impact
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink mt-2">
            18-Month Program Milestone Projections
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft max-w-2xl">
            Cumulative performance metrics and capacity rollout across Nakuru and Rift Valley pilot
            counties, aligned with the Google.org Impact Challenge AI for Science proposal targets.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink shadow-sm hover:bg-surface-alt transition self-start sm:self-auto"
        >
          <svg className="h-4 w-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export Report (JSON)
        </button>
      </div>

      {/* Program Health Banner */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-ink uppercase tracking-wider">
              Pilot Execution Status
            </div>
            <div className="text-xl font-display font-bold text-ink mt-1">
              Phase 1 On-Track · {overallProgress}% Aggregate Target Completion
            </div>
            <p className="text-xs text-ink-soft mt-1">
              Mid-term evaluation projected for Q3. Clinical pipeline active across 9 health facilities.
            </p>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs font-mono font-semibold text-ink mb-1.5">
              <span>Overall Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal to-clay"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-lg px-3 py-1.5 font-medium transition whitespace-nowrap ${
              activeCategory === cat.id
                ? "bg-teal text-white shadow-sm font-semibold"
                : "bg-surface border border-line text-ink-soft hover:text-ink hover:bg-surface-alt"
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
            className="rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-ink-soft">
                  {s.label}
                </span>
                <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[0.65rem] font-mono capitalize text-ink-soft">
                  {s.category}
                </span>
              </div>

              <div className="font-display text-2xl font-bold text-teal mt-1">
                {s.current}
                <span className="ml-1.5 font-body text-xs font-normal text-ink-soft">
                  / target {s.target}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line-soft">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">
                <div
                  className="h-full rounded-full bg-clay transition-all duration-700"
                  style={{ width: `${Math.min(100, s.pct)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[0.68rem] text-ink-soft font-mono">
                <span>Current: {s.current}</span>
                <span className="font-semibold text-ink">{s.pct}% completed</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Research and Governance Context Note */}
      <div className="mt-7 rounded-xl border-l-4 border-clay bg-clay-soft/40 p-4 text-xs leading-relaxed text-ink shadow-sm">
        <p className="font-semibold text-clay mb-0.5">Ethical Oversight &amp; Data Governance</p>
        All simulated milestones comply with the proposed governance framework: patient-level intraoral
        imaging data is processed strictly at edge nodes on Community Health Promoter tablets with federated
        weight updates. Only anonymized environmental surveillance metrics are persisted to public research endpoints.
      </div>
    </section>
  );
}
