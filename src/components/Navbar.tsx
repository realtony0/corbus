"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCartCount, subscribe } from "@/lib/store";
import CountrySelector from "./CountrySelector";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = useSyncExternalStore(
    subscribe,
    () => getCartCount(),
    () => 0
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
          scrolled
            ? "bg-black/90 backdrop-blur-xl py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
          {/* Menu Button — 3 crow silhouettes in circles */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex gap-1.5 sm:gap-2 items-center group cursor-pointer p-1 -ml-1 flex-shrink-0"
            aria-label="Menu"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:border-white/70"
                style={{
                  transitionDelay: `${i * 50}ms`,
                  transform: `rotate(${[-10, 0, 10][i]}deg)`,
                }}
              >
                {/* Standing crow silhouette */}
                <svg
                  viewBox="0 0 64 64"
                  className="w-[17px] h-[17px] md:w-[18px] md:h-[18px] text-white/80 group-hover:text-white transition-colors"
                  fill="currentColor"
                >
                  <path d="M15 24.6c2.5-4.4 6.1-7.1 10.6-8.2l5.9-1.3 5-4.2c2.5-2.1 6.2-3 10.1-2.2l8.5 1.6-7.9 1.4 1.8 2.9c2.1 3.3 4.2 6.5 6.5 9.4l3.9 4.5c2.5 3 3.7 6.1 3.4 10L61 48.3l.6 7.5-2.6-6.6.3 6.2-2.4-4.8-1.2 2.4-1.2-5.5-2.9 5-2.1 3.7-4.3 2.5-5.2 1.4 1.1 11 4.4 4.3-6.7-1.9-7.3-1.3-6 2.1 4.8-4.3-2.4-7.5.1-4.9-2.2-5.3-2-7.1-6.8 4.8-7.2 4.6 5.7-6.9-2.4.8 4-4.9-2.7.2 3.9-2.8-2.2-.4 4.7-2.8-3.6-.8Z" />
                  <path d="M34.1 20.4c1.8 1.3 3.2 3.1 4.1 5.5.5 1.5.6 3 .3 4.6l-1.5 5-3.2 1 .8 2.5-2.9.9.8 2.8-2.8 1.1.8 2.5-2.7 1.4-2.1-8.5-3.9.8 3.2-4.1-2.3.5 4-5.8c1.4-2 1.5-4.1.4-6.4l-1.5-2.9 3.8-.8 4.7-.1 2-1Z" />
                  <path d="M35.4 59.8c-.8 4.4-2.9 8.1-5.8 11.1l-2 1.9 2.9-.7 3.3-2.5 2.5 5.5-4.6-3-5.8 1.6 5.2-3.6 2.2-4.4.9-5.9 1.2-.1Z" />
                  <path d="M44.5 59.8c1.3 4.2 3.8 7.7 7 10.3l2.3 1.7-2.9-.4-3.7-2 1.8 5.8-4.2-3.6-6-.4 5.8-1.4-.9-4.8-1.3-5 2.1-.2Z" />
                  <circle cx="40.7" cy="18.9" r="2.3" fill="black" />
                </svg>
              </div>
            ))}
          </button>

          {/* Logo center */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 transition-opacity hover:opacity-80"
            onClick={() => setMenuOpen(false)}
          >
            <div className="relative h-12 w-10 md:h-14 md:w-12">
              <Image
                src="/images/logos/corbus-icon-transparent.png"
                alt="Corbus"
                fill
                priority
                sizes="(max-width: 768px) 40px, 48px"
                className="object-contain select-none"
                style={{ filter: "invert(1)" }}
              />
            </div>
          </Link>

          {/* Right: country + cart */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <CountrySelector />
            <Link href="/cart" aria-label="Cart" className="relative group p-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-6 h-6 text-white/70 group-hover:text-white transition-colors"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-white text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Full screen menu overlay (PDF: assombrir le logo pour mettre en évidence la catégorie) */}
      <div
        className={`fixed inset-0 z-40 bg-black/98 backdrop-blur-xl transition-all duration-500 flex flex-col items-center justify-center ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Dimmed logo in background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Image
            src="/images/logos/corbus-icon.jpeg"
            alt=""
            width={256}
            height={320}
            className="w-64 h-80 object-contain opacity-[0.04]"
            style={{ filter: "invert(1)" }}
          />
        </div>

        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-5 right-6 text-white/40 hover:text-white transition-colors cursor-pointer p-2"
          aria-label="Close menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-7 h-7"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <nav className="relative z-10 flex flex-col items-center gap-8">
          {[
            { href: "/", label: "HOME" },
            { href: "/catalog", label: "CATALOG" },
            { href: "/gallery", label: "GALLERY" },
            { href: "/about", label: "WHO & WHAT WE ARE?" },
            { href: "/contact", label: "CONTACT" },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="tracking-[0.3em] text-white/80 hover:text-white transition-all duration-500 hover:tracking-[0.5em] text-lg md:text-xl font-normal uppercase"
              style={{
                transitionDelay: menuOpen ? `${i * 80}ms` : "0ms",
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom social in menu */}
        <div className="absolute bottom-10 flex items-center gap-6">
          <a
            href="https://instagram.com/corbus.sn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          <a
            href="mailto:corbus.sn@gmail.com"
            className="text-white/30 hover:text-white transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
            >
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}
