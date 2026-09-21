import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * Uses the service-role key, so it bypasses RLS and must never be imported
 * from a "use client" module. Every write path behind it is guarded by
 * requireAdmin() in src/lib/auth.ts.
 *
 * Instantiated lazily: the Cloudflare Workers runtime only exposes bindings
 * and secrets during a request, so reading them at module scope would throw
 * during the build's page-data collection.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("SUPABASE_URL is not set");
  }
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** True when Supabase credentials are present, so callers can degrade gracefully. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
