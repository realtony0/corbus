"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { addToCart } from "@/lib/store";

export default function ProductCard({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!selectedSize || !product.inStock) return;
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden mb-4">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-700 group-hover:scale-105"
        />

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white/80 text-xs tracking-[0.3em] uppercase font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-sm font-medium tracking-wider mb-1">
        {product.name}
      </h3>
      <p className="text-white/40 text-sm mb-3">
        {product.price.toLocaleString()} €
      </p>

      {/* Sizes */}
      {product.inStock && (
        <div className="flex gap-2 mb-3">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-9 h-9 text-xs border transition-all cursor-pointer ${
                selectedSize === size
                  ? "border-white bg-white text-black"
                  : "border-white/20 text-white/60 hover:border-white/50"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}

      {/* Add to cart */}
      {product.inStock ? (
        <button
          onClick={handleAdd}
          disabled={!selectedSize}
          className={`w-full py-2.5 text-xs tracking-[0.2em] uppercase transition-all cursor-pointer ${
            added
              ? "bg-green-600 text-white"
              : selectedSize
              ? "bg-white text-black hover:bg-white/90"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          {added ? "Added" : "Add to Cart"}
        </button>
      ) : (
        <button
          disabled
          className="w-full py-2.5 text-xs tracking-[0.2em] uppercase bg-white/5 text-white/20 cursor-not-allowed"
        >
          Sold Out
        </button>
      )}
    </div>
  );
}
