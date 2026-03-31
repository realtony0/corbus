"use client";

import { useEffect, useRef, useState } from "react";
import FooterSection from "@/components/FooterSection";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function ContactPage() {
  const settings = useSiteSettings();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <section
        ref={ref}
        className="min-h-screen bg-black relative overflow-hidden"
        style={{ paddingTop: "160px", paddingBottom: "100px" }}
      >
        {/* Background subtle texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/images/logos/crows.jpg')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.03,
            filter: "invert(1)",
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="text-center" style={{ marginBottom: "80px" }}>
            <div
              className={`w-px bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto transition-all duration-1000 ${
                visible ? "opacity-100 h-12" : "opacity-0 h-0"
              }`}
            />

            <p
              className={`text-white/20 text-[10px] tracking-[0.5em] uppercase transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ marginTop: "24px", marginBottom: "16px", transitionDelay: "0.2s" }}
            >
              Get in touch
            </p>

            <h1
              className={`font-gothic text-5xl md:text-7xl transition-all duration-1000 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.3s", textShadow: "0 0 80px rgba(255,255,255,0.06)" }}
            >
              Contact
            </h1>
          </div>

          {/* Contact cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            style={{ marginBottom: "80px" }}
          >
            {/* Instagram Card */}
            <a
              href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative border border-white/[0.06] rounded-sm p-10 flex flex-col items-center text-center hover:border-white/15 transition-all duration-500 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "0.5s" }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10 group-hover:border-white/25 transition-colors" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/10 group-hover:border-white/25 transition-colors" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/10 group-hover:border-white/25 transition-colors" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/10 group-hover:border-white/25 transition-colors" />

              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/30 group-hover:text-white/70 transition-colors duration-500" style={{ marginBottom: "20px" }}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>

              <p className="text-white/15 text-[10px] tracking-[0.4em] uppercase" style={{ marginBottom: "12px" }}>
                Instagram
              </p>

              <span className="text-white/50 text-base tracking-wider group-hover:text-white transition-colors duration-500">
                {settings.instagram}
              </span>

              {/* Arrow indicator */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-all duration-500 group-hover:translate-x-1"
                style={{ marginTop: "20px" }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>

            {/* Email Card */}
            <a
              href={`mailto:${settings.email}`}
              className={`group relative border border-white/[0.06] rounded-sm p-10 flex flex-col items-center text-center hover:border-white/15 transition-all duration-500 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "0.65s" }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10 group-hover:border-white/25 transition-colors" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/10 group-hover:border-white/25 transition-colors" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/10 group-hover:border-white/25 transition-colors" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/10 group-hover:border-white/25 transition-colors" />

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-white/30 group-hover:text-white/70 transition-colors duration-500" style={{ marginBottom: "20px" }}>
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>

              <p className="text-white/15 text-[10px] tracking-[0.4em] uppercase" style={{ marginBottom: "12px" }}>
                Email
              </p>

              <span className="text-white/50 text-base tracking-wider group-hover:text-white transition-colors duration-500">
                {settings.email}
              </span>

              {/* Arrow indicator */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-all duration-500 group-hover:translate-x-1"
                style={{ marginTop: "20px" }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Quote section */}
          <div
            className={`text-center transition-all duration-1000 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: "0.8s" }}
          >
            <div className="w-12 h-px bg-white/10 mx-auto" style={{ marginBottom: "40px" }} />

            <p
              className="text-white/25 text-sm md:text-base italic tracking-wide leading-relaxed max-w-lg mx-auto"
            >
              &ldquo;{settings.quoteText}&rdquo;
            </p>

            <div className="w-12 h-px bg-white/10 mx-auto" style={{ marginTop: "40px" }} />
          </div>

          {/* Location info */}
          <div
            className={`text-center transition-all duration-1000 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ marginTop: "60px", transitionDelay: "0.95s" }}
          >
            <p className="text-white/15 text-[10px] tracking-[0.4em] uppercase" style={{ marginBottom: "12px" }}>
              Based in
            </p>
            <p className="text-white/40 text-sm tracking-widest uppercase">
              Dakar, Sénégal
            </p>
          </div>
        </div>
      </section>
      <FooterSection />
    </>
  );
}
