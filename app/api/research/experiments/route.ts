import { NextRequest, NextResponse } from 'next/server';
import { getResearchContext, isResearchContext, jsonError } from '@/lib/research-auth';
import { readJsonBody } from "@/lib/api/read-json";

const STATUSES = new Set(['planned','running','completed','failed','cancelled']);

export async function GET(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;
  const projectId = request.nextUrl.searchParams.get('project_id');
  let query = context.supabase.from('research_experiments')
    .select('id,project_id,dataset_id,name,hypothesis,method,model_version,status,metrics,notes,created_by,created_at,updated_at')
    .order('created_at', { ascending: false });
  if (projectId) query = query.eq('project_id', projectId);
  const { data, error } = await query;
  if (error) return jsonError('Could not load experiment records.', 500);
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;
  const bodyResult = await readJsonBody(request);
  if (!bodyResult.success) return jsonError(bodyResult.message, bodyResult.status);
  const body = bodyResult.value;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError('Expected a JSON object.', 400);
  const input = body as Record<string, unknown>;
  const projectId = typeof input.project_id === 'string' ? input.project_id : '';
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const hypothesis = typeof input.hypothesis === 'string' ? input.hypothesis.trim() : '';
  const method = typeof input.method === 'string' ? input.method.trim() : '';
  const notes = typeof input.notes === 'string' ? input.notes.trim() : '';
  const datasetId = typeof input.dataset_id === 'string' ? input.dataset_id : null;
  const modelVersion = typeof input.model_version === 'string' ? input.model_version.trim() : null;
  const status = typeof input.status === 'string' ? input.status : 'planned';
  const metrics = input.metrics === undefined ? {} : input.metrics;

  if (!projectId) return jsonError('project_id is required.', 400);
  if (name.length < 3 || name.length > 160) return jsonError('name must contain 3–160 characters.', 400);
  if (hypothesis.length > 10000 || method.length > 10000 || notes.length > 10000) return jsonError('hypothesis, method, and notes must each be at most 10000 characters.', 400);
  if (!STATUSES.has(status)) return jsonError('Unsupported status.', 400);
  if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) return jsonError('metrics must be a JSON object.', 400);

  const { data, error } = await context.supabase.rpc('create_research_experiment_with_audit', {
    p_project_id: projectId,
    p_dataset_id: datasetId,
    p_name: name,
    p_hypothesis: hypothesis,
    p_method: method,
    p_model_version: modelVersion,
    p_status: status,
    p_metrics: metrics,
    p_notes: notes,
  });
  if (error || !data || typeof data !== 'object' || Array.isArray(data)) {
    return jsonError('Could not create experiment. Check project permissions, dataset ownership, and field values.', 400);
  }
  return NextResponse.json({ data }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
