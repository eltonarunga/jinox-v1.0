import { NextResponse } from "next/server";
import { modelPerformance as seededPerformance } from "@/lib/data";
import { fetchModelPerformanceFromDb } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbPerformance = await fetchModelPerformanceFromDb();
    const isLive = Boolean(dbPerformance);
    const data = isLive ? dbPerformance! : seededPerformance;

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
          message: "Failed to load foundational model performance benchmarks.",
        },
      },
      { status: 500 }
    );
  }
}
