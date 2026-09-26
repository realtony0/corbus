import { NextResponse } from "next/server";
import { getRates } from "@/lib/rates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getRates(), {
    // Rates change slowly; let the edge hold them briefly.
    headers: { "Cache-Control": "public, max-age=1800" },
  });
}
