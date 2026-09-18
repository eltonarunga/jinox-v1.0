import { NextRequest, NextResponse } from "next/server";
import { getAllCountyNames, getCounty, whoGuidelinePpm, severeEndemicThresholdPpm } from "@/lib/data";
import { fetchCountyFluorideFromDb } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const rawCounty = req.nextUrl.searchParams.get("county");

    if (!rawCounty || typeof rawCounty !== "string" || rawCounty.trim().length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Query parameter 'county' is required.",
            available_counties: getAllCountyNames(),
          },
        },
        { status: 400 }
      );
    }

    const countyQuery = rawCounty.trim();

    // Attempt live Supabase read first
    const dbRecord = await fetchCountyFluorideFromDb(countyQuery);

    // Fallback to local dataset if Supabase is unconfigured or record not found
    const localRecord = getCounty(countyQuery);

    if (!dbRecord && !localRecord) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: `No fluoride surveillance reading on file for county "${countyQuery}"`,
            available_counties: getAllCountyNames(),
          },
        },
        { status: 404 }
      );
    }

    const countyName = dbRecord?.county || localRecord!.name;
    const fluoridePpm = dbRecord?.ppm ?? localRecord!.ppm;
    const riskTier = dbRecord?.tier || localRecord!.level;
    const source = dbRecord?.source || localRecord!.source || "WRMA water quality survey";
    const isLive = Boolean(dbRecord);

    const isExceedingWho = fluoridePpm > whoGuidelinePpm;
    const isSevereEndemic = fluoridePpm >= severeEndemicThresholdPpm;

    return NextResponse.json(
      {
        county: countyName,
        fluoride_ppm: fluoridePpm,
        who_guideline_ppm: whoGuidelinePpm,
        exceeds_who_threshold: isExceedingWho,
        is_severe_endemic_zone: isSevereEndemic,
        ratio_to_who_limit: Number((fluoridePpm / whoGuidelinePpm).toFixed(2)),
        risk_tier: riskTier,
        surveillance_source: source,
        data_source: isLive ? "supabase" : "seeded-mock",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "X-Data-Source": isLive ? "supabase" : "seeded-mock",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while resolving fluoride telemetry.",
        },
      },
      { status: 500 }
    );
  }
}
