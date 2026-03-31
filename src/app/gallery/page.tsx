"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import FooterSection from "@/components/FooterSection";

const galleryImages = [
  { src: "/images/gallery/hero.jpg", alt: "Corbus model" },
  { src: "/images/gallery/photo1.jpg", alt: "Corbus editorial" },
  { src: "/images/gallery/photo2.jpg", alt: "Corbus duo" },
  { src: "/images/gallery/photo3.jpg", alt: "Corbus portrait" },
  { src: "/images/gallery/photo4.jpg", alt: "Corbus editorial" },
];

function GalleryImage({
  src,
  alt,
  index,
  onClick,
}: {
  src: string;
  alt: string;
  index: number;
  onClick: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150 + index * 120);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className="group cursor-pointer overflow-hidden relative"
      onClick={onClick}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={800}
        height={1000}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-7 h-7 text-white opacity-0 group-hover:opacity-70 transition-opacity duration-500"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
        </svg>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && lightbox !== null)
        setLightbox((lightbox + 1) % galleryImages.length);
      if (e.key === "ArrowLeft" && lightbox !== null)
        setLightbox(lightbox > 0 ? lightbox - 1 : galleryImages.length - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox]);

  return (
    <>
      <section
        className="min-h-screen bg-black"
        style={{ paddingTop: "100px", paddingBottom: "60px" }}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="text-center" style={{ marginBottom: "50px" }}>
            <p className="text-white/30 text-[10px] tracking-[0.5em] uppercase" style={{ marginBottom: "14px" }}>
              Lookbook
            </p>
            <h1 className="font-gothic text-3xl md:text-5xl" style={{ marginBottom: "12px" }}>
              Gallery
            </h1>
            <p className="text-white/40 text-xs tracking-[0.3em] uppercase">
              The Corbus Collective
            </p>
          </div>

          {/* Mobile: single column / Tablet+: masonry */}
          <div className="columns-1 sm:columns-2 lg:columns-3" style={{ gap: "10px" }}>
            {galleryImages.map((img, i) => (
              <div key={i} style={{ marginBottom: "10px", breakInside: "avoid" }}>
                <GalleryImage
                  src={img.src}
                  alt={img.alt}
                  index={i}
                  onClick={() => setLightbox(i)}
                />
              </div>
            ))}
          </div>

          {/* Count */}
          <p className="text-center text-white/25 text-[10px] tracking-[0.3em] uppercase" style={{ marginTop: "40px" }}>
            {galleryImages.length} photos
          </p>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white cursor-pointer z-10 p-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(lightbox > 0 ? lightbox - 1 : galleryImages.length - 1);
            }}
            className="absolute left-2 md:left-6 text-white/30 hover:text-white cursor-pointer z-10 p-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 md:w-10 md:h-10">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <Image
            src={galleryImages[lightbox].src}
            alt={galleryImages[lightbox].alt}
            width={1200}
            height={1500}
            sizes="100vw"
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(lightbox < galleryImages.length - 1 ? lightbox + 1 : 0);
            }}
            className="absolute right-2 md:right-6 text-white/30 hover:text-white cursor-pointer z-10 p-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 md:w-10 md:h-10">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <p className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-[10px] tracking-[0.3em]">
            {lightbox + 1} / {galleryImages.length}
          </p>
        </div>
      )}

      <FooterSection />
    </>
  );
}
