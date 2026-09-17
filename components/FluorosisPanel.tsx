"use client";

import { useEffect, useState } from "react";
import type { County } from "@/lib/data";

const levelLabel: Record<County["level"], string> = {
  high: "High risk",
  mod: "Moderate",
  low: "Low risk",
};
const levelClass: Record<County["level"], string> = {
  high: "bg-risk-high-wash text-risk-high",
  mod: "bg-risk-mod-wash text-risk-mod",
  low: "bg-risk-low-wash text-risk-low",
};

export function FluorosisPanel() {
  const [counties, setCounties] = useState<County[]>([]);
  const [selected, setSelected] = useState<County | null>(null);

  useEffect(() => {
    fetch("/api/counties")
      .then((r) => r.json())
      .then((data) => setCounties(data.counties));
  }, []);

  return (
    <section>
      <div className="mb-7 max-w-xl">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-clay">
          Layer 6 · Climate-Health Intelligence
        </span>
        <h2 className="font-display text-3xl leading-tight">County-level fluorosis risk</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Data served live from <code>/api/counties</code>. Groundwater fluoride readings
          joined with screening outcomes, giving public health teams a county view instead
          of a single clinic view.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-1 text-lg font-display font-semibold">Counties (sample set)</h3>
          <p className="mb-4 text-sm text-ink-soft">
            Rift Valley counties carry the highest endemic fluoride signal in the current
            dataset.
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {counties.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelected(c)}
                className={`rounded-lg border p-3 text-left ${
                  selected?.name === c.name
                    ? "border-teal ring-2 ring-teal-wash"
                    : "border-line"
                }`}
              >
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="font-mono text-xs text-ink-soft">{c.ppm} ppm F&#8315;</div>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${levelClass[c.level]}`}
                >
                  {levelLabel[c.level]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-1 text-lg font-display font-semibold">County detail</h3>
          <p className="mb-4 text-sm text-ink-soft">
            {selected ? `${selected.name} county, current pilot-phase readout.` : "Select a county from the list."}
          </p>
          {selected && (
            <div>
              <StatLine k="Groundwater fluoride" v={`${selected.ppm} ppm`} />
              <StatLine k="Risk tier" v={levelLabel[selected.level]} />
              <StatLine k="Patients screened" v={selected.screened.toLocaleString()} />
              <StatLine k="Referral rate" v={selected.referralRate} />
              <StatLine k="WHO guideline" v="1.5 ppm" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatLine({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-line-soft py-2.5 text-sm last:border-none">
      <span className="text-ink-soft">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}
