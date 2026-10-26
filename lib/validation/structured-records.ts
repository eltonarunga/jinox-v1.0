import type { UploadModality } from "@/lib/validation/uploads";

export type StructuredRow = Record<string, unknown>;
type ReadResult = { records: StructuredRow[]; error: string | null };

const clinicalCategories = new Set(["dental_caries","periodontal","oral_mucosa","fluorosis","pain","occlusion","other"]);
const waterSources = new Set(["borehole","well","piped","surface_water","bottled","other","unknown"]);
const clinicalSources = new Set(["clinician_entered","imported_record","research_annotation"]);

function parseCsv(text: string): { headers: string[]; rows: string[][] } | string {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && cell.length === 0) quoted = true;
    else if (char === ",") { row.push(cell.trim()); cell = ""; }
    else if (char === "\n") { row.push(cell.trim().replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (quoted) return "CSV contains an unclosed quoted field.";
  if (cell.length || row.length) { row.push(cell.trim().replace(/\r$/, "")); rows.push(row); }
  const nonEmpty = rows.filter((line) => line.some((value) => value.trim().length));
  if (nonEmpty.length < 2) return "CSV must include a header row and at least one data row.";
  const headers = nonEmpty[0].map((value) => value.trim());
  if (headers.some((value) => !value) || new Set(headers).size !== headers.length) return "CSV headers must be non-empty and unique.";
  if (nonEmpty.slice(1).some((values) => values.length > headers.length)) return "A CSV data row has more columns than the header row.";
  return { headers, rows: nonEmpty.slice(1).map((values) => {
    const padded = [...values];
    while (padded.length < headers.length) padded.push("");
    return padded;
  }) };
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function numericInRange(value: string, min: number, max: number): boolean {
  if (!value) return true;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}
const str = (row: StructuredRow, key: string) => String(row[key] ?? "").trim();

export async function readStructuredFile(file: File, modality: UploadModality): Promise<ReadResult> {
  if (modality !== "clinical_record" && modality !== "environmental_dataset") return { records: [], error: null };
  const text = (await file.text()).replace(/^\uFEFF/, "");
  if (!text.trim()) return { records: [], error: "Structured data file is empty." };
  if (file.name.toLowerCase().endsWith(".json")) {
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { return { records: [], error: "JSON is invalid. Check quotes, commas and brackets." }; }
    const records = Array.isArray(parsed) ? parsed : [parsed];
    if (!records.length) return { records: [], error: "JSON must contain at least one record." };
    if (!records.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
      return { records: [], error: "JSON must contain an object or an array of objects." };
    }
    return { records: records as StructuredRow[], error: null };
  }
  const parsed = parseCsv(text);
  if (typeof parsed === "string") return { records: [], error: parsed };
  return {
    records: parsed.rows.map((values) => Object.fromEntries(parsed.headers.map((header, index) => [header, values[index] ?? ""]))),
    error: null,
  };
}

export function validateStructuredRecords(
  rows: StructuredRow[],
  modality: UploadModality,
  knownCaseCodes: string[],
): string | null {
  if (modality !== "clinical_record" && modality !== "environmental_dataset") return null;
  const required = modality === "clinical_record"
    ? ["case_code","observed_on","category","observation_code","finding"]
    : ["sample_site_code","county","water_source","sampled_on","source_name"];
  const allowed = modality === "clinical_record"
    ? new Set([...required,"value_numeric","unit","source"])
    : new Set([...required,"sub_county","fluoride_mg_l","temperature_c","rainfall_mm","notes"]);
  const keys = new Set(rows.flatMap((row) => Object.keys(row)));
  const missing = required.filter((key) => !keys.has(key));
  if (missing.length) return `Required column/property missing: ${missing.join(", ")}.`;
  const unexpected = [...keys].filter((key) => !allowed.has(key));
  if (unexpected.length) return `Unsupported column/property: ${unexpected.join(", ")}. Use the supplied template exactly.`;
  const caseCodes = new Set(knownCaseCodes);
  for (let index = 0; index < rows.length; index += 1) {
    const record = rows[index];
    const rowLabel = `Record ${index + 1}`;
    if (modality === "clinical_record") {
      if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(str(record, "case_code"))) return `${rowLabel}: invalid pseudonymous case_code.`;
      if (!caseCodes.has(str(record, "case_code"))) return `${rowLabel}: case_code "${str(record, "case_code")}" does not exist in the selected case scope.`;
      if (!validDate(str(record, "observed_on"))) return `${rowLabel}: observed_on must be a real date in YYYY-MM-DD format.`;
      if (!clinicalCategories.has(str(record, "category"))) return `${rowLabel}: category is not supported.`;
      if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]{1,79}$/.test(str(record, "observation_code"))) return `${rowLabel}: observation_code must be 2–80 valid characters.`;
      if (!str(record, "finding") || str(record, "finding").length > 3000) return `${rowLabel}: finding is required and limited to 3,000 characters.`;
      if (!numericInRange(str(record, "value_numeric"), -1e12, 1e12)) return `${rowLabel}: value_numeric must be a valid number.`;
      if (str(record, "unit").length > 40) return `${rowLabel}: unit exceeds 40 characters.`;
      if (str(record, "source") && !clinicalSources.has(str(record, "source"))) return `${rowLabel}: source is not supported.`;
    } else {
      if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,79}$/.test(str(record, "sample_site_code"))) return `${rowLabel}: invalid sample_site_code.`;
      if (str(record, "county").length < 2 || str(record, "county").length > 100) return `${rowLabel}: county is required and limited to 100 characters.`;
      if (str(record, "sub_county").length > 100) return `${rowLabel}: sub_county exceeds 100 characters.`;
      if (!waterSources.has(str(record, "water_source"))) return `${rowLabel}: water_source is not supported.`;
      if (!validDate(str(record, "sampled_on"))) return `${rowLabel}: sampled_on must be a real date in YYYY-MM-DD format.`;
      if (!str(record, "source_name") || str(record, "source_name").length > 200) return `${rowLabel}: source_name is required and limited to 200 characters.`;
      if (!numericInRange(str(record, "fluoride_mg_l"), 0, 100)) return `${rowLabel}: fluoride_mg_l must be between 0 and 100.`;
      if (!numericInRange(str(record, "temperature_c"), -20, 70)) return `${rowLabel}: temperature_c must be between -20 and 70.`;
      if (!numericInRange(str(record, "rainfall_mm"), 0, 10000)) return `${rowLabel}: rainfall_mm must be between 0 and 10,000.`;
      if (str(record, "notes").length > 2000) return `${rowLabel}: notes exceeds 2,000 characters.`;
    }
  }
  return null;
}

export async function validateStructuredFile(
  file: File,
  modality: UploadModality,
  knownCaseCodes: string[],
): Promise<string | null> {
  const result = await readStructuredFile(file, modality);
  if (result.error) return result.error;
  return validateStructuredRecords(result.records, modality, knownCaseCodes);
}
