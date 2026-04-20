import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (Next.js loads it at runtime, but this script runs standalone)
const envPath = resolve(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'XOF',
      images JSONB NOT NULL DEFAULT '[]'::jsonb,
      sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
      category TEXT NOT NULL DEFAULT '',
      in_stock BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const seed = [
    {
      id: "corbus-a-era-white",
      name: "CORBUS A ERA — White",
      description:
        "Catch Our Rebel Brand Unique Shit. T-shirt blanc avec le logo Corbus sur le devant et le design A ERA au dos.",
      price: 20000,
      currency: "XOF",
      images: ["/images/products/a-era-white.jpg"],
      sizes: ["S", "M", "L", "XL"],
      category: "T-shirts",
      in_stock: false,
    },
    {
      id: "corbus-a-era-black",
      name: "CORBUS A ERA — Black",
      description:
        "Catch Our Rebel Brand Unique Shit. T-shirt noir avec le logo Corbus sur le devant et le design A ERA au dos.",
      price: 20000,
      currency: "XOF",
      images: ["/images/products/a-era-black.jpg"],
      sizes: ["S", "M", "L", "XL"],
      category: "T-shirts",
      in_stock: false,
    },
    {
      id: "corbus-embrace-white",
      name: "CORBUS Embrace — White",
      description:
        '"Embrace the Corbus land, they hold the truth." T-shirt blanc avec le logo Corbus gothique et le design Embrace au dos.',
      price: 20000,
      currency: "XOF",
      images: ["/images/products/embrace-white.jpg"],
      sizes: ["S", "M", "L", "XL"],
      category: "T-shirts",
      in_stock: false,
    },
  ];

  for (const p of seed) {
    await sql`
      INSERT INTO products (id, name, description, price, currency, images, sizes, category, in_stock)
      VALUES (${p.id}, ${p.name}, ${p.description}, ${p.price}, ${p.currency},
              ${JSON.stringify(p.images)}::jsonb, ${JSON.stringify(p.sizes)}::jsonb,
              ${p.category}, ${p.in_stock})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const count = await sql`SELECT COUNT(*)::int AS n FROM products`;
  console.log(`products table ready — ${count[0].n} rows`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
