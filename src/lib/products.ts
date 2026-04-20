import { sql } from "./db";
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
  created_at: string | Date;
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: row.currency,
    images: row.images,
    sizes: row.sizes,
    category: row.category,
    inStock: row.in_stock,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = (await sql`
    SELECT id, name, description, price, currency, images, sizes, category, in_stock, created_at
    FROM products
    ORDER BY created_at ASC
  `) as ProductRow[];
  return rows.map(rowToProduct);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const rows = (await sql`
    SELECT id, name, description, price, currency, images, sizes, category, in_stock, created_at
    FROM products
    WHERE id = ${id}
  `) as ProductRow[];
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

export async function addProduct(
  product: Omit<Product, "id" | "createdAt">
): Promise<Product> {
  const id = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const rows = (await sql`
    INSERT INTO products (id, name, description, price, currency, images, sizes, category, in_stock)
    VALUES (
      ${id},
      ${product.name},
      ${product.description},
      ${product.price},
      ${product.currency},
      ${JSON.stringify(product.images)}::jsonb,
      ${JSON.stringify(product.sizes)}::jsonb,
      ${product.category},
      ${product.inStock}
    )
    RETURNING id, name, description, price, currency, images, sizes, category, in_stock, created_at
  `) as ProductRow[];
  return rowToProduct(rows[0]);
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  const current = await getProduct(id);
  if (!current) return null;
  const merged = { ...current, ...updates };
  const rows = (await sql`
    UPDATE products
    SET name = ${merged.name},
        description = ${merged.description},
        price = ${merged.price},
        currency = ${merged.currency},
        images = ${JSON.stringify(merged.images)}::jsonb,
        sizes = ${JSON.stringify(merged.sizes)}::jsonb,
        category = ${merged.category},
        in_stock = ${merged.inStock}
    WHERE id = ${id}
    RETURNING id, name, description, price, currency, images, sizes, category, in_stock, created_at
  `) as ProductRow[];
  return rows[0] ? rowToProduct(rows[0]) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const rows = (await sql`
    DELETE FROM products WHERE id = ${id} RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}
