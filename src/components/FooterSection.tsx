"use client";

import Link from "next/link";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { instagramUrl, snapchatUrl, phoneDigits, formatPhone } from "@/lib/contact";

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
            href={instagramUrl(settings.instagram)}
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
            href={snapchatUrl(settings.snapchat)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-white/45 hover:text-white transition-colors duration-300"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
              <path d="M12.017 2c2.7 0 4.87 2.13 4.99 4.83.04.86.01 1.71-.02 2.2a.6.6 0 00.36.6c.27.11.62.06 1.03-.13.2-.09.42-.13.62-.11.4.04.72.31.8.68.09.4-.11.8-.53 1.02-.27.14-.6.26-.95.38-.66.23-1.34.47-1.42.86-.05.24.07.5.21.76.02.03.7 1.72 2.43 2.01.3.05.51.32.49.63-.03.48-.72.87-2.11 1.09-.08.13-.17.5-.23.77-.05.24-.12.5-.33.5h-.03c-.16 0-.37-.04-.63-.09a4.4 4.4 0 00-.87-.1c-.28 0-.57.03-.87.08-.58.1-1.08.45-1.66.85-.82.57-1.75 1.22-3.17 1.22h-.09c-1.42 0-2.35-.65-3.17-1.22-.58-.4-1.08-.75-1.66-.85a5.2 5.2 0 00-.87-.08c-.34 0-.63.05-.87.1-.26.05-.47.09-.63.09-.27 0-.35-.29-.4-.51-.06-.27-.15-.63-.23-.76-1.39-.22-2.08-.61-2.11-1.09a.6.6 0 01.49-.63c1.73-.29 2.41-1.98 2.43-2.01.14-.26.26-.52.21-.76-.08-.39-.76-.63-1.42-.86-.35-.12-.68-.24-.95-.38-.42-.22-.62-.62-.53-1.02.08-.37.4-.64.8-.68.2-.02.42.02.62.11.41.19.76.24 1.03.13a.6.6 0 00.36-.6c-.03-.49-.06-1.34-.02-2.2C7.147 4.13 9.317 2 12.017 2z" />
            </svg>
            <span className="text-xs tracking-widest">{settings.snapchat}</span>
          </a>

          <a
            href={`https://wa.me/${phoneDigits(settings.phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-white/45 hover:text-white transition-colors duration-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            <span className="text-xs tracking-widest">{formatPhone(settings.phone)}</span>
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
          {settings.footerNote ||
            `\u00a9 ${new Date().getFullYear()} CORBUS. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
