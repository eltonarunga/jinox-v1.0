import { NextRequest, NextResponse } from "next/server";
import { whoGuidelinePpm, severeEndemicThresholdPpm } from "@/lib/data";
import { fetchCountyFluorideFromDb, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rawCounty = req.nextUrl.searchParams.get("county");
  if (!rawCounty || rawCounty.trim().length === 0) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Query parameter 'county' is required." } },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: { code: "DATA_SOURCE_NOT_CONFIGURED", message: "County fluoride surveillance data is not configured for this deployment." } },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const dbRecord = await fetchCountyFluorideFromDb(rawCounty.trim());
    if (!dbRecord) {
      return NextResponse.json(
        { error: { code: "SURVEILLANCE_RECORD_NOT_FOUND", message: "No source-attributed fluoride surveillance record is available for the requested county." } },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const isExceedingWho = dbRecord.ppm > whoGuidelinePpm;
    const isSevereEndemic = dbRecord.ppm >= severeEndemicThresholdPpm;

    return NextResponse.json(
      {
        county: dbRecord.county,
        fluoride_ppm: dbRecord.ppm,
        who_guideline_ppm: whoGuidelinePpm,
        exceeds_who_threshold: isExceedingWho,
        is_severe_endemic_zone: isSevereEndemic,
        ratio_to_who_limit: Number((dbRecord.ppm / whoGuidelinePpm).toFixed(2)),
        risk_tier: dbRecord.tier,
        surveillance_source: dbRecord.source,
        data_source: "supabase",
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: { "Cache-Control": "no-store", "X-Data-Source": "supabase" } }
    );
  } catch {
    return NextResponse.json(
      { error: { code: "DATA_SOURCE_ERROR", message: "County fluoride surveillance data could not be loaded." } },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
