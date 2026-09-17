import { NextResponse } from "next/server";
import { counties } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ counties });
}
