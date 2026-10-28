import { NextRequest, NextResponse } from "next/server";
import { getResearchContext, isResearchContext, jsonError } from "@/lib/research-auth";
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = parseCreateResearchProjectInput(body);
  if (!parsed.success) return jsonError(parsed.error, 400);

  const input = parsed.data;
  const { data, error } = await context.supabase
    .from("research_projects")
    .insert({
      name: input.name,
      description: input.description,
      research_area: input.researchArea,
      owner_id: context.userId,
    })
    .select(PROJECT_FIELDS)
    .single();

  if (error) return jsonError("Could not create research project.", 400);

  // Keep the existing audit behavior unchanged in this refactor.
  // Atomic write + audit should be handled separately with a transactional DB function/outbox.
  await context.supabase.from("research_audit_logs").insert({
    project_id: data.id,
    actor_id: context.userId,
    action: "project.created",
    resource_type: "research_project",
    resource_id: data.id,
    details: { research_area: input.researchArea },
  });

  return NextResponse.json(
    { data },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
