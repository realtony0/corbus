"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getProducts } from "@/lib/products";
import { Product } from "@/lib/types";
import { addToCart } from "@/lib/store";
import FooterSection from "@/components/FooterSection";

function ProductCard({ product, delay }: { product: Product; delay: number }) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleAdd = () => {
    if (!selectedSize || !product.inStock) return;
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      ref={ref}
      className="group transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-[#0a0a0a]" style={{ aspectRatio: "3/4", marginBottom: "20px" }}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-contain transition-transform duration-[800ms] ease-out group-hover:scale-[1.06]"
        />

        {/* Hover overlay with quick actions */}
        {product.inStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-black/90 via-black/70 to-transparent" style={{ padding: "40px 20px 20px" }}>
            <div className="flex justify-center gap-2" style={{ marginBottom: "12px" }}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-9 h-9 text-[11px] tracking-wider border transition-all duration-200 cursor-pointer ${
                    selectedSize === size
                      ? "border-white bg-white text-black"
                      : "border-white/30 text-white/70 hover:border-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              disabled={!selectedSize}
              className={`w-full py-3 text-[10px] tracking-[0.3em] uppercase transition-all duration-300 cursor-pointer ${
                added
                  ? "bg-green-600 text-white"
                  : selectedSize
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>
          </div>
        )}

        {/* Out of stock badge */}
        {!product.inStock && (
          <div className="absolute top-4 left-4">
            <span className="text-white/50 text-[9px] tracking-[0.3em] uppercase bg-black/60 backdrop-blur-sm px-3 py-1.5 border border-white/10">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <h3 className="text-[13px] md:text-sm font-normal tracking-[0.1em] text-white/80 group-hover:text-white transition-colors duration-300" style={{ marginBottom: "6px" }}>
        {product.name}
      </h3>
      <p className="text-[13px] text-white/35 font-light tracking-wider">
        {product.price.toLocaleString()} €
      </p>
    </div>
  );
}

export default function CatalogPage() {
  const products = getProducts();
  const categories = [...new Set(products.map((p) => p.category))];
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <>
      <section className="min-h-screen bg-black" style={{ paddingTop: "140px", paddingBottom: "100px" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-10">

          {/* Header — minimal like real ecom */}
          <div className="flex items-end justify-between border-b border-white/[0.06]" style={{ paddingBottom: "20px", marginBottom: "40px" }}>
            <div>
              <h1 className="text-2xl md:text-3xl font-light tracking-[0.15em]">
                All Products
              </h1>
            </div>
            <p className="text-white/25 text-xs tracking-wider">
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
            </p>
          </div>

          {/* Category filters — inline pills */}
          {categories.length > 0 && (
            <div className="flex gap-3 flex-wrap" style={{ marginBottom: "50px" }}>
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-5 py-2 text-[11px] tracking-[0.2em] uppercase rounded-full transition-all duration-300 cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-white text-black"
                    : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 text-[11px] tracking-[0.2em] uppercase rounded-full transition-all duration-300 cursor-pointer ${
                    activeCategory === cat
                      ? "bg-white text-black"
                      : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Products grid */}
          <div
            className="grid grid-cols-2 lg:grid-cols-3"
            style={{ gap: "30px 16px" }}
          >
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} delay={i * 150} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center" style={{ padding: "100px 0" }}>
              <p className="text-white/25 text-sm tracking-wider">No products found.</p>
            </div>
          )}
        </div>
      </section>
      <FooterSection />
    </>
  );
}
