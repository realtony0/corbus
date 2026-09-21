import { OrderStatus } from "./types";

/**
 * Kept apart from orders.ts, which imports the server-only Supabase client:
 * the admin panel is a client component and must not pull that into the
 * browser bundle.
 */
export const ORDER_STATUSES: OrderStatus[] = [
  "received",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Reçue",
  paid: "Payée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; fg: string }> = {
  received: { bg: "#eff6ff", fg: "#1d4ed8" },
  paid: { bg: "#ecfdf5", fg: "#047857" },
  shipped: { bg: "#fefce8", fg: "#a16207" },
  delivered: { bg: "#f0fdf4", fg: "#15803d" },
  cancelled: { bg: "#fef2f2", fg: "#dc2626" },
};
