import { NextRequest, NextResponse } from "next/server";
import { getCounty, whoGuidelinePpm } from "@/lib/data";

export async function GET(req: NextRequest) {
  const county = req.nextUrl.searchParams.get("county") ?? "Nakuru";
  const record = getCounty(county);

  if (!record) {
    return NextResponse.json(
      { error: `No fluoride reading on file for county "${county}"` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    county: record.name,
    fluoride_ppm: record.ppm,
    who_guideline_ppm: whoGuidelinePpm,
    risk_tier: record.level,
    source: "WRMA water quality survey",
  });
}
