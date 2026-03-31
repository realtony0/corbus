"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function HeroSection() {
  const settings = useSiteSettings();
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const handleScroll = useCallback(() => {
    requestAnimationFrame(() => setScrollY(window.scrollY));
  }, []);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 2200);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const parallax = scrollY * 0.4;
  const logoScale = 1 + scrollY * 0.0015;
  const opacity = Math.max(0, 1 - scrollY * 0.0018);
  const textY = scrollY * 0.2;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background image with parallax */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url('${settings.heroImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          transform: `translateY(${parallax}px) scale(1.1)`,
          opacity: loaded ? opacity * 0.7 : 0,
          willChange: "transform",
        }}
      />

      {/* Gradient overlay for smooth transition to next section */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black" />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Logo content */}
      <div
        className="relative z-10 flex flex-col items-center gap-5"
        style={{
          transform: `scale(${logoScale}) translateY(${-textY - 40}px)`,
          opacity,
          willChange: "transform, opacity",
        }}
      >
        {/* Decorative line */}
        <div
          className={`w-px h-10 bg-gradient-to-b from-transparent to-white/20 transition-all duration-1000 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "0.2s" }}
        />

        {/* Logo image */}
        <Image
          src="/images/logos/corbus-logo.png"
          alt="Corbus"
          width={300}
          height={100}
          priority
          className={`select-none transition-all duration-1000 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{
            height: "100px",
            width: "auto",
            transitionDelay: "0.5s",
          }}
        />

        {/* Tagline */}
        <p
          className={`text-white/40 text-xs md:text-sm tracking-[0.5em] uppercase transition-all duration-1000 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "0.7s" }}
        >
          {settings.tagline}
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-all duration-1000 ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "1.2s", opacity: loaded ? opacity * 0.5 : 0 }}
      >
        <span className="text-white/25 text-[9px] tracking-[0.4em] uppercase">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
