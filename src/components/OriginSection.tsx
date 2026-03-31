"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function OriginSection() {
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
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <section ref={ref} className="relative bg-black overflow-hidden" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/images/logos/crows.jpg')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.03,
          filter: "invert(1)",
          transform: `scale(${1 + scrollProgress * 0.15})`,
          willChange: "transform",
        }}
      />

      {/* Top / bottom separators */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="text-center" style={{ marginBottom: "40px" }}>
          <p
            className={`text-white/25 text-[10px] tracking-[0.5em] uppercase transition-all duration-1000 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            style={{ marginBottom: "12px" }}
          >
            Etymology
          </p>
          <h2
            className={`font-gothic text-3xl md:text-5xl transition-all duration-1000 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: "0.15s" }}
          >
            The Name
          </h2>
        </div>

        {/* Content: icon + text side by side */}
        <div
          className={`flex flex-col md:flex-row items-center gap-8 md:gap-14 transition-all duration-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "0.3s", marginBottom: "50px" }}
        >
          {/* Logo side */}
          <div className="flex-shrink-0">
            <img
              src="/images/logos/corbus-icon-transparent.png"
              alt="Corbus icon"
              className="w-24 h-24 md:w-36 md:h-36 object-contain"
              style={{ opacity: 0.6 }}
            />
          </div>

          {/* Text side */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-white/35 text-[10px] tracking-[0.4em] uppercase" style={{ marginBottom: "8px" }}>
              From the Latin
            </p>
            <p
              className="font-gothic text-xl md:text-2xl text-white/75"
              style={{ marginBottom: "8px" }}
            >
              &laquo; Corvus &raquo;
            </p>
            <p className="text-white/30 text-[10px] tracking-widest uppercase" style={{ marginBottom: "20px" }}>
              Raven or Crow
            </p>

            <div className="w-8 h-px bg-white/10 mx-auto md:mx-0" style={{ marginBottom: "20px" }} />

            <p className="text-white/70 text-sm md:text-[15px] leading-[1.9]">
              {settings.originText || "The surname Corbus is a name for a person who is raven-haired or dark-complexioned. The surname Corvi is derived from the Italian word \u00AB\u00A0corvo\u00A0\u00BB which comes from the Latin \u00AB\u00A0corvus\u00A0\u00BB which means raven or crow. Furthermore, this nickname surname was often used to describe priests."}
            </p>
          </div>
        </div>

        {/* Bottom quote */}
        <div
          className={`text-center transition-all duration-1000 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "0.6s" }}
        >
          <div className="w-12 h-px bg-white/10 mx-auto" style={{ marginBottom: "20px" }} />
          <p className="text-white/45 text-sm italic tracking-wide leading-relaxed max-w-lg mx-auto">
            Inspired by the crow, a symbol of mystery, intelligence and freedom,
            Corbus invites you to express your unique and rebellious personality.
          </p>
        </div>
      </div>
    </section>
  );
}
