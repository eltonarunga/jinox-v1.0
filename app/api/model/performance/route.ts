import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Model evaluation is not yet connected to a reproducible evaluation pipeline.
 * Do not expose legacy model_versions rows as validated performance metrics.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: {
        code: "MODEL_EVALUATION_NOT_AVAILABLE",
        message: "Model performance reporting is unavailable until a reproducible evaluation pipeline and evidence-backed evaluation records are connected.",
      },
    },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}
