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
 * Prices are stored as integers in the currency's MINOR unit — cents for CAD.
 * The column is an integer, so a decimal price used to be rejected by Postgres
 * as an opaque server error; holding cents is what lets 49,99 exist at all.
 */
export function toMinor(major: number, decimals = DEFAULT_SITE_SETTINGS.currencyDecimals): number {
  return Math.round(major * 10 ** decimals);
}

export function toMajor(minor: number, decimals = DEFAULT_SITE_SETTINGS.currencyDecimals): number {
  return minor / 10 ** decimals;
}

/** Currencies with no minor unit; an amount in them is never shown with cents. */
const ZERO_DECIMAL = new Set([
  "XOF", "XAF", "JPY", "GNF", "RWF", "UGX", "KRW", "VND", "CLP", "ISK", "KMF",
  "DJF", "MGA", "PYG", "VUV", "BIF",
]);

function roundFor(currency: string, amount: number): number {
  if (!ZERO_DECIMAL.has(currency)) return Math.round(amount * 100) / 100;
  // Large round numbers read as prices: 12 345 FCFA becomes 12 300.
  if (amount >= 1000) return Math.round(amount / 100) * 100;
  return Math.round(amount);
}

function formatNumber(amount: number, decimals: number): string {
  return amount.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** The shop's own price, given in minor units. */
export function formatPrice(
  minor: number,
  label = DEFAULT_SITE_SETTINGS.currencyLabel,
  decimals = DEFAULT_SITE_SETTINGS.currencyDecimals
): string {
  return `${formatNumber(toMajor(minor, decimals), decimals)} ${label}`;
}

export interface ConvertedPrice {
  /** Always present: the authoritative amount, in the shop's currency. */
  base: string;
  /** Present only when the visitor's country uses another currency. */
  converted: string | null;
}

/**
 * The country selector only ever changed the address rules, so a visitor in
 * Dakar saw a Canadian dollar amount with nothing to compare it to. The
 * converted figure is indicative — payment is arranged over WhatsApp — and the
 * base amount stays the reference.
 */
export function convertPrice(
  minor: number,
  baseLabel: string,
  country: Country | null,
  rates: RateTable | null,
  decimals = DEFAULT_SITE_SETTINGS.currencyDecimals
): ConvertedPrice {
  const base = formatPrice(minor, baseLabel, decimals);
  if (!country || !rates?.rates) return { base, converted: null };

  const code = country.currency;
  if (!code || code === rates.base) return { base, converted: null };

  const rate = rates.rates[code];
  if (!rate || !Number.isFinite(rate)) return { base, converted: null };

  const value = roundFor(code, toMajor(minor, decimals) * rate);
  return {
    base,
    converted: `${formatNumber(value, ZERO_DECIMAL.has(code) ? 0 : 2)} ${country.currencySymbol}`,
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
