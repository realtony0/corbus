import { NextRequest } from "next/server";

/**
 * Admin session handling.
 *
 * The previous panel compared the password to a constant shipped in the
 * client bundle and every /api write route was open, so anyone could edit or
 * delete the catalog. The password now lives only in the ADMIN_PASSWORD
 * environment variable and is checked on the server; the browser gets an
 * httpOnly, signed, expiring cookie instead.
 *
 * Uses Web Crypto so it runs unchanged on the Cloudflare Workers runtime.
 */
export const SESSION_COOKIE = "corbus_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not set");
  return value;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toHex(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  );
}

/**
 * Timing-safe comparison. Both sides are hashed first so the comparison runs
 * over fixed-length digests and never leaks the secret's length.
 */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [da, db] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const va = new Uint8Array(da);
  const vb = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < va.length; i += 1) diff |= va[i] ^ vb[i];
  return diff === 0;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

export async function createSessionToken(): Promise<string> {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${await hmac(exp)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const exp = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expiry = Number(exp);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  try {
    return await safeEqual(signature, await hmac(exp));
  } catch {
    return false;
  }
}

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
