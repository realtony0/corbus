import { Product } from "./types";

// Products stored in memory - in production, use a database
let products: Product[] = [
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
    inStock: false,
    createdAt: "2024-01-01",
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
    inStock: false,
    createdAt: "2024-01-01",
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
    inStock: false,
    createdAt: "2024-01-01",
  },
];

export function getProducts(): Product[] {
  return products;
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function addProduct(
  product: Omit<Product, "id" | "createdAt">
): Product {
  const newProduct: Product = {
    ...product,
    id: product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  return newProduct;
}

export function updateProduct(
  id: string,
  updates: Partial<Product>
): Product | null {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates };
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const len = products.length;
  products = products.filter((p) => p.id !== id);
  return products.length < len;
}
