import { NextResponse } from "next/server";
import { datasetSummary as seededSummary } from "@/lib/data";
import { fetchDatasetSummaryFromDb } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbSummary = await fetchDatasetSummaryFromDb();
    const isLive = Boolean(dbSummary);
    const data = isLive ? dbSummary! : seededSummary;

    return NextResponse.json(
      {
        ...data,
        data_source: isLive ? "supabase" : "seeded-mock",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "X-Data-Source": isLive ? "supabase" : "seeded-mock",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load dataset registry summary.",
        },
      },
      { status: 500 }
    );
  }
}
