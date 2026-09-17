"use client";

import { useState } from "react";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  desc: string;
  call: () => Promise<unknown>;
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/api/dataset/summary",
    desc: "Dataset scale and coverage",
    call: () => fetch("/api/dataset/summary").then((r) => r.json()),
  },
  {
    method: "POST",
    path: "/api/risk/predict",
    desc: "Run a fused risk prediction",
    call: () =>
      fetch("/api/risk/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ county: "Baringo", patientAge: 41 }),
      }).then((r) => r.json()),
  },
  {
    method: "GET",
    path: "/api/environment/fluoride?county=Nakuru",
    desc: "County fluoride reading",
    call: () => fetch("/api/environment/fluoride?county=Nakuru").then((r) => r.json()),
  },
  {
    method: "GET",
    path: "/api/model/performance",
    desc: "Latest validation metrics",
    call: () => fetch("/api/model/performance").then((r) => r.json()),
  },
];

export function ApiExplorerPanel() {
  const [active, setActive] = useState(0);
  const [output, setOutput] = useState<string>("Select an endpoint to send a live request.");
  const [loading, setLoading] = useState(false);

  async function run(idx: number) {
    setActive(idx);
    setLoading(true);
    try {
      const data = await endpoints[idx].call();
      setOutput(JSON.stringify(data, null, 2));
    } catch (e) {
      setOutput("Request failed. Is the dev server running?");
    }
    setLoading(false);
  }

  return (
    <section>
      <div className="mb-7 max-w-xl">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-clay">
          Layer 1&ndash;2 · Pan-African Dataset &amp; Foundational Model
        </span>
        <h2 className="font-display text-3xl leading-tight">Research API explorer</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          These buttons call the app&apos;s own live API routes in real time. This is the
          same surface a partner university would query once the academic-use license is
          live.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-3 text-lg font-display font-semibold">Endpoints</h3>
          <div className="flex flex-col gap-2">
            {endpoints.map((ep, i) => (
              <button
                key={ep.path}
                onClick={() => run(i)}
                className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm ${
                  active === i ? "border-teal" : "border-line"
                }`}
              >
                <span>
                  <span className="mr-2 rounded bg-teal-wash px-1.5 py-0.5 font-mono text-[0.68rem] font-semibold text-teal">
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs">{ep.path}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-1 text-lg font-display font-semibold">Response</h3>
          <p className="mb-4 text-sm text-ink-soft">
            {loading ? "Request in flight..." : "Live response from the route above."}
          </p>
          <pre className="min-h-[260px] overflow-x-auto whitespace-pre rounded-xl bg-[#12201C] p-4 font-mono text-xs leading-relaxed text-[#DCEFE9]">
            {output}
          </pre>
        </div>
      </div>
    </section>
  );
}
