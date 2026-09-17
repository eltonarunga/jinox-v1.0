"use client";

import { useState } from "react";

const DESC_BY_YEAR = [
  "No visible mottling. Enamel intact.",
  "Faint white flecking begins on enamel surface.",
  "Mild white striations visible across the crown.",
  "Chalky white patches cover a larger surface area.",
  "Light brown staining appears at patch edges.",
  "Moderate brown discoloration, enamel surface roughening.",
  "Pitting begins to form in stained areas.",
  "Enamel pitting is widespread across the tooth.",
  "Structural enamel loss visible at pit margins.",
  "Severe mottling with confluent pitting.",
  "Advanced fluorosis, corroded enamel appearance.",
];

export function TwinPanel() {
  const [years, setYears] = useState(0);
  const opacity = Math.min((years / 10) * 0.8, 0.8);
  const fill = years <= 5 ? "#E8D9A8" : "#C68B2E";

  return (
    <section>
      <div className="mb-7 max-w-xl">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-clay">
          Layer 3 · Digital Twin Simulation Engine
        </span>
        <h2 className="font-display text-3xl leading-tight">Disease progression, simulated</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          A simplified view of the twin engine&apos;s core function: modeling how untreated
          fluorosis progresses over time, so a hypothesis can be tested before it reaches a
          longitudinal clinical study.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-col items-center gap-4.5">
          <svg width="260" height="220" viewBox="0 0 260 220">
            <ellipse cx="130" cy="150" rx="95" ry="40" fill="#F1EEE6" />
            <rect x="95" y="40" width="70" height="90" rx="18" fill="#FBFAF6" stroke="#DDD6C7" strokeWidth="2" />
            <rect x="95" y="40" width="70" height="90" rx="18" fill={fill} opacity={opacity} />
            <path d="M95 118 Q130 130 165 118 L165 130 Q130 142 95 130 Z" fill="#E8C9A0" opacity="0.7" />
            <text x="130" y="205" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="11" fill="#4B5B54">
              Simulated cross-section
            </text>
          </svg>
          <div className="w-full max-w-md">
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-teal"
            />
          </div>
          <div className="max-w-md text-center text-sm text-ink-soft">
            Years of continued high-fluoride exposure without intervention:{" "}
            <span className="font-mono font-semibold text-teal">{years}</span>
            <br />
            {DESC_BY_YEAR[years]}
          </div>
        </div>
      </div>
    </section>
  );
}
