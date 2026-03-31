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
  createdAt: string;
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
