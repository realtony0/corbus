import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  getOrders,
  updateOrder,
  deleteOrder,
  OrderError,
} from "@/lib/orders";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_CACHE = { "Cache-Control": "no-store" };

function unauthorized() {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

function failed(error: unknown) {
  if (error instanceof OrderError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  console.error("orders route:", error);
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}

/** Admin only — the order list holds customer contact details. */
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) return unauthorized();
  try {
    return NextResponse.json(await getOrders(), { headers: NO_CACHE });
  } catch (error) {
    return failed(error);
  }
}

/**
 * Public: this is the checkout. Prices are resolved from the catalog inside
 * createOrder, so nothing money-related is taken from the request body.
 */
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(await createOrder(await request.json()), {
      status: 201,
      headers: NO_CACHE,
    });
  } catch (error) {
    return failed(error);
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated(request))) return unauthorized();
  try {
    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: "id est requis" }, { status: 400 });
    const order = await updateOrder(id, updates);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order, { headers: NO_CACHE });
  } catch (error) {
    return failed(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated(request))) return unauthorized();
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id est requis" }, { status: 400 });
    if (!(await deleteOrder(id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (error) {
    return failed(error);
  }
}
