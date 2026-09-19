import { NextResponse } from "next/server";
import { counties as seededCounties } from "@/lib/data";
import { fetchCountiesFromDb } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbCounties = await fetchCountiesFromDb();
    const isLive = Boolean(dbCounties && dbCounties.length > 0);
    const counties = dbCounties && dbCounties.length > 0 ? dbCounties : seededCounties;

    return NextResponse.json(
      {
        count: counties.length,
        counties,
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
          message: "Failed to fetch county fluorosis directory",
        },
      },
      { status: 500 }
    );
  }
}
