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

function failed(error: unknown) {
  console.error("products route:", error);
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
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
    return NextResponse.json(await addProduct(body), { status: 201 });
  } catch (error) {
    return failed(error);
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated(request))) return unauthorized();
  try {
    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 });
    }
    const product = await updateProduct(id, updates);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return failed(error);
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
    return failed(error);
  }
}
