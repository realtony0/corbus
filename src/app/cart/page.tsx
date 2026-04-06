"use client";

import { useSyncExternalStore, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getCart,
  subscribe,
  updateQuantity,
  removeFromCart,
  getCartTotal,
  clearCart,
  generateOrderMessage,
  getWhatsAppUrl,
  getSelectedCountry,
} from "@/lib/store";
import { countries } from "@/lib/countries";

export default function CartPage() {
  const cart = useSyncExternalStore(subscribe, () => getCart(), () => []);
  const total = useSyncExternalStore(subscribe, () => getCartTotal(), () => 0);
  const country = useSyncExternalStore(subscribe, () => getSelectedCountry(), () => countries[0]);

  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setStep("checkout");
  };

  const handleConfirm = () => {
    if (!form.name || !form.phone) return;
    if (country.requiresAddress && (!form.address || !form.city)) return;

    const message = generateOrderMessage({
      name: form.name,
      phone: form.phone,
      address: country.requiresAddress ? form.address : undefined,
      city: country.requiresAddress ? form.city : undefined,
      country: country.name,
    });

    const url = getWhatsAppUrl(message);
    clearCart();
    window.open(url, "_blank");
  };

  if (cart.length === 0 && step === "cart") {
    return (
      <section className="min-h-screen pb-20 bg-black flex items-center justify-center" style={{ paddingTop: "180px" }}>
        <div className="text-center">
          <h1 className="font-gothic text-4xl mb-4">Your Cart</h1>
          <p className="text-white/40 mb-8">Your cart is empty.</p>
          <Link
            href="/catalog"
            className="inline-block px-8 py-3 border border-white/20 text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all"
          >
            Browse Catalog
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pb-20 bg-black" style={{ paddingTop: "180px" }}>
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-gothic text-4xl md:text-5xl text-center mb-12">
          {step === "cart" ? "Your Cart" : "Checkout"}
        </h1>

        {step === "cart" ? (
          <>
            {/* Cart items */}
            <div className="space-y-6 mb-12">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-4 border-b border-white/5 pb-6"
                >
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover bg-neutral-900"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.product.name}</h3>
                    <p className="text-white/40 text-xs mt-1">Size: {item.size}</p>
                    <p className="text-white/40 text-xs">
                      {item.product.price.toLocaleString()} €
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.size, item.quantity - 1)
                        }
                        className="w-7 h-7 border border-white/20 text-xs flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.size, item.quantity + 1)
                        }
                        className="w-7 h-7 border border-white/20 text-xs flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="text-white/30 hover:text-red-400 text-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-white/10 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm tracking-wider uppercase">Total</span>
                <span className="text-xl font-medium">{total.toLocaleString()} €</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-white text-black text-sm tracking-[0.2em] uppercase hover:bg-white/90 transition-all cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </>
        ) : (
          <>
            {/* Checkout form */}
            <div className="space-y-6 mb-12">
              <div>
                <label className="block text-white/40 text-xs tracking-wider uppercase mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm focus:border-white outline-none transition-colors"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-white/40 text-xs tracking-wider uppercase mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm focus:border-white outline-none transition-colors"
                  placeholder="+221 XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-white/40 text-xs tracking-wider uppercase mb-2">
                  Country: {country.name}
                </label>
              </div>

              {country.requiresAddress && (
                <>
                  <div>
                    <label className="block text-white/40 text-xs tracking-wider uppercase mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm focus:border-white outline-none transition-colors"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs tracking-wider uppercase mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm focus:border-white outline-none transition-colors"
                      placeholder="City"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Order summary */}
            <div className="border border-white/10 p-6 mb-8">
              <h3 className="text-sm tracking-wider uppercase mb-4 text-white/60">
                Order Summary
              </h3>
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex justify-between text-sm mb-2"
                >
                  <span className="text-white/60">
                    {item.product.name} ({item.size}) x{item.quantity}
                  </span>
                  <span>
                    {(item.product.price * item.quantity).toLocaleString()} €
                  </span>
                </div>
              ))}
              <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
                <span className="text-sm tracking-wider uppercase">Total</span>
                <span className="font-medium">{total.toLocaleString()} €</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep("cart")}
                className="flex-1 py-4 border border-white/20 text-sm tracking-[0.2em] uppercase hover:bg-white/5 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={!form.name || !form.phone || (country.requiresAddress && (!form.address || !form.city))}
                className="flex-1 py-4 bg-white text-black text-sm tracking-[0.2em] uppercase hover:bg-white/90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Confirm Order
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
