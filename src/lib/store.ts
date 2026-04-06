"use client";

import { CartItem, Product, Country } from "./types";
import { countries } from "./countries";
import { getSetting } from "./siteSettings";

// Simple state management
let cart: CartItem[] = [];
let selectedCountry: Country = countries[0]; // Sénégal by default
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getCart(): CartItem[] {
  return cart;
}

export function addToCart(product: Product, size: string) {
  const existing = cart.find(
    (item) => item.product.id === product.id && item.size === size
  );
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ product, size, quantity: 1 });
  }
  cart = [...cart];
  notify();
}

export function removeFromCart(productId: string, size: string) {
  cart = cart.filter(
    (item) => !(item.product.id === productId && item.size === size)
  );
  notify();
}

export function updateQuantity(productId: string, size: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId, size);
    return;
  }
  const item = cart.find(
    (i) => i.product.id === productId && i.size === size
  );
  if (item) {
    item.quantity = quantity;
    cart = [...cart];
    notify();
  }
}

export function clearCart() {
  cart = [];
  notify();
}

export function getCartTotal(): number {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function getCartCount(): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function getSelectedCountry(): Country {
  return selectedCountry;
}

export function setSelectedCountry(country: Country) {
  selectedCountry = country;
  notify();
}

export function generateOrderMessage(customerInfo: {
  name: string;
  phone: string;
  address?: string;
  city?: string;
  country: string;
}): string {
  const items = cart
    .map(
      (item) =>
        `• ${item.product.name} (${item.size}) x${item.quantity} — ${item.product.price.toLocaleString()} €`
    )
    .join("\n");

  const total = getCartTotal().toLocaleString();

  let msg = `🛒 Nouvelle commande Am Web Agency\n\n`;
  msg += `👤 ${customerInfo.name}\n`;
  msg += `📞 ${customerInfo.phone}\n`;
  msg += `🌍 ${customerInfo.country}\n`;
  if (customerInfo.address) {
    msg += `📍 ${customerInfo.address}, ${customerInfo.city}\n`;
  }
  msg += `\n📦 Articles:\n${items}\n\n`;
  msg += `💰 Total: ${total} €`;

  return msg;
}

export function getWhatsAppUrl(message: string, phone?: string): string {
  const whatsappNumber = phone || getSetting("whatsapp");
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
