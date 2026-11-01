import { NextRequest, NextResponse } from 'next/server';
import { getResearchContext, isResearchContext, jsonError } from '@/lib/research-auth';
import { readJsonBody } from "@/lib/api/read-json";

const STATUSES = new Set(['pending','granted','withdrawn','not_required']);
const LANGUAGES = new Set(['en','sw','other']);

export async function GET(request: NextRequest) {
  const context = await getResearchContext(request);
  if (!isResearchContext(context)) return context;
  const projectId = request.nextUrl.searchParams.get('project_id');
  if (!projectId) return jsonError('project_id is required.', 400);
  const { data, error } = await context.supabase.from('research_consents')
    .select('id,project_id,participant_code,consent_status,consent_version,language,consented_at,withdrawn_at,created_by,created_at,updated_at')
    .eq('project_id', projectId).order('created_at', { ascending: false });
  if (error) return jsonError('Could not load consent metadata. Access is limited to project owners and principal investigators.', 403);
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
  const participantCode = typeof input.participant_code === 'string' ? input.participant_code.trim() : '';
  const consentVersion = typeof input.consent_version === 'string' ? input.consent_version.trim() : '';
  const status = typeof input.consent_status === 'string' ? input.consent_status : 'pending';
  const language = typeof input.language === 'string' ? input.language : 'en';
  if (!projectId) return jsonError('project_id is required.', 400);
  if (!/^[A-Za-z0-9_-]{3,80}$/.test(participantCode)) return jsonError('participant_code must be a pseudonymous code of 3–80 letters, numbers, underscores, or hyphens.', 400);
  if (!consentVersion || consentVersion.length > 80) return jsonError('consent_version is required and must be at most 80 characters.', 400);
  if (!STATUSES.has(status)) return jsonError('Unsupported consent_status.', 400);
  if (!LANGUAGES.has(language)) return jsonError('Unsupported language.', 400);
  if (status === 'granted' && typeof input.consented_at !== 'string') return jsonError('consented_at is required when consent_status is granted.', 400);
  const consentedAt = typeof input.consented_at === 'string' ? input.consented_at : null;
  const withdrawnAt = status === 'withdrawn' ? new Date().toISOString() : null;
  const { data, error } = await context.supabase.rpc('record_research_consent_with_audit', {
    p_project_id: projectId,
    p_participant_code: participantCode,
    p_consent_status: status,
    p_consent_version: consentVersion,
    p_language: language,
    p_consented_at: consentedAt,
    p_withdrawn_at: withdrawnAt,
  });
  if (error || !data || typeof data !== 'object' || Array.isArray(data)) {
    return jsonError('Could not save consent metadata. Access is limited to project owners and principal investigators.', 403);
  }
  return NextResponse.json({ data }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
