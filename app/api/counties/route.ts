import { NextResponse } from "next/server";
import { fetchCountiesFromDb, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: { code: "DATA_SOURCE_NOT_CONFIGURED", message: "County surveillance data is not configured for this deployment." } },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const counties = await fetchCountiesFromDb();
    if (!counties || counties.length === 0) {
      return NextResponse.json(
        { error: { code: "SURVEILLANCE_DATA_UNAVAILABLE", message: "No county surveillance records are currently available." } },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { count: counties.length, counties, data_source: "supabase", timestamp: new Date().toISOString() },
      { status: 200, headers: { "Cache-Control": "no-store", "X-Data-Source": "supabase" } }
    );
  } catch {
    return NextResponse.json(
      { error: { code: "DATA_SOURCE_ERROR", message: "County surveillance data could not be loaded." } },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
