"use client";

import { useEffect, useState, useMemo } from "react";
import type { County, RiskTier } from "@/lib/types";
import { whoGuidelinePpm, severeEndemicThresholdPpm } from "@/lib/data";

const levelLabel: Record<RiskTier, string> = {
  high: "High Risk (>4.0 ppm)",
  mod: "Moderate (1.5–4.0 ppm)",
  low: "Low Risk (≤1.5 ppm)",
};

const levelBadge: Record<RiskTier, string> = {
  high: "bg-risk-high-wash text-risk-high border-risk-high/30",
  mod: "bg-risk-mod-wash text-risk-mod border-risk-mod/30",
  low: "bg-risk-low-wash text-risk-low border-risk-low/30",
};

export function FluorosisPanel() {
  const [counties, setCounties] = useState<County[]>([]);
  const [selected, setSelected] = useState<County | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("local");

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch("/api/counties")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCounties(data.counties || []);
        if (data.counties?.length > 0 && !selected) {
          setSelected(data.counties[0]);
        }
        setDataSource(data.data_source || "seeded-mock");
      })
      .catch((err) => {
        setError(err.message || "Failed to load county fluorosis dataset.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCounties = useMemo(() => {
    return counties.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = filterTier === "all" || c.level === filterTier;
      return matchesSearch && matchesTier;
    });
  }, [counties, searchQuery, filterTier]);

  const stats = useMemo(() => {
    if (counties.length === 0) return { totalScreened: 0, avgPpm: 0, exceedingWho: 0 };
    const totalScreened = counties.reduce((acc, c) => acc + (c.screened || 0), 0);
    const avgPpm = Number(
      (counties.reduce((acc, c) => acc + c.ppm, 0) / counties.length).toFixed(2)
    );
    const exceedingWho = counties.filter((c) => c.ppm > whoGuidelinePpm).length;
    return { totalScreened, avgPpm, exceedingWho };
  }, [counties]);

  return (
    <section id="panel-map" role="tabpanel" aria-labelledby="tab-map">
      <div className="mb-7 max-w-2xl">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-clay/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-clay">
          Layer 6 · Climate-Health Intelligence
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink mt-2">
          Endemic Groundwater Fluorosis Surveillance
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Live hydrological data joined with county epidemiological screening outcomes from{" "}
          <code className="bg-surface-alt px-1.5 py-0.5 rounded font-mono text-xs">/api/counties</code>.
          Enables targeted defluoridation resource allocation and community health promoter deployment.
        </p>
      </div>

      {/* Aggregate metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs text-ink-soft">Counties Monitored</div>
          <div className="mt-1 font-display text-2xl font-bold text-ink">{counties.length}</div>
          <div className="text-[0.68rem] text-ink-soft mt-1">Kenya Rift Valley focus</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs text-ink-soft">Mean Fluoride</div>
          <div className="mt-1 font-display text-2xl font-bold text-teal">
            {stats.avgPpm} <span className="text-xs font-normal">ppm</span>
          </div>
          <div className="text-[0.68rem] text-risk-mod mt-1">WHO limit: 1.5 ppm</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs text-ink-soft">Exceeding WHO Limit</div>
          <div className="mt-1 font-display text-2xl font-bold text-risk-high">
            {stats.exceedingWho} / {counties.length}
          </div>
          <div className="text-[0.68rem] text-ink-soft mt-1">Requiring intervention</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="text-xs text-ink-soft">Data Source</div>
          <div className="mt-1 font-display text-base font-bold text-ink capitalize truncate">
            {dataSource === "supabase" ? "Supabase Live" : "Seeded Survey"}
          </div>
          <div className="text-[0.68rem] text-ink-soft mt-1">WRMA Quality Feed</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Search, Filter, Grid of Counties (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 justify-between items-stretch sm:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search counties (e.g. Nakuru, Baringo)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-line bg-bg pl-8 pr-3 py-2 text-xs focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
              />
              <svg
                className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-soft/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex gap-1 overflow-x-auto text-xs">
              {(["all", "high", "mod", "low"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTier(t)}
                  className={`rounded-lg px-2.5 py-1.5 font-medium transition capitalize ${
                    filterTier === t
                      ? "bg-teal text-white"
                      : "bg-surface-alt text-ink-soft hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 py-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-surface-alt" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-risk-high/30 bg-risk-high-wash p-4 text-center text-xs text-risk-high">
              <p>{error}</p>
              <button
                onClick={loadData}
                className="mt-2 rounded-md bg-white px-3 py-1 font-semibold text-risk-high shadow"
              >
                Retry Request
              </button>
            </div>
          ) : filteredCounties.length === 0 ? (
            <div className="py-12 text-center text-xs text-ink-soft">
              No surveillance counties match your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {filteredCounties.map((c) => {
                const isSelected = selected?.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelected(c)}
                    className={`rounded-xl border p-3.5 text-left transition-all relative ${
                      isSelected
                        ? "border-teal ring-2 ring-teal-wash bg-teal-wash/20 shadow-sm"
                        : "border-line bg-surface hover:border-teal/50 hover:bg-surface-alt/40"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-ink">{c.name}</span>
                      {c.ppm >= severeEndemicThresholdPpm && (
                        <span className="h-2 w-2 rounded-full bg-risk-high" title="Severe Endemic" />
                      )}
                    </div>
                    <div className="font-mono text-xs font-bold text-teal mt-1">
                      {c.ppm.toFixed(1)} ppm F⁻
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`inline-block rounded-md border px-1.5 py-0.5 text-[0.65rem] font-semibold ${levelBadge[c.level]}`}
                      >
                        {c.level.toUpperCase()}
                      </span>
                      {c.screened > 0 && (
                        <span className="text-[0.65rem] text-ink-soft font-mono">
                          {c.screened} scr.
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected County Deep-Dive (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-line-soft pb-3 mb-4">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-clay">
                Regional Hydrogeology Profile
              </span>
              <h3 className="text-xl font-display font-bold text-ink mt-0.5">
                {selected ? `${selected.name} County` : "County Overview"}
              </h3>
            </div>

            {selected ? (
              <div className="space-y-4">
                {/* Comparative Threshold Bar */}
                <div className="rounded-xl border border-line-soft bg-surface-alt/60 p-3.5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-ink">Groundwater Fluoride Reading</span>
                    <span className="font-mono font-bold text-teal">{selected.ppm} ppm</span>
                  </div>

                  <div className="relative h-3 w-full rounded-full bg-line overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selected.ppm >= severeEndemicThresholdPpm
                          ? "bg-risk-high"
                          : selected.ppm > whoGuidelinePpm
                          ? "bg-risk-mod"
                          : "bg-risk-low"
                      }`}
                      style={{ width: `${Math.min(100, (selected.ppm / 8) * 100)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[0.68rem] text-ink-soft">
                    <span>0 ppm</span>
                    <span className="font-semibold text-risk-mod">WHO Limit: 1.5 ppm</span>
                    <span className="font-semibold text-risk-high">Severe: 4.0 ppm</span>
                    <span>8.0 ppm</span>
                  </div>
                </div>

                <div className="divide-y divide-line-soft text-xs">
                  <DetailRow label="Surveillance Classification" value={levelLabel[selected.level]} />
                  <DetailRow
                    label="Ratio to WHO Guideline"
                    value={`${(selected.ppm / whoGuidelinePpm).toFixed(1)}× allowable limit`}
                    highlight={selected.ppm > whoGuidelinePpm}
                  />
                  <DetailRow
                    label="Community Screenings Recorded"
                    value={selected.screened ? selected.screened.toLocaleString() : "Pilot Pending"}
                  />
                  <DetailRow label="Clinical Referral Rate" value={selected.referralRate} />
                  <DetailRow label="Data Authority / Provenance" value={selected.source || "WRMA Hydrogeological Survey"} />
                </div>

                <div className="rounded-xl bg-teal-wash/60 p-3 text-xs text-ink leading-relaxed border border-teal/20">
                  <strong>Recommended Intervention:</strong>{" "}
                  {selected.level === "high"
                    ? "Priority deployment of bone-char and activated alumina household defluoridation filters; school rainwater harvesting."
                    : selected.level === "mod"
                    ? "Borehole water testing advisories, maternal nutrition counseling, and clinical dental fluorosis tracking."
                    : "Standard water quality surveillance and universal salt iodization monitoring."}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-ink-soft">
                Select a county to inspect hydrological metrics.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between py-2.5">
      <span className="text-ink-soft">{label}</span>
      <span className={`font-mono font-semibold ${highlight ? "text-risk-high" : "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}
