import { NextRequest, NextResponse } from 'next/server';
import { getResearchContext, isResearchContext, jsonError } from '@/lib/research-auth';

const MODALITIES = new Set(['panoramic_xray','periapical_xray','bitewing_xray','cbct','intraoral_photo','clinical_text','genomic','environmental','other']);
const SOURCES = new Set(['research_collection','public_dataset','synthetic','retrospective','other']);
const CONSENT_BASES = new Set(['informed_consent','ethics_waiver','public_licensed','synthetic_data','pending_review']);

export async function GET(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;
  const projectId = request.nextUrl.searchParams.get('project_id');
  let query = context.supabase.from('research_datasets')
    .select('id,project_id,name,description,modality,source_type,consent_basis,license,record_count,status,created_by,created_at,updated_at')
    .order('created_at', { ascending: false });
  if (projectId) query = query.eq('project_id', projectId);
  const { data, error } = await query;
  if (error) return jsonError('Could not load dataset metadata.', 500);
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError('Request body must be valid JSON.', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError('Expected a JSON object.', 400);
  const input = body as Record<string, unknown>;
  const projectId = typeof input.project_id === 'string' ? input.project_id : '';
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const modality = typeof input.modality === 'string' ? input.modality : '';
  const sourceType = typeof input.source_type === 'string' ? input.source_type : 'research_collection';
  const consentBasis = typeof input.consent_basis === 'string' ? input.consent_basis : 'pending_review';
  const license = typeof input.license === 'string' ? input.license.trim() : null;
  const recordCount = input.record_count === undefined || input.record_count === null ? null : input.record_count;

  if (!projectId) return jsonError('project_id is required.', 400);
  if (name.length < 2 || name.length > 160) return jsonError('name must contain 2–160 characters.', 400);
  if (description.length > 5000) return jsonError('description must be at most 5000 characters.', 400);
  if (!MODALITIES.has(modality)) return jsonError('Unsupported modality.', 400);
  if (!SOURCES.has(sourceType)) return jsonError('Unsupported source_type.', 400);
  if (!CONSENT_BASES.has(consentBasis)) return jsonError('Unsupported consent_basis.', 400);
  if (recordCount !== null && (!Number.isInteger(recordCount) || Number(recordCount) < 0)) return jsonError('record_count must be a non-negative integer.', 400);

  // Deliberately metadata-only: this endpoint does not accept or upload patient files.
  const { data, error } = await context.supabase.from('research_datasets').insert({
    project_id: projectId, name, description, modality, source_type: sourceType,
    consent_basis: consentBasis, license, record_count: recordCount,
    created_by: context.userId, status: 'metadata_only',
  }).select('id,project_id,name,description,modality,source_type,consent_basis,license,record_count,status,created_by,created_at,updated_at').single();
  if (error) return jsonError('Could not register dataset metadata. Check project permissions and field values.', 400);

  await context.supabase.from('research_audit_logs').insert({
    project_id: projectId, actor_id: context.userId, action: 'dataset.registered',
    resource_type: 'research_dataset', resource_id: data.id, details: { modality, source_type: sourceType, consent_basis: consentBasis },
  });
  return NextResponse.json({ data }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
