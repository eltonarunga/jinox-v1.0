import { NextResponse } from "next/server";
import { modelPerformance } from "@/lib/data";

export async function GET() {
  return NextResponse.json(modelPerformance);
}
