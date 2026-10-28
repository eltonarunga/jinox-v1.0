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
  if (error) {
    return jsonError("Could not load dataset metadata.", 500);
  }

  return NextResponse.json(
    { data },
    { headers: { "Cache-Control": "no-store" } }
  );
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

  // Metadata-only registration. Source files must enter through the separately
  // authorized private-storage intake workflow.
  const { data, error } = await context.supabase
    .from("research_datasets")
    .insert({
      project_id: input.projectId,
      name: input.name,
      description: input.description,
      modality: input.modality,
      source_type: input.sourceType,
      consent_basis: input.consentBasis,
      license: input.license,
      record_count: input.recordCount,
      created_by: context.userId,
      status: "metadata_only",
    })
    .select(DATASET_FIELDS)
    .single();

  if (error) {
    // Avoid returning raw database errors, which can leak schema details.
    return jsonError(
      "Could not register dataset metadata. Check project permissions and field values.",
      400
    );
  }

  // Audit failure must not turn a successful registration into an ambiguous
  // client retry. Production hardening should move this to a transactional DB
  // function/outbox so the write and audit event commit atomically.
  await context.supabase.from("research_audit_logs").insert({
    project_id: input.projectId,
    actor_id: context.userId,
    action: "dataset.registered",
    resource_type: "research_dataset",
    resource_id: data.id,
    details: {
      modality: input.modality,
      source_type: input.sourceType,
      consent_basis: input.consentBasis,
    },
  });

  return NextResponse.json(
    { data },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}
