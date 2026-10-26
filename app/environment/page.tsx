"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Measurement = {
  id: string; sample_site_code: string; county: string; sub_county: string | null;
  water_source: string; sampled_on: string; fluoride_mg_l: number | null;
  temperature_c: number | null; rainfall_mm: number | null; source_name: string;
};
const field = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-900/5";
const button = "inline-flex min-h-10 items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const counties = ["Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"];

export default function EnvironmentalDataPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [ownerId, setOwnerId] = useState("");
  const [rows, setRows] = useState<Measurement[]>([]);
  const [siteCode, setSiteCode] = useState("");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [waterSource, setWaterSource] = useState("borehole");
  const [sampledOn, setSampledOn] = useState(new Date().toISOString().slice(0, 10));
  const [fluoride, setFluoride] = useState("");
  const [temperature, setTemperature] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data, error: queryError } = await supabase.from("environmental_measurements")
      .select("id,sample_site_code,county,sub_county,water_source,sampled_on,fluoride_mg_l,temperature_c,rainfall_mm,source_name")
      .order("sampled_on", { ascending: false }).limit(100);
    if (queryError) setError(queryError.message);
    else setRows((data ?? []) as Measurement[]);
  }, [supabase]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setError("Supabase is not configured for this deployment."); return; }
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !data.user) { setError("Sign in to manage environmental records."); return; }
      setOwnerId(data.user.id);
      await refresh();
    }
    void load();
    return () => { active = false; };
  }, [supabase, refresh]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (!supabase || !ownerId) { setError("Your session is not ready. Sign in again."); return; }
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,79}$/.test(siteCode.trim())) { setError("Site code must be 2–80 letters, numbers, underscores or hyphens."); return; }
    if (!county || sourceName.trim().length < 2) { setError("County and a verifiable source name are required."); return; }
    const numericFields: Array<[string, string, number, number]> = [
      ["Fluoride (mg/L)", fluoride, 0, 100],
      ["Temperature (°C)", temperature, -20, 70],
      ["Rainfall (mm)", rainfall, 0, 10000],
    ];
    for (const [name, raw, min, max] of numericFields) {
      if (raw !== "" && (!Number.isFinite(Number(raw)) || Number(raw) < min || Number(raw) > max)) {
        setError(`${name} must be between ${min} and ${max}, or left blank if not measured.`); return;
      }
    }
    setBusy(true);
    const { error: insertError } = await supabase.from("environmental_measurements").insert({
      owner_id: ownerId, sample_site_code: siteCode.trim(), county, sub_county: subCounty.trim() || null,
      water_source: waterSource, sampled_on: sampledOn,
      fluoride_mg_l: fluoride === "" ? null : Number(fluoride),
      temperature_c: temperature === "" ? null : Number(temperature),
      rainfall_mm: rainfall === "" ? null : Number(rainfall),
      source_name: sourceName.trim(), notes: notes.trim(),
    });
    setBusy(false);
    if (insertError) { setError(insertError.message); return; }
    setSiteCode(""); setSubCounty(""); setFluoride(""); setTemperature(""); setRainfall(""); setSourceName(""); setNotes("");
    await refresh();
    setNotice("Measurement saved. It is source-attributed research data, not a clinical risk score.");
  }

  return <main className="min-h-screen bg-[#f7f7f7] text-slate-900"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
    <header className="border-b border-slate-200 pb-5"><Link href="/clinical" className="text-sm font-semibold text-slate-500 hover:text-black">← Clinical workspace</Link><h1 className="mt-3 text-3xl font-semibold tracking-tight">Environmental measurements</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Capture source-attributed water and climate measurements for oral-health research. County-level measurements are not a substitute for a verified sample result.</p></header>
    {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">New measurement</h2><form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium">Sample site code<input className={field} value={siteCode} onChange={e=>setSiteCode(e.target.value)} required minLength={2} maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9_-]{1,79}" placeholder="SITE_0001" /></label>
      <label className="text-sm font-medium">County<select className={field} value={county} onChange={e=>setCounty(e.target.value)} required><option value="">Select county</option>{counties.map(c=><option key={c}>{c}</option>)}</select></label>
      <label className="text-sm font-medium">Sub-county (optional)<input className={field} value={subCounty} onChange={e=>setSubCounty(e.target.value)} maxLength={100} /></label>
      <label className="text-sm font-medium">Water source<select className={field} value={waterSource} onChange={e=>setWaterSource(e.target.value)}><option value="borehole">Borehole</option><option value="well">Well</option><option value="piped">Piped water</option><option value="surface_water">Surface water</option><option value="bottled">Bottled water</option><option value="other">Other</option><option value="unknown">Unknown</option></select></label>
      <label className="text-sm font-medium">Sample date<input className={field} type="date" value={sampledOn} max={new Date().toISOString().slice(0,10)} onChange={e=>setSampledOn(e.target.value)} required /></label>
      <label className="text-sm font-medium">Fluoride (mg/L)<input className={field} type="number" step="0.001" min="0" max="100" value={fluoride} onChange={e=>setFluoride(e.target.value)} placeholder="Leave blank if not measured" /></label>
      <label className="text-sm font-medium">Temperature (°C)<input className={field} type="number" step="0.1" min="-20" max="70" value={temperature} onChange={e=>setTemperature(e.target.value)} /></label>
      <label className="text-sm font-medium">Rainfall (mm)<input className={field} type="number" step="0.1" min="0" max="10000" value={rainfall} onChange={e=>setRainfall(e.target.value)} /></label>
      <label className="text-sm font-medium sm:col-span-2">Source name / reference<input className={field} value={sourceName} onChange={e=>setSourceName(e.target.value)} required minLength={2} maxLength={200} placeholder="Laboratory, report identifier or published dataset" /></label>
      <label className="text-sm font-medium sm:col-span-2">Notes (optional)<textarea className={field} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} maxLength={2000} /></label>
      <div className="sm:col-span-2 flex flex-wrap gap-3"><button className={button} disabled={busy}>{busy ? "Saving…" : "Save measurement"}</button><a className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold" href="/templates/environmental-data-template.csv" download>Download CSV template</a></div>
    </form></section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Saved measurements</h2><span className="text-sm text-slate-500">{rows.length} shown</span></div>{rows.length ? <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><th className="py-3 pr-3">Site / county</th><th className="py-3 pr-3">Sample date</th><th className="py-3 pr-3">Water source</th><th className="py-3 pr-3">Fluoride mg/L</th><th className="py-3">Source</th></tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-b border-slate-100"><td className="py-3 pr-3 font-medium">{row.sample_site_code}<div className="text-xs font-normal text-slate-500">{row.county}{row.sub_county ? `, ${row.sub_county}` : ""}</div></td><td className="py-3 pr-3">{row.sampled_on}</td><td className="py-3 pr-3">{row.water_source.replaceAll("_"," ")}</td><td className="py-3 pr-3">{row.fluoride_mg_l ?? "Not measured"}</td><td className="py-3">{row.source_name}</td></tr>)}</tbody></table></div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No environmental measurements saved yet.</p>}</section>
  </div></main>;
}
