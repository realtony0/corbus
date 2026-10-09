import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

function unauthorized() {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

/**
 * Admin routes get the real reason. "Erreur serveur" told the shop owner
 * nothing and left no way to act; these endpoints are behind the session
 * cookie, so the detail does not reach the public.
 */
function failed(error: unknown, detailed = false) {
  console.error("products route:", error);
  const detail = error instanceof Error ? error.message : String(error);
  return NextResponse.json(
    { error: detailed ? `Erreur serveur : ${detail}` : "Erreur serveur" },
    { status: 500 }
  );
}

export async function GET() {
  try {
    return NextResponse.json(await getProducts(), { headers: NO_CACHE });
  } catch (error) {
    return failed(error);
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) return unauthorized();
  try {
    const body = await request.json();
    if (!body?.name || typeof body.price !== "number") {
      return NextResponse.json(
        { error: "name et price sont requis" },
        { status: 400 }
      );
    }
    // Prices are integers in the currency's minor unit; the column rejects a
    // fractional value with an error that means nothing to the caller.
    if (!Number.isInteger(body.price) || body.price < 0) {
      return NextResponse.json(
        { error: "price doit être un entier en centimes" },
        { status: 400 }
      );
    }
    return NextResponse.json(await addProduct(body), { status: 201 });
  } catch (error) {
    return failed(error, true);
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated(request))) return unauthorized();
  try {
    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 });
    }
    if (
      updates.price !== undefined &&
      (!Number.isInteger(updates.price) || updates.price < 0)
    ) {
      return NextResponse.json(
        { error: "price doit être un entier en centimes" },
        { status: 400 }
      );
    }
    const product = await updateProduct(id, updates);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return failed(error, true);
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated(request))) return unauthorized();
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 });
    }
    if (!(await deleteProduct(id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return failed(error, true);
  }
}
