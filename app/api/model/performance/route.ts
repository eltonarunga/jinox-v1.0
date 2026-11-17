import { NextResponse } from "next/server";
import { fetchModelPerformanceFromDb, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: { code: "MODEL_EVALUATION_NOT_CONFIGURED", message: "No model evaluation data source is configured." } },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const data = await fetchModelPerformanceFromDb();
    if (!data) {
      return NextResponse.json(
        { error: { code: "MODEL_EVALUATION_NOT_FOUND", message: "No model evaluation record is available." } },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ...data, data_source: "supabase", timestamp: new Date().toISOString() },
      { status: 200, headers: { "Cache-Control": "no-store", "X-Data-Source": "supabase" } }
    );
  } catch {
    return NextResponse.json(
      { error: { code: "MODEL_EVALUATION_DATA_ERROR", message: "Model evaluation data could not be loaded." } },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
