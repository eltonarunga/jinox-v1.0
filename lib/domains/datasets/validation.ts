/**
 * Pure validation for dataset metadata. Keep this independent of Next.js and
 * Supabase so the same rules can be reused by API routes, jobs and tests.
 */
export const DATASET_MODALITIES = [
  "panoramic_xray",
  "periapical_xray",
  "bitewing_xray",
  "cbct",
  "intraoral_photo",
  "clinical_text",
  "genomic",
  "environmental",
  "other",
] as const;

export const DATASET_SOURCE_TYPES = [
  "research_collection",
  "public_dataset",
  "synthetic",
  "retrospective",
  "other",
] as const;

export const DATASET_CONSENT_BASES = [
  "informed_consent",
  "ethics_waiver",
  "public_licensed",
  "synthetic_data",
  "pending_review",
] as const;

export type DatasetModality = (typeof DATASET_MODALITIES)[number];
export type DatasetSourceType = (typeof DATASET_SOURCE_TYPES)[number];
export type DatasetConsentBasis = (typeof DATASET_CONSENT_BASES)[number];

export type RegisterDatasetInput = {
  projectId: string;
  name: string;
  description: string;
  modality: DatasetModality;
  sourceType: DatasetSourceType;
  consentBasis: DatasetConsentBasis;
  license: string | null;
  recordCount: number | null;
};

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function oneOf<const T extends readonly string[]>(
  value: unknown,
  allowed: T
): value is T[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

/** Validate untrusted JSON at the application boundary. */
export function parseRegisterDatasetInput(
  value: unknown
): ValidationResult<RegisterDatasetInput> {
  if (!isRecord(value)) {
    return { success: false, error: "Expected a JSON object." };
  }

  const projectId = typeof value.project_id === "string" ? value.project_id.trim() : "";
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";
  const modality = value.modality;
  const sourceType = value.source_type === undefined ? "research_collection" : value.source_type;
  const consentBasis = value.consent_basis === undefined ? "pending_review" : value.consent_basis;
  const license = typeof value.license === "string" ? value.license.trim() || null : null;
  const recordCount = value.record_count === undefined || value.record_count === null
    ? null
    : value.record_count;

  if (!projectId) return { success: false, error: "project_id is required." };
  if (name.length < 2 || name.length > 160) {
    return { success: false, error: "name must contain 2–160 characters." };
  }
  if (description.length > 5000) {
    return { success: false, error: "description must be at most 5000 characters." };
  }
  if (!oneOf(modality, DATASET_MODALITIES)) {
    return { success: false, error: "Unsupported modality." };
  }
  if (!oneOf(sourceType, DATASET_SOURCE_TYPES)) {
    return { success: false, error: "Unsupported source_type." };
  }
  if (!oneOf(consentBasis, DATASET_CONSENT_BASES)) {
    return { success: false, error: "Unsupported consent_basis." };
  }
  if (license !== null && license.length > 300) {
    return { success: false, error: "license must be at most 300 characters." };
  }
  if (recordCount !== null && (
    typeof recordCount !== "number" ||
    !Number.isSafeInteger(recordCount) ||
    recordCount < 0
  )) {
    return { success: false, error: "record_count must be a non-negative safe integer." };
  }

  return {
    success: true,
    data: {
      projectId,
      name,
      description,
      modality,
      sourceType,
      consentBasis,
      license,
      recordCount,
    },
  };
}
