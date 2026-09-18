"use client";

import { useState } from "react";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  name: string;
  desc: string;
  defaultBody?: object;
  curlExample: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/dataset/summary",
    name: "Dataset Registry Summary",
    desc: "Returns dataset scale, modalities (imaging, clinical, genomic), and open academic license.",
    curlExample: "curl -X GET https://jinox.ai/api/dataset/summary",
  },
  {
    method: "GET",
    path: "/api/counties",
    name: "County Surveillance Directory",
    desc: "Returns all surveyed counties with mean groundwater fluoride levels and screening outcomes.",
    curlExample: "curl -X GET https://jinox.ai/api/counties",
  },
  {
    method: "GET",
    path: "/api/environment/fluoride?county=Nakuru",
    name: "Hydrogeological Telemetry",
    desc: "Targeted groundwater fluoride reading compared to WHO 1.5 ppm guidelines.",
    curlExample: "curl -X GET 'https://jinox.ai/api/environment/fluoride?county=Nakuru'",
  },
  {
    method: "GET",
    path: "/api/model/performance",
    name: "Diagnostic Model Metrics",
    desc: "Foundational AI model AUC, sensitivity, and subgroup equity evaluation benchmarks.",
    curlExample: "curl -X GET https://jinox.ai/api/model/performance",
  },
  {
    method: "POST",
    path: "/api/risk/predict",
    name: "Multimodal Risk Inference",
    desc: "Fuses intraoral image features, hydrological exposure, and genomics into clinical tier.",
    defaultBody: {
      county: "Baringo",
      patientAge: 38,
      imagingSignal: 74,
      geneticSignal: 55,
    },
    curlExample:
      'curl -X POST https://jinox.ai/api/risk/predict \\\n  -H "Content-Type: application/json" \\\n  -d \'{"county":"Baringo","patientAge":38,"imagingSignal":74,"geneticSignal":55}\'',
  },
];

export function ApiExplorerPanel() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [output, setOutput] = useState<string>("Click 'Execute Request' below to query the live API route.");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [dataSourceHeader, setDataSourceHeader] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [requestBodyText, setRequestBodyText] = useState<string>(
    JSON.stringify(ENDPOINTS[4].defaultBody, null, 2)
  );

  const currentEndpoint = ENDPOINTS[activeIdx];

  async function executeRequest(index: number = activeIdx) {
    setActiveIdx(index);
    setLoading(true);
    setCopied(false);
    const target = ENDPOINTS[index];

    const startTime = performance.now();
    try {
      let res: Response;
      if (target.method === "GET") {
        res = await fetch(target.path);
      } else {
        let parsedBody = {};
        try {
          parsedBody = JSON.parse(requestBodyText);
        } catch {
          parsedBody = target.defaultBody || {};
        }

        res = await fetch(target.path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedBody),
        });
      }

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);
      setStatusCode(res.status);
      setStatusText(res.statusText || (res.ok ? "OK" : "Error"));
      setDataSourceHeader(res.headers.get("X-Data-Source") || "standard");

      const json = await res.json();
      setOutput(JSON.stringify(json, null, 2));
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);
      setStatusCode(0);
      setStatusText("Network Error");
      setOutput(`Error executing request:\n${err.message || "Failed to reach server"}`);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="panel-api" role="tabpanel" aria-labelledby="tab-api">
      <div className="mb-7 max-w-2xl">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-clay/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-clay">
          Layers 1–2 · Pan-African Dataset &amp; Foundational Model
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink mt-2">
          Research API &amp; Telemetry Explorer
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Test live platform endpoints in real time. Academic institutions, Kenyan Ministry of Health
          stakeholders, and partner universities query these surfaces for epidemiological modeling and
          clinical decision support.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Endpoint selector (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-ink mb-1">Endpoints Directory</h3>
            <p className="text-xs text-ink-soft mb-4">Select an API route to inspect specification and trigger live execution.</p>

            <div className="space-y-2.5">
              {ENDPOINTS.map((ep, i) => {
                const isSelected = activeIdx === i;
                return (
                  <button
                    key={ep.path}
                    onClick={() => {
                      setActiveIdx(i);
                      if (ep.defaultBody) {
                        setRequestBodyText(JSON.stringify(ep.defaultBody, null, 2));
                      }
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-teal ring-2 ring-teal-wash bg-teal-wash/25 shadow-sm"
                        : "border-line bg-surface hover:border-teal/40 hover:bg-surface-alt/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-ink">{ep.name}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[0.65rem] font-bold ${
                          ep.method === "GET"
                            ? "bg-teal-wash text-teal border border-teal/20"
                            : "bg-clay/15 text-clay border border-clay/20"
                        }`}
                      >
                        {ep.method}
                      </span>
                    </div>
                    <div className="font-mono text-[0.72rem] text-ink-soft truncate">{ep.path}</div>
                  </button>
                );
              })}
            </div>

            {/* Request body editor if POST */}
            {currentEndpoint.method === "POST" && (
              <div className="mt-4 pt-3 border-t border-line-soft">
                <label className="block text-xs font-medium text-ink mb-1.5">
                  Request Payload (JSON)
                </label>
                <textarea
                  rows={5}
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  className="w-full rounded-lg border border-line bg-surface-alt/70 p-2.5 font-mono text-xs text-ink focus:border-teal focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-line-soft">
            <button
              onClick={() => executeRequest(activeIdx)}
              disabled={loading}
              className="w-full rounded-lg bg-teal py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-bright transition disabled:opacity-50"
            >
              {loading ? "Calling Route..." : `Send ${currentEndpoint.method} Request`}
            </button>
          </div>
        </div>

        {/* Right: Live Console & Response Output (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-line bg-surface p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft pb-3 mb-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-ink">Live Response Stream</h3>
                <p className="text-xs text-ink-soft">Real-time HTTP response payload from Next.js route.</p>
              </div>

              <div className="flex items-center gap-2">
                {statusCode !== null && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[0.68rem] font-bold ${
                      statusCode >= 200 && statusCode < 300
                        ? "bg-risk-low-wash text-risk-low border border-risk-low/30"
                        : "bg-risk-high-wash text-risk-high border border-risk-high/30"
                    }`}
                  >
                    {statusCode} {statusText}
                  </span>
                )}
                {latency !== null && (
                  <span className="rounded-full bg-surface-alt px-2.5 py-0.5 font-mono text-[0.68rem] text-ink-soft">
                    {latency} ms
                  </span>
                )}
                {dataSourceHeader && (
                  <span className="rounded-full bg-teal-wash px-2 py-0.5 font-mono text-[0.65rem] text-teal">
                    source: {dataSourceHeader}
                  </span>
                )}
              </div>
            </div>

            {/* Response Console */}
            <div className="relative">
              <pre className="min-h-[280px] max-h-[420px] overflow-auto rounded-xl bg-[#12201C] p-4 font-mono text-xs leading-relaxed text-[#DCEFE9] shadow-inner">
                {output}
              </pre>

              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur px-2.5 py-1 font-mono text-[0.7rem] text-white transition border border-white/20"
              >
                {copied ? "✓ Copied" : "Copy JSON"}
              </button>
            </div>

            {/* Curl Command Preview */}
            <div className="mt-4 rounded-xl border border-line-soft bg-surface-alt/60 p-3">
              <span className="block text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider mb-1">
                cURL Integration Example
              </span>
              <code className="block font-mono text-[0.72rem] text-ink break-all select-all">
                {currentEndpoint.curlExample}
              </code>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line-soft text-[0.7rem] text-ink-soft flex justify-between items-center">
            <span>Protocol: HTTPS/2 · JSON UTF-8</span>
            <span>Authentication: Public Academic Tier</span>
          </div>
        </div>
      </div>
    </section>
  );
}
