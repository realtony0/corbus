"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { countries } from "@/lib/countries";
import { getSelectedCountry, setSelectedCountry, subscribe } from "@/lib/store";

export default function CountrySelector() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const country = useSyncExternalStore(
    subscribe,
    () => getSelectedCountry(),
    () => countries[0]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-white/5"
      >
        <span>{country.flag}</span>
        <span className="text-[10px] text-white/40 hidden sm:inline">
          {country.currencySymbol}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-3 h-3 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 bg-neutral-950 border border-white/10 rounded-lg overflow-hidden shadow-2xl min-w-[260px] z-50">
          <div className="p-2 border-b border-white/5">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full bg-white/5 border-none rounded px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:bg-white/10 transition-colors"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-white/30 text-xs text-center py-4">
                No results
              </p>
            )}
            {filtered.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setSelectedCountry(c);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full text-left px-4 py-2.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer ${
                  c.code === country.code
                    ? "text-white bg-white/5"
                    : "text-white/60"
                }`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-white/30 text-[10px]">
                  {c.currencySymbol}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
