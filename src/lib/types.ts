export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  sizes: string[];
  category: string;
  inStock: boolean;
  /** Per-size quantities, e.g. { M: 4, L: 0 }. A size absent here is untracked. */
  stock: Record<string, number>;
  /** Manual catalog ordering, lowest first. */
  sortOrder: number;
  createdAt: string;
}

export type OrderStatus =
  | "received"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  /** Unit price, resolved server-side from the catalog. */
  price: number;
}

export interface Order {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  country: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: OrderStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  requiresAddress: boolean;
}
