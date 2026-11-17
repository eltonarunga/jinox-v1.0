import { NextResponse } from "next/server";
import { fetchDatasetSummaryFromDb, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: { code: "DATA_SOURCE_NOT_CONFIGURED", message: "Dataset summary data is not configured for this deployment." } },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const data = await fetchDatasetSummaryFromDb();
    if (!data) {
      return NextResponse.json(
        { error: { code: "DATASET_SUMMARY_NOT_FOUND", message: "No dataset snapshot is currently available." } },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ...data, data_source: "supabase", timestamp: new Date().toISOString() },
      { status: 200, headers: { "Cache-Control": "no-store", "X-Data-Source": "supabase" } }
    );
  } catch {
    return NextResponse.json(
      { error: { code: "DATA_SOURCE_ERROR", message: "Dataset summary data could not be loaded." } },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
