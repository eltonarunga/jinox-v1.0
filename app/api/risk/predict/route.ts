import { NextResponse } from "next/server";

/**
 * This endpoint is intentionally unavailable.
 *
 * The previous implementation generated random imaging/genetic signals when
 * inputs were omitted, used seeded county-level environmental values, and
 * mapped a heuristic score to clinical fluorosis staging. Those outputs are
 * not validated clinical predictions and must not be presented as such.
 *
 * Re-enable only after a validated model, traceable input provenance,
 * explicit missing-modality handling, and clinical evaluation are in place.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: {
        code: "MODEL_NOT_VALIDATED",
        message:
          "Risk prediction is disabled in this release because no validated clinical model is connected. Use clinician-led assessment and verified surveillance data.",
      },
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
