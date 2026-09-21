"use client";

import { CartItem, Product, Country } from "./types";
import { countries } from "./countries";

/**
 * Cart + country state.
 *
 * Both are persisted to localStorage: the cart used to live in a plain module
 * variable, so it was wiped by every full page reload.
 */
const CART_KEY = "corbus_cart";
const COUNTRY_KEY = "corbus_country";

/** Stable references, so useSyncExternalStore's server snapshot is cached. */
export const EMPTY_CART: CartItem[] = [];
export const DEFAULT_COUNTRY: Country = countries[0]; // Sénégal

let cart: CartItem[] = EMPTY_CART;
let selectedCountry: Country = DEFAULT_COUNTRY;
let listeners: (() => void)[] = [];
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const rawCart = localStorage.getItem(CART_KEY);
    if (rawCart) {
      const parsed = JSON.parse(rawCart);
      if (Array.isArray(parsed)) cart = parsed as CartItem[];
    }
    const rawCountry = localStorage.getItem(COUNTRY_KEY);
    if (rawCountry) {
      const match = countries.find((c) => c.code === rawCountry);
      if (match) selectedCountry = match;
    }
  } catch {
    // corrupt storage — fall back to an empty cart
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    localStorage.setItem(COUNTRY_KEY, selectedCountry.code);
  } catch {
    // quota or private mode — state still works for this page view
  }
}

function notify() {
  persist();
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  load();
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getCart(): CartItem[] {
  load();
  return cart;
}

export function addToCart(product: Product, size: string) {
  load();
  const existing = cart.find(
    (item) => item.product.id === product.id && item.size === size
  );
  if (existing) {
    cart = cart.map((item) =>
      item === existing ? { ...item, quantity: item.quantity + 1 } : item
    );
  } else {
    cart = [...cart, { product, size, quantity: 1 }];
  }
  notify();
}

export function removeFromCart(productId: string, size: string) {
  load();
  cart = cart.filter(
    (item) => !(item.product.id === productId && item.size === size)
  );
  notify();
}

export function updateQuantity(productId: string, size: string, quantity: number) {
  load();
  if (quantity <= 0) {
    removeFromCart(productId, size);
    return;
  }
  cart = cart.map((item) =>
    item.product.id === productId && item.size === size
      ? { ...item, quantity }
      : item
  );
  notify();
}

export function clearCart() {
  cart = [];
  notify();
}

export function getCartTotal(): number {
  return getCart().reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getSelectedCountry(): Country {
  load();
  return selectedCountry;
}

export function setSelectedCountry(country: Country) {
  load();
  selectedCountry = country;
  notify();
}

export function generateOrderMessage(customerInfo: {
  name: string;
  phone: string;
  address?: string;
  city?: string;
  country: string;
  /** Order reference, so the WhatsApp thread maps to a row in the admin. */
  reference?: string;
}): string {
  const items = getCart()
    .map(
      (item) =>
        `• ${item.product.name} (${item.size}) x${item.quantity} — ${item.product.price.toLocaleString()} FCFA`
    )
    .join("\n");

  const total = getCartTotal().toLocaleString();

  let msg = `🛒 Nouvelle commande CORBUS\n`;
  if (customerInfo.reference) {
    msg += `Réf. ${customerInfo.reference}\n`;
  }
  msg += `\n`;
  msg += `👤 ${customerInfo.name}\n`;
  msg += `📞 ${customerInfo.phone}\n`;
  msg += `🌍 ${customerInfo.country}\n`;
  if (customerInfo.address) {
    msg += `📍 ${customerInfo.address}, ${customerInfo.city}\n`;
  }
  msg += `\n📦 Articles:\n${items}\n\n`;
  msg += `💰 Total: ${total} FCFA`;

  return msg;
}

/**
 * The WhatsApp number is a site setting, so it has to be passed in by a
 * component reading useSiteSettings() — this module can no longer reach into
 * the settings store now that settings are server-rendered.
 */
export function getWhatsAppUrl(message: string, phone: string): string {
  const number = phone.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
