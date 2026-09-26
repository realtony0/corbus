"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SITE_SETTINGS } from "./siteSettings";
import { Country } from "./types";

export interface RateTable {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
}

/**
 * Currencies with no minor unit: showing "12 345,67 FCFA" would be wrong, and
 * these are the ones the shop actually ships to.
 */
const ZERO_DECIMAL = new Set([
  "XOF", "XAF", "JPY", "GNF", "RWF", "UGX", "KRW", "VND", "CLP", "ISK", "KMF",
  "DJF", "MGA", "PYG", "VUV", "BIF",
]);

function roundFor(currency: string, amount: number): number {
  if (!ZERO_DECIMAL.has(currency)) return Math.round(amount * 100) / 100;
  // Large round numbers read as prices; 12 345 FCFA becomes 12 300.
  if (amount >= 1000) return Math.round(amount / 100) * 100;
  return Math.round(amount);
}

function formatNumber(currency: string, amount: number): string {
  return amount.toLocaleString("fr-FR", {
    minimumFractionDigits: ZERO_DECIMAL.has(currency) ? 0 : 2,
    maximumFractionDigits: ZERO_DECIMAL.has(currency) ? 0 : 2,
  });
}

/** The shop's own price, in the base currency. */
export function formatPrice(amount: number, label?: string): string {
  const l = label || DEFAULT_SITE_SETTINGS.currencyLabel;
  return `${amount.toLocaleString("fr-FR")} ${l}`;
}

export interface ConvertedPrice {
  /** Always present: the authoritative amount, in the shop's base currency. */
  base: string;
  /** Present only when the visitor's country uses another currency. */
  converted: string | null;
}

/**
 * Prices are held in one base currency. The country selector only ever changed
 * the address rules, so a visitor in Dakar saw a Canadian dollar amount with no
 * idea what it meant. The converted figure is indicative — payment is arranged
 * over WhatsApp — and the base amount stays the reference.
 */
export function convertPrice(
  amount: number,
  baseLabel: string,
  country: Country | null,
  rates: RateTable | null
): ConvertedPrice {
  const base = formatPrice(amount, baseLabel);
  if (!country || !rates?.rates) return { base, converted: null };

  const code = country.currency;
  if (!code || code === rates.base) return { base, converted: null };

  const rate = rates.rates[code];
  if (!rate || !Number.isFinite(rate)) return { base, converted: null };

  const value = roundFor(code, amount * rate);
  return {
    base,
    converted: `${formatNumber(code, value)} ${country.currencySymbol}`,
  };
}

/** Fetches the rate table once per page. */
export function useRates(): RateTable | null {
  const [rates, setRates] = useState<RateTable | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/rates")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: RateTable | null) => {
        if (alive && d?.rates) setRates(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return rates;
}
