/**
 * Contact link helpers, so every place that renders a social link builds the
 * same URL from the same setting. The navbar used to hardcode its own.
 */
export function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, "").trim()}`;
}

export function snapchatUrl(handle: string): string {
  return `https://www.snapchat.com/add/${handle.replace(/^@/, "").trim()}`;
}

/** Digits only, for tel: and wa.me links. */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** +221 78 829 20 47 — grouped for readability, never for parsing. */
export function formatPhone(phone: string): string {
  const d = phoneDigits(phone);
  if (!d) return "";
  if (d.startsWith("221") && d.length === 12) {
    const n = d.slice(3);
    return `+221 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 7)} ${n.slice(7)}`;
  }
  return `+${d}`;
}
