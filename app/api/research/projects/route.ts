import { NextRequest, NextResponse } from 'next/server';
import { getResearchContext, isResearchContext, jsonError } from '@/lib/research-auth';

const AREAS = new Set(['oral_health','environmental_health','genomics','imaging','digital_twin','multimodal','other']);

export async function GET(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;

  const { data, error } = await context.supabase
    .from('research_projects')
    .select('id,name,description,research_area,status,owner_id,created_at,updated_at')
    .order('created_at', { ascending: false });
  if (error) return jsonError('Could not load research projects.', 500);
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError('Request body must be valid JSON.', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError('Expected a JSON object.', 400);
  const input = body as Record<string, unknown>;
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const researchArea = typeof input.research_area === 'string' ? input.research_area : 'oral_health';
  if (name.length < 3 || name.length > 160) return jsonError('name must contain 3–160 characters.', 400);
  if (description.length > 5000) return jsonError('description must be at most 5000 characters.', 400);
  if (!AREAS.has(researchArea)) return jsonError('Unsupported research_area.', 400);

  const { data, error } = await context.supabase
    .from('research_projects')
    .insert({ name, description, research_area: researchArea, owner_id: context.userId })
    .select('id,name,description,research_area,status,owner_id,created_at,updated_at')
    .single();
  if (error) return jsonError('Could not create research project.', 400);

  await context.supabase.from('research_audit_logs').insert({
    project_id: data.id, actor_id: context.userId, action: 'project.created',
    resource_type: 'research_project', resource_id: data.id, details: { research_area: researchArea },
  });
  return NextResponse.json({ data }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
