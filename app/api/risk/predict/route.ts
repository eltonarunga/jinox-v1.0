import { NextRequest, NextResponse } from "next/server";
import { fuseRisk } from "@/lib/risk";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const county = typeof body.county === "string" ? body.county : "Nakuru";
  const patientAge = typeof body.patientAge === "number" ? body.patientAge : undefined;

  const result = fuseRisk({ county });

  return NextResponse.json({
    input: {
      county,
      patient_age: patientAge ?? null,
      modalities_used: ["imaging", "environmental", "genomic"],
    },
    output: result,
  });
}
