import { NextRequest, NextResponse } from "next/server";
import { fuseRisk } from "@/lib/risk";
import { recordScreeningEvent } from "@/lib/supabase";
import { getAllCountyNames } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_JSON",
            message: "Request body must be valid JSON.",
          },
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "A JSON payload with screening parameters is required.",
          },
        },
        { status: 400 }
      );
    }

    const county = typeof body.county === "string" && body.county.trim().length > 0
      ? body.county.trim()
      : "Nakuru";

    let patientAge: number | undefined;
    if (body.patientAge !== undefined && body.patientAge !== null) {
      const ageNum = Number(body.patientAge);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 125) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "patientAge must be an integer between 0 and 125.",
            },
          },
          { status: 422 }
        );
      }
      patientAge = Math.round(ageNum);
    }

    let imagingSignal: number | undefined;
    if (body.imagingSignal !== undefined && body.imagingSignal !== null) {
      const imgNum = Number(body.imagingSignal);
      if (isNaN(imgNum) || imgNum < 0 || imgNum > 100) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "imagingSignal must be a number between 0 and 100.",
            },
          },
          { status: 422 }
        );
      }
      imagingSignal = imgNum;
    }

    let geneticSignal: number | undefined;
    if (body.geneticSignal !== undefined && body.geneticSignal !== null) {
      const genNum = Number(body.geneticSignal);
      if (isNaN(genNum) || genNum < 0 || genNum > 100) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "geneticSignal must be a number between 0 and 100.",
            },
          },
          { status: 422 }
        );
      }
      geneticSignal = genNum;
    }

    const result = fuseRisk({
      county,
      patientAge,
      imagingSignal,
      geneticSignal,
    });

    // Record anonymized screening asynchronously in Supabase if configured
    await recordScreeningEvent({
      patient_age: patientAge,
      imaging_signal: result.imaging_signal,
      environmental_signal: result.environmental_signal,
      genetic_signal: result.genetic_signal,
      fused_fluorosis_risk: result.fused_fluorosis_risk,
      risk_tier: result.tier,
      referred_for_review: false,
    });

    return NextResponse.json(
      {
        input: {
          county,
          patient_age: patientAge ?? null,
          modalities_used: ["imaging", "environmental", "genomic"],
          timestamp: new Date().toISOString(),
        },
        output: result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during multimodal risk fusion.",
        },
      },
      { status: 500 }
    );
  }
}
