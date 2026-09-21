import { getSupabase, isSupabaseConfigured } from "./supabase";
import { Product } from "./types";

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  sizes: string[];
  category: string;
  in_stock: boolean;
  created_at: string;
}

const COLUMNS =
  "id, name, description, price, currency, images, sizes, category, in_stock, created_at";

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: row.currency,
    images: row.images ?? [],
    sizes: row.sizes ?? [],
    category: row.category,
    inStock: row.in_stock,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "produit"
  );
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabase()
    .from("products")
    .select(COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getProducts: ${error.message}`);
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const { data, error } = await getSupabase()
    .from("products")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getProduct: ${error.message}`);
  return data ? rowToProduct(data as ProductRow) : undefined;
}

/**
 * Ids are derived from the product name, so two products with the same name
 * used to collide on the primary key and fail the insert with a 500. Append a
 * numeric suffix until the id is free.
 */
async function uniqueId(name: string): Promise<string> {
  const base = slugify(name);
  const { data, error } = await getSupabase()
    .from("products")
    .select("id")
    .like("id", `${base}%`);
  if (error) throw new Error(`uniqueId: ${error.message}`);

  const taken = new Set((data as { id: string }[]).map((r) => r.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export async function addProduct(
  product: Omit<Product, "id" | "createdAt">
): Promise<Product> {
  const { data, error } = await getSupabase()
    .from("products")
    .insert({
      id: await uniqueId(product.name),
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      currency: product.currency || "XOF",
      images: product.images ?? [],
      sizes: product.sizes ?? [],
      category: product.category ?? "",
      in_stock: product.inStock ?? false,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(`addProduct: ${error.message}`);
  return rowToProduct(data as ProductRow);
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  // Only send the columns the caller actually supplied, so a partial update
  // (the stock toggle sends just inStock) cannot blank out the other fields.
  const patch: Record<string, unknown> = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.price !== undefined) patch.price = updates.price;
  if (updates.currency !== undefined) patch.currency = updates.currency;
  if (updates.images !== undefined) patch.images = updates.images;
  if (updates.sizes !== undefined) patch.sizes = updates.sizes;
  if (updates.category !== undefined) patch.category = updates.category;
  if (updates.inStock !== undefined) patch.in_stock = updates.inStock;

  if (Object.keys(patch).length === 0) {
    return (await getProduct(id)) ?? null;
  }

  const { data, error } = await getSupabase()
    .from("products")
    .update(patch)
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error) throw new Error(`updateProduct: ${error.message}`);
  return data ? rowToProduct(data as ProductRow) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("products")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`deleteProduct: ${error.message}`);
  return (data as { id: string }[]).length > 0;
}
