import { dashboardStats } from "@/lib/data";

export function DashboardPanel() {
  return (
    <section>
      <div className="mb-7 max-w-xl">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-clay">
          Program Overview
        </span>
        <h2 className="font-display text-3xl leading-tight">
          18-month targets, pilot-phase projection
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Progress against the impact targets in the proposal, as the pilot phase would
          report them to Google.org at the midpoint review.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {s.label}
            </div>
            <div className="font-display text-2xl font-semibold text-teal">
              {s.current}
              <span className="ml-1 font-body text-sm font-normal text-ink-soft">
                / {s.target}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-alt">
              <div className="h-full rounded-full bg-clay" style={{ width: `${s.pct}%` }} />
            </div>
            <div className="mt-2 text-xs text-ink-soft">{s.pct}% toward 18-month target</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-r-lg border-l-4 border-clay bg-clay-soft p-4 text-sm">
        Reflects the pilot design (one county, eight facilities, roughly 5,000 patients over
        six months) scaled into the 18-month projection used in the proposal. Figures are
        served from <code>lib/data.ts</code> and are illustrative, not live production data.
      </div>
    </section>
  );
}
