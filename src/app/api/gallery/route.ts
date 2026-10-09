import { NextRequest, NextResponse } from "next/server";
import { getGallery, saveGallery } from "@/lib/siteContent";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_CACHE = { "Cache-Control": "no-store" };

export async function GET() {
  return NextResponse.json(await getGallery(), { headers: NO_CACHE });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Un tableau d'URLs est attendu" },
        { status: 400 }
      );
    }
    return NextResponse.json(await saveGallery(body), { headers: NO_CACHE });
  } catch (error) {
    // Behind the admin cookie: give the real reason, not a dead end.
    console.error("gallery route:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Erreur serveur : ${detail}` },
      { status: 500 }
    );
  }
}
