import { NextRequest, NextResponse } from "next/server";
import { getResearchContext, isResearchContext, jsonError } from "@/lib/research-auth";
import { readJsonBody } from "@/lib/api/read-json";
import { parseCreateResearchProjectInput } from "@/lib/domains/projects/validation";

const PROJECT_FIELDS =
  "id,name,description,research_area,status,owner_id,created_at,updated_at";

export async function GET(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;

  const { data, error } = await context.supabase
    .from("research_projects")
    .select(PROJECT_FIELDS)
    .order("created_at", { ascending: false });

  if (error) return jsonError("Could not load research projects.", 500);
  return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.success) return jsonError(bodyResult.message, bodyResult.status);
  const body = bodyResult.value;

  const parsed = parseCreateResearchProjectInput(body);
  if (!parsed.success) return jsonError(parsed.error, 400);

  const input = parsed.data;
  const { data, error } = await context.supabase.rpc("create_research_project_with_audit", {
    p_name: input.name,
    p_description: input.description,
    p_research_area: input.researchArea,
  });

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return jsonError("Could not create research project. Check permissions and field values.", 400);
  }

  return NextResponse.json(
    { data },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
