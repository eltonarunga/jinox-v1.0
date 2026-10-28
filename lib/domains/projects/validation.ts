/**
 * Pure validation for research-project metadata.
 * Keep HTTP and database concerns outside this module so the rules are easy to test.
 */
export const RESEARCH_AREAS = [
  "oral_health",
  "environmental_health",
  "genomics",
  "imaging",
  "digital_twin",
  "multimodal",
  "other",
] as const;

export type ResearchArea = (typeof RESEARCH_AREAS)[number];

export type CreateResearchProjectInput = {
  name: string;
  description: string;
  researchArea: ResearchArea;
};

export type ProjectValidationResult =
  | { success: true; data: CreateResearchProjectInput }
  | { success: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validate untrusted JSON at the application boundary. */
export function parseCreateResearchProjectInput(value: unknown): ProjectValidationResult {
  if (!isRecord(value)) {
    return { success: false, error: "Expected a JSON object." };
  }

  const name = typeof value.name === "string" ? value.name.trim() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";
  const researchArea = value.research_area === undefined ? "oral_health" : value.research_area;

  if (name.length < 3 || name.length > 160) {
    return { success: false, error: "name must contain 3–160 characters." };
  }
  if (description.length > 5000) {
    return { success: false, error: "description must be at most 5000 characters." };
  }
  if (typeof researchArea !== "string" || !(RESEARCH_AREAS as readonly string[]).includes(researchArea)) {
    return { success: false, error: "Unsupported research_area." };
  }

  return {
    success: true,
    data: {
      name,
      description,
      researchArea: researchArea as ResearchArea,
    },
  };
}
