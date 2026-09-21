import { NextRequest, NextResponse } from "next/server";
import { isAdminConfigured, isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lets the admin page restore an existing session across reloads. */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      authenticated: await isAuthenticated(request),
      configured: isAdminConfigured(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
