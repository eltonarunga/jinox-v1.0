import { NextRequest, NextResponse } from "next/server";
import { getResearchContext, isResearchContext, jsonError } from "@/lib/research-auth";
import { parseRegisterDatasetInput } from "@/lib/domains/datasets/validation";

const DATASET_FIELDS =
  "id,project_id,name,description,modality,source_type,consent_basis,license,record_count,status,created_by,created_at,updated_at";

export async function GET(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;

  const projectId = request.nextUrl.searchParams.get("project_id");
  let query = context.supabase
    .from("research_datasets")
    .select(DATASET_FIELDS)
    .order("created_at", { ascending: false });

  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) return jsonError("Could not load dataset metadata.", 500);

  return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = parseRegisterDatasetInput(body);
  if (!parsed.success) return jsonError(parsed.error, 400);

  const input = parsed.data;
  const { data, error } = await context.supabase.rpc("register_research_dataset_with_audit", {
    p_project_id: input.projectId,
    p_name: input.name,
    p_description: input.description,
    p_modality: input.modality,
    p_source_type: input.sourceType,
    p_consent_basis: input.consentBasis,
    p_license: input.license,
    p_record_count: input.recordCount,
  });

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return jsonError("Could not register dataset metadata. Check project permissions and field values.", 400);
  }

  return NextResponse.json(
    { data },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
