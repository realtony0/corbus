"use client";

import Link from "next/link";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function FooterSection() {
  const settings = useSiteSettings();
  return (
    <footer className="relative bg-black overflow-hidden">
      {/* Top separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div
        className="relative z-10 flex flex-col items-center px-8"
        style={{ paddingTop: "140px", paddingBottom: "60px" }}
      >

        {/* Logo */}
        <h2 className="font-gothic text-5xl md:text-6xl text-center">
          Corbus
        </h2>

        {/* Tagline */}
        <p
          className="text-white/35 text-[10px] tracking-[0.5em] uppercase text-center"
          style={{ marginTop: "20px" }}
        >
          {settings.tagline}
        </p>

        {/* Nav links */}
        <nav
          className="flex flex-wrap justify-center gap-10 sm:gap-14"
          style={{ marginTop: "70px" }}
        >
          {[
            { href: "/catalog", label: "Catalog" },
            { href: "/gallery", label: "Gallery" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/40 hover:text-white/70 text-[11px] tracking-[0.3em] uppercase transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Separator */}
        <div
          className="w-12 h-px bg-white/10"
          style={{ marginTop: "60px", marginBottom: "60px" }}
        />

        {/* Social links */}
        <div className="flex flex-col items-center" style={{ gap: "30px" }}>
          <a
            href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-white/45 hover:text-white transition-colors duration-300"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <span className="text-xs tracking-widest">{settings.instagram}</span>
          </a>

          <a
            href={`mailto:${settings.email}`}
            className="flex items-center gap-3 text-white/45 hover:text-white transition-colors duration-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs tracking-widest">{settings.email}</span>
          </a>
        </div>

        {/* Bottom copyright */}
        <div
          className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
          style={{ marginTop: "80px", marginBottom: "30px" }}
        />

        <p className="text-white/10 text-[10px] tracking-wider text-center">
          &copy; 2026 CORBUS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
