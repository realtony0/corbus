import { getSupabase, isSupabaseConfigured } from "./supabase";
import { getSiteSettings } from "./siteContent";

export interface RateTable {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
}

/** Rates older than this are refetched. */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;
const DOC_KEY = "fx_rates";

async function readCache(): Promise<RateTable | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await getSupabase()
      .from("site_content")
      .select("value")
      .eq("key", DOC_KEY)
      .maybeSingle();
    const v = data?.value as RateTable | undefined;
    if (!v?.rates || !v.fetchedAt || !v.base) return null;
    return v;
  } catch {
    return null;
  }
}

async function writeCache(table: RateTable): Promise<void> {
  try {
    await getSupabase()
      .from("site_content")
      .upsert({ key: DOC_KEY, value: table, updated_at: new Date().toISOString() });
  } catch {
    // A cache write failure must not break the storefront.
  }
}

async function fetchRates(base: string): Promise<RateTable | null> {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (body.result !== "success" || !body.rates) return null;
    return { base, rates: body.rates, fetchedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

/**
 * Exchange rates for the shop's base currency.
 *
 * Cached in site_content for 12 hours: the storefront is rendered per request,
 * so hitting the rate provider every time would be both slow and rude. On any
 * failure the stale cache is preferred over nothing, and an empty table means
 * callers fall back to showing the base price.
 */
export async function getRates(): Promise<RateTable> {
  const base = (await getSiteSettings()).currencyCode || "CAD";
  const cached = await readCache();

  const fresh =
    cached &&
    cached.base === base &&
    Date.now() - new Date(cached.fetchedAt).getTime() < MAX_AGE_MS;
  if (fresh) return cached;

  const fetched = await fetchRates(base);
  if (fetched) {
    await writeCache(fetched);
    return fetched;
  }

  // Provider unreachable: a stale table still beats no conversion at all.
  if (cached && cached.base === base) return cached;
  return { base, rates: {}, fetchedAt: new Date(0).toISOString() };
}
