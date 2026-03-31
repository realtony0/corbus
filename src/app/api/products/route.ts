import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products";

export async function GET() {
  return NextResponse.json(getProducts());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = addProduct(body);
  return NextResponse.json(product, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  const product = updateProduct(id, updates);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const success = deleteProduct(body.id);
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
