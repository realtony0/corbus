"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import FlyingBirds from "./FlyingBirds";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function QuoteSection() {
  const settings = useSiteSettings();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.max(0, Math.min(1, 1 - rect.top / vh));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <section
      ref={ref}
      className="relative flex items-center justify-center bg-black overflow-hidden"
      style={{ paddingTop: "100px", paddingBottom: "100px" }}
    >
      {/* Wings background */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
        style={{ opacity: 0.05 }}
      >
        <Image
          src="/images/logos/wings.jpg"
          alt=""
          width={1200}
          height={600}
          className="w-full max-w-6xl h-auto object-contain"
          style={{ filter: "invert(1) brightness(3) contrast(0.5)" }}
        />
      </div>

      <FlyingBirds />

      {/* Subtle gradient at top for smooth transition from hero */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-[1]" />

      <div
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
        style={{
          transform: `translateY(${(1 - scrollProgress) * 30}px)`,
          opacity: visible ? 1 : 0,
          transition: visible ? "opacity 1.5s ease-out" : "none",
        }}
      >
        <div style={{ marginBottom: "40px" }}>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto" />
        </div>

        <p className="text-xl md:text-2xl text-white/80 leading-relaxed italic font-light tracking-wide">
          &ldquo;{settings.quoteText}&rdquo;
        </p>

        <div className="flex items-center justify-center gap-4" style={{ marginTop: "40px" }}>
          <div className="w-8 h-px bg-white/10" />
          <p className="text-[10px] text-white/40 tracking-[0.5em] uppercase">
            Corbus
          </p>
          <div className="w-8 h-px bg-white/10" />
        </div>
      </div>
    </section>
  );
}
