"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { expectedMimeType, uploadTypes, validateUpload, type UploadModality } from "@/lib/validation/uploads";
import { readStructuredFile, validateStructuredFile } from "@/lib/validation/structured-records";

type CaseRecord = {
  id: string;
  case_code: string;
  county: string;
  age_band: string | null;
  purpose: string;
  consent_status: string;
  created_at: string;
};
type AssetRecord = {
  id: string;
  modality: string;
  original_filename: string;
  byte_size: number;
  status: string;
  uploaded_at: string;
};
type ObservationRecord = {
  id: string;
  category: string;
  observation_code: string;
  finding: string;
  observed_on: string;
  status: string;
};

const field = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-900/5";
const button = "inline-flex min-h-10 items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";
const secondary = "inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50";
const panel = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const categories = ["dental_caries", "periodontal", "oral_mucosa", "fluorosis", "pain", "occlusion", "other"] as const;
const counties = [
  "Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"
];

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
function humanSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
async function sha256(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function DataIntakePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState("");
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  const [caseCode, setCaseCode] = useState("");
  const [county, setCounty] = useState("");
  const [ageBand, setAgeBand] = useState("unknown");
  const [purpose, setPurpose] = useState("research");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [uploadConsentConfirmed, setUploadConsentConfirmed] = useState(false);
  const [consentBasis, setConsentBasis] = useState<"obtained" | "ethics_waiver">("obtained");
  const [modality, setModality] = useState<UploadModality>("intraoral_photo");
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<(typeof categories)[number]>("dental_caries");
  const [observationCode, setObservationCode] = useState("caries_status");
  const [finding, setFinding] = useState("");
  const [observedOn, setObservedOn] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const refreshCases = useCallback(async (preferredId?: string) => {
    if (!supabase) return;
    const { data, error: queryError } = await supabase
      .from("clinical_cases")
      .select("id,case_code,county,age_band,purpose,consent_status,created_at")
      .order("created_at", { ascending: false });
    if (queryError) { setError(queryError.message); return; }
    const nextCases = (data ?? []) as CaseRecord[];
    setCases(nextCases);
    const nextId = preferredId && nextCases.some((item) => item.id === preferredId)
      ? preferredId
      : selectedCaseId && nextCases.some((item) => item.id === selectedCaseId)
        ? selectedCaseId
        : nextCases[0]?.id ?? "";
    setSelectedCaseId(nextId);
  }, [supabase, selectedCaseId]);

  const refreshCaseDetails = useCallback(async (caseId: string) => {
    if (!supabase || !caseId) { setAssets([]); setObservations([]); return; }
    const [assetResult, observationResult] = await Promise.all([
      supabase.from("clinical_assets").select("id,modality,original_filename,byte_size,status,uploaded_at").eq("case_id", caseId).order("uploaded_at", { ascending: false }),
      supabase.from("clinical_observations").select("id,category,observation_code,finding,observed_on,status").eq("case_id", caseId).order("observed_on", { ascending: false }),
    ]);
    if (assetResult.error) setError(assetResult.error.message);
    else setAssets((assetResult.data ?? []) as AssetRecord[]);
    if (observationResult.error) setError(observationResult.error.message);
    else setObservations((observationResult.data ?? []) as ObservationRecord[]);
  }, [supabase]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setError("Supabase is not configured. Add the public project URL and publishable key to the deployment environment."); return; }
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !data.user) { setError("Sign in with your authorized account to access case intake."); return; }
      setUserId(data.user.id);
      await refreshCases();
    }
    void load();
    return () => { active = false; };
  }, [supabase, refreshCases]);

  useEffect(() => { void refreshCaseDetails(selectedCaseId); }, [selectedCaseId, refreshCaseDetails]);

  async function createCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice("");
    if (!supabase || !userId) { setError("Your authenticated session is not ready. Refresh and sign in again."); return; }
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(caseCode.trim())) {
      setError("Use a pseudonymous case code of 3–64 letters, numbers, underscores or hyphens. Do not use a patient's name or national ID."); return;
    }
    if (!county) { setError("Select the county associated with this case."); return; }
    if (!consentConfirmed) { setError("Confirm that the required consent or approved ethics waiver is documented and direct identifiers have been excluded."); return; }
    setBusy(true);
    const { data, error: insertError } = await supabase.from("clinical_cases").insert({
      owner_id: userId,
      case_code: caseCode.trim(),
      county,
      age_band: ageBand === "unknown" ? null : ageBand,
      purpose,
      consent_status: consentBasis,
      consent_version: "jinox-intake-v1",
    }).select("id").single();
    setBusy(false);
    if (insertError) { setError(insertError.message.includes("duplicate") ? "That case code already exists in your workspace." : insertError.message); return; }
    setCaseCode(""); setConsentConfirmed(false);
    await refreshCases(data.id);
    setNotice("Case created. Uploads will remain private and pending review.");
  }

  async function uploadFiles(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice("");
    if (!supabase || !userId || !selectedCaseId) { setError("Create or select a case before uploading files."); return; }
    if (!uploadConsentConfirmed) { setError("Confirm that this upload is covered by the case consent or approved ethics waiver and contains no direct identifiers."); return; }
    const uploadCase = cases.find((item) => item.id === selectedCaseId);
    if (!uploadCase || !["obtained", "ethics_waiver"].includes(uploadCase.consent_status)) { setError("Uploads require a case with documented consent or an approved ethics waiver."); return; }
    if (!files.length) { setError("Choose at least one file."); return; }
    const uploadCase = cases.find((item) => item.id === selectedCaseId);
    if (!uploadCase) { setError("Selected case could not be found. Refresh and try again."); return; }
    const structuredChecksums = new Map<File, string>();
    for (const file of files) {
      const validationError = validateUpload(file, modality);
      if (validationError) { setError(`${file.name}: ${validationError}`); return; }
      const structuredError = await validateStructuredFile(file, modality, [uploadCase.case_code]);
      if (structuredError) { setError(`${file.name}: ${structuredError}`); return; }
      if (modality === "clinical_record" || modality === "environmental_dataset") {
        const checksum = await sha256(file);
        const { data: duplicate, error: duplicateError } = await supabase.from("clinical_assets")
          .select("id").eq("case_id", selectedCaseId).eq("checksum_sha256", checksum).maybeSingle();
        if (duplicateError) { setError(duplicateError.message); return; }
        if (duplicate) { setError(`${file.name}: this exact structured file has already been uploaded to this case.`); return; }
        structuredChecksums.set(file, checksum);
      }
    }
    setBusy(true);
    let succeeded = 0;
    let importedClinicalRows = 0;
    const failures: string[] = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      setUploadProgress(`Uploading ${index + 1} of ${files.length}: ${file.name}`);
      const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
      const generatedName = `${modality}-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}${extension}`;
      const storagePath = `${userId}/${selectedCaseId}/${crypto.randomUUID()}-${generatedName}`;
      const { error: storageError } = await supabase.storage.from("jinox-clinical-assets").upload(storagePath, file, {
        contentType: expectedMimeType(file),
        cacheControl: "3600",
        upsert: false,
      });
      if (storageError) { failures.push(`${file.name}: ${storageError.message}`); continue; }
      const { data: asset, error: metadataError } = await supabase.from("clinical_assets").insert({
        case_id: selectedCaseId,
        owner_id: userId,
        modality,
        original_filename: generatedName,
        content_type: expectedMimeType(file),
        byte_size: file.size,
        storage_path: storagePath,
        checksum_sha256: structuredChecksums.get(file) ?? null,
        metadata: { filename_redacted: true, client_extension: extension },
        status: "pending_review",
      }).select("id").single();
      if (metadataError || !asset) {
        await supabase.storage.from("jinox-clinical-assets").remove([storagePath]);
        failures.push(`${file.name}: file metadata could not be saved (${metadataError?.message ?? "missing asset record"}).`);
      } else {
        succeeded += 1;
        if (modality === "clinical_record") {
          const parsed = await readStructuredFile(file, modality);
          if (parsed.error) {
            failures.push(`${file.name}: source file is stored, but records were not imported (${parsed.error})`);
          } else {
            const observationsToInsert = parsed.records.map((record, rowIndex) => ({
              case_id: selectedCaseId,
              owner_id: userId,
              category: String(record.category),
              observation_code: String(record.observation_code).trim(),
              finding: String(record.finding).trim(),
              value_numeric: record.value_numeric === undefined || record.value_numeric === null || String(record.value_numeric).trim() === "" ? null : Number(record.value_numeric),
              unit: record.unit === undefined || record.unit === null || String(record.unit).trim() === "" ? null : String(record.unit).trim(),
              observed_on: String(record.observed_on),
              source: record.source ? String(record.source) : "imported_record",
              status: "unreviewed",
              source_asset_id: asset.id,
              source_row_number: rowIndex + 1,
            }));
            const { error: importError } = await supabase.from("clinical_observations").insert(observationsToInsert);
            if (importError) failures.push(`${file.name}: source file is stored, but database row import failed (${importError.message})`);
            else importedClinicalRows += observationsToInsert.length;
          }
        }
      }
    }
    setBusy(false); setUploadProgress(""); setFiles([]); setUploadConsentConfirmed(false);
    await refreshCaseDetails(selectedCaseId);
    if (failures.length) setError(`${succeeded} file(s) stored. ${importedClinicalRows} clinical record row(s) imported. ${failures.join(" | ")}`);
    else setNotice(`${succeeded} file(s) stored and queued for review; ${importedClinicalRows} clinical record row(s) imported. Environmental CSV/JSON is retained as a source file; enter individual measurements in Environmental Data. No AI analysis was run.`);
  }

  async function addObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (!supabase || !userId || !selectedCaseId) { setError("Select a case first."); return; }
    if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]{1,79}$/.test(observationCode.trim())) { setError("Observation code must be 2–80 letters, numbers or . _ : - characters."); return; }
    if (!finding.trim() || finding.trim().length > 3000) { setError("Enter a finding between 1 and 3,000 characters."); return; }
    setBusy(true);
    const { error: insertError } = await supabase.from("clinical_observations").insert({
      case_id: selectedCaseId,
      owner_id: userId,
      category,
      observation_code: observationCode.trim(),
      finding: finding.trim(),
      observed_on: observedOn,
      source: "clinician_entered",
      status: "unreviewed",
    });
    setBusy(false);
    if (insertError) { setError(insertError.message); return; }
    setFinding("");
    await refreshCaseDetails(selectedCaseId);
    setNotice("Observation saved as unreviewed. It is a recorded finding, not an AI-generated diagnosis.");
  }

  const selectedCase = cases.find((item) => item.id === selectedCaseId);
  const currentUploadType = uploadTypes[modality];

  return (
    <main className="min-h-screen bg-[#f7f7f7] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <Link href="/clinical" className="text-sm font-semibold text-slate-500 hover:text-black">← Clinical workspace</Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Multimodal data intake</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Create a pseudonymous case, upload source files to private storage, and record structured clinical observations.</p>
          </div>
          <Link href="/research" className={secondary}>Research workspace</Link>
        </header>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>Research prototype safety rule.</strong> Upload only data you are authorized to use. Exclude names, national IDs, contact details and identifiers embedded in images or filenames. Files remain private and pending review. This workflow does not perform diagnosis, server-side content sniffing, malware scanning, image/DICOM pixel de-identification or model inference. CSV/JSON checks run in the browser and are not a security boundary.
        </div>
        {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {notice && <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</div>}

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className={panel}>
            <h2 className="text-lg font-semibold">1. Create a case</h2>
            <p className="mt-1 text-sm text-slate-500">Use a study code, not a patient name or hospital number.</p>
            <form className="mt-4 space-y-4" onSubmit={createCase}>
              <label className="block text-sm font-medium">Pseudonymous case code
                <input className={field} value={caseCode} onChange={(event) => setCaseCode(event.target.value)} required minLength={3} maxLength={64} pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,63}" placeholder="e.g. KEN-ORAL-0001" autoComplete="off" />
              </label>
              <label className="block text-sm font-medium">County
                <select className={field} value={county} onChange={(event) => setCounty(event.target.value)} required>
                  <option value="">Select county</option>{counties.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Age band (optional)
                <select className={field} value={ageBand} onChange={(event) => setAgeBand(event.target.value)}>
                  <option value="unknown">Not recorded</option><option value="0_5">0–5</option><option value="6_12">6–12</option><option value="13_17">13–17</option><option value="18_29">18–29</option><option value="30_44">30–44</option><option value="45_59">45–59</option><option value="60_plus">60+</option>
                </select>
              </label>
              <label className="block text-sm font-medium">Intended use
                <select className={field} value={purpose} onChange={(event) => setPurpose(event.target.value)}>
                  <option value="research">Research</option><option value="clinical_review">Clinician review</option><option value="quality_improvement">Quality improvement</option>
                </select>
              </label>
              <label className="block text-sm font-medium">Documented consent basis
                <select className={field} value={consentBasis} onChange={(event) => setConsentBasis(event.target.value as "obtained" | "ethics_waiver")}>
                  <option value="obtained">Informed consent obtained</option><option value="ethics_waiver">Approved ethics waiver</option>
                </select>
              </label>
              <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-700">
                <input type="checkbox" checked={consentConfirmed} onChange={(event) => setConsentConfirmed(event.target.checked)} className="mt-1 size-4 accent-black" />
                <span>I confirm the required informed consent or approved ethics waiver is documented, the intended use is permitted, and direct identifiers have been excluded.</span>
              </label>
              <button className={button} type="submit" disabled={busy}>Create case</button>
            </form>
          </section>

          <section className={panel}>
            <h2 className="text-lg font-semibold">2. Upload source files</h2>
            <p className="mt-1 text-sm text-slate-500">Each file is checked against modality-specific extension and size rules before upload.</p>
            <div className="mt-4">
              <label className="block text-sm font-medium">Target case
                <select className={field} value={selectedCaseId} onChange={(event) => setSelectedCaseId(event.target.value)} required>
                  <option value="">Select a case</option>{cases.map((item) => <option key={item.id} value={item.id}>{item.case_code} · {item.county}</option>)}
                </select>
              </label>
            </div>
            <form className="mt-4 space-y-4" onSubmit={uploadFiles}>
              <label className="block text-sm font-medium">File type
                <select className={field} value={modality} onChange={(event) => { setModality(event.target.value as UploadModality); setFiles([]); }}>
                  {Object.entries(uploadTypes).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                </select>
              </label>
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <label className="block text-sm font-medium">Select files
                  <input className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" type="file" multiple accept={currentUploadType.accept} onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
                </label>
                <p className="mt-2 text-xs leading-5 text-slate-500">Accepted: {currentUploadType.accept.replaceAll(",", ", ")} · Maximum {Math.round(currentUploadType.maxBytes / (1024 * 1024))} MB per file.</p>
                {files.length > 0 && <ul className="mt-3 space-y-1 text-xs text-slate-700">{files.map((file) => <li key={file.name + file.size} className="flex justify-between gap-3"><span className="break-all">{file.name}</span><span className="shrink-0">{humanSize(file.size)}</span></li>)}</ul>}
              </div>
              <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-700">
                <input type="checkbox" checked={uploadConsentConfirmed} onChange={(event) => setUploadConsentConfirmed(event.target.checked)} className="mt-1 size-4 accent-black" />
                <span>I confirm these files are covered by the selected case’s documented consent or ethics waiver, and contain no direct identifiers in the file content or metadata.</span>
              </label>
              <button className={button} type="submit" disabled={busy || !selectedCaseId || !files.length}>{busy ? "Working…" : "Upload and register files"}</button>
              {uploadProgress && <p role="status" className="text-sm text-slate-600">{uploadProgress}</p>}
            </form>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold">Strict record templates</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a className={secondary} href="/templates/clinical-record-template.csv" download>Clinical CSV template</a>
                <a className={secondary} href="/templates/environmental-data-template.csv" download>Environmental CSV template</a>
              </div>
              <p className="mt-2 text-xs text-slate-500">Clinical-record CSV/JSON rows are schema-checked and imported as unreviewed observations. Environmental CSV/JSON rows are validated and stored as source files; use the Environmental Data workspace to enter measurements. Validation currently runs in the browser.</p>
            </div>
          </section>
        </div>

        <section className={`${panel} mt-5`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-semibold">3. Structured clinical observation</h2><p className="mt-1 text-sm text-slate-500">Record a clinician-entered finding using required fields and a controlled category.</p></div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">{selectedCase ? selectedCase.case_code : "No case selected"}</span>
          </div>
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={addObservation}>
            <label className="block text-sm font-medium">Category
              <select className={field} value={category} onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}>{categories.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
            </label>
            <label className="block text-sm font-medium">Observation code
              <input className={field} value={observationCode} onChange={(event) => setObservationCode(event.target.value)} required maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9_.:-]{1,79}" placeholder="e.g. periodontal_status" />
            </label>
            <label className="block text-sm font-medium">Date observed
              <input className={field} type="date" value={observedOn} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setObservedOn(event.target.value)} required />
            </label>
            <label className="block text-sm font-medium md:col-span-2">Finding
              <textarea className={field} rows={3} value={finding} onChange={(event) => setFinding(event.target.value)} required maxLength={3000} placeholder="Enter the observed finding, method or relevant clinical context. Do not include direct identifiers." />
            </label>
            <div className="md:col-span-2"><button className={button} type="submit" disabled={busy || !selectedCaseId}>{busy ? "Saving…" : "Save unreviewed observation"}</button></div>
          </form>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className={panel}>
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Registered files</h2><span className="text-sm text-slate-500">{assets.length}</span></div>
            {assets.length ? <ul className="mt-4 divide-y divide-slate-100">{assets.map((asset) => <li key={asset.id} className="flex items-start justify-between gap-3 py-3"><div className="min-w-0"><p className="break-all text-sm font-medium">{asset.original_filename}</p><p className="mt-1 text-xs text-slate-500">{label(asset.modality)} · {humanSize(asset.byte_size)}</p></div><span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">{label(asset.status)}</span></li>)}</ul> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No files registered for this case yet.</p>}
          </section>
          <section className={panel}>
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Clinical observations</h2><span className="text-sm text-slate-500">{observations.length}</span></div>
            {observations.length ? <ul className="mt-4 divide-y divide-slate-100">{observations.map((observation) => <li key={observation.id} className="py-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{label(observation.category)} · {observation.observation_code}</p><span className="text-xs text-slate-500">{observation.observed_on}</span></div><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{observation.finding}</p><p className="mt-1 text-xs text-slate-500">Status: {label(observation.status)} · clinician-entered</p></li>)}</ul> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No structured observations recorded yet.</p>}
          </section>
        </div>

        <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500">
          <span>JinoX AI · Secure data intake prototype</span>
          <span>{cases.length} case(s) in this account</span>
        </footer>
      </div>
    </main>
  );
}
