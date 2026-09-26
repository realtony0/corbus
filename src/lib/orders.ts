import { getSupabase, isSupabaseConfigured } from "./supabase";
import { Order, OrderItem, OrderStatus } from "./types";
import { getProducts } from "./products";
import { ORDER_STATUSES } from "./orderStatus";
import { getSiteSettings } from "./siteContent";

interface OrderRow {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  city: string;
  country: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: OrderStatus;
  note: string;
  created_at: string;
  updated_at: string;
}

const COLUMNS =
  "id, reference, customer_name, customer_phone, address, city, country, items, total, currency, status, note, created_at, updated_at";

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    reference: row.reference,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    address: row.address ?? "",
    city: row.city ?? "",
    country: row.country ?? "",
    items: row.items ?? [],
    total: row.total,
    currency: row.currency,
    status: row.status,
    note: row.note ?? "",
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

/** CRB-YYMMDD-XXXX, short enough to read out over the phone. */
function makeReference(): string {
  const d = new Date();
  const stamp =
    String(d.getUTCFullYear()).slice(2) +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0");
  const suffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `CRB-${stamp}-${suffix}`;
}

export interface NewOrderInput {
  customerName: string;
  customerPhone: string;
  address?: string;
  city?: string;
  country?: string;
  /** Prices are NOT taken from here — they are resolved from the catalog. */
  items: { productId: string; size: string; quantity: number }[];
}

export class OrderError extends Error {}

/**
 * Creates an order, pricing it from the catalog rather than from the request
 * body: the checkout form is public, so a client-supplied price could not be
 * trusted.
 */
export async function createOrder(input: NewOrderInput): Promise<Order> {
  const name = String(input.customerName ?? "").trim();
  const phone = String(input.customerPhone ?? "").trim();
  if (!name || !phone) {
    throw new OrderError("Nom et téléphone sont requis");
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new OrderError("Le panier est vide");
  }
  if (input.items.length > 50) {
    throw new OrderError("Trop d'articles");
  }

  const catalog = new Map((await getProducts()).map((p) => [p.id, p]));
  const items: OrderItem[] = [];

  for (const raw of input.items) {
    const product = catalog.get(String(raw.productId));
    if (!product) {
      throw new OrderError(`Produit introuvable : ${raw.productId}`);
    }
    const quantity = Math.floor(Number(raw.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
      throw new OrderError(`Quantité invalide pour ${product.name}`);
    }
    items.push({
      productId: product.id,
      name: product.name,
      size: String(raw.size ?? ""),
      quantity,
      price: product.price,
    });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currency =
    catalog.get(items[0].productId)?.currency ||
    (await getSiteSettings()).currencyCode;

  // Retry on the (unlikely) reference collision rather than failing the sale.
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await getSupabase()
      .from("orders")
      .insert({
        reference: makeReference(),
        customer_name: name.slice(0, 120),
        customer_phone: phone.slice(0, 40),
        address: String(input.address ?? "").slice(0, 200),
        city: String(input.city ?? "").slice(0, 120),
        country: String(input.country ?? "").slice(0, 120),
        items,
        total,
        currency,
      })
      .select(COLUMNS)
      .single();

    if (!error) return rowToOrder(data as OrderRow);
    // 23505 = unique_violation on `reference`
    if (error.code !== "23505") throw new Error(`createOrder: ${error.message}`);
    lastError = error;
  }
  throw new Error(`createOrder: ${String(lastError)}`);
}

export async function getOrders(limit = 200): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabase()
    .from("orders")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getOrders: ${error.message}`);
  return (data as OrderRow[]).map(rowToOrder);
}

export async function updateOrder(
  id: string,
  updates: { status?: OrderStatus; note?: string }
): Promise<Order | null> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) {
    if (!ORDER_STATUSES.includes(updates.status)) {
      throw new OrderError(`Statut inconnu : ${updates.status}`);
    }
    patch.status = updates.status;
  }
  if (updates.note !== undefined) patch.note = String(updates.note).slice(0, 2000);

  const { data, error } = await getSupabase()
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error) throw new Error(`updateOrder: ${error.message}`);
  return data ? rowToOrder(data as OrderRow) : null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("orders")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`deleteOrder: ${error.message}`);
  return (data as { id: string }[]).length > 0;
}
