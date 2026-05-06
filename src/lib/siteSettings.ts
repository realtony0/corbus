"use client";

const SETTINGS_KEY = "corbus_site_settings";

export interface SiteSettings {
  // Contact
  whatsapp: string;
  instagram: string;
  email: string;
  tagline: string;
  // Hero
  heroImage: string;
  heroLogoVisible: boolean;
  // Content
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeDescription: string;
  quoteText: string;
  etymologyText: string;
  ravenDescription: string;
  crowDescription: string;
  blackbirdDescription: string;
  originText: string;
  inspirationQuote: string;
  // Appearance
  loadingDuration: number;
  bodyFont: string;
  headingFont: string;
  gothicFont: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  whatsapp: "221788292047",
  instagram: "@corbus.sn",
  email: "corbus.sn@gmail.com",
  tagline: "For all the black birds",
  heroImage: "/images/gallery/photo4.jpg",
  heroLogoVisible: true,
  welcomeTitle: "Welcome to the Corbusland",
  welcomeSubtitle: "",
  welcomeDescription: "",
  quoteText: "Fashion with Spirit, Style with Meaning",
  etymologyText: "",
  ravenDescription: "",
  crowDescription: "",
  blackbirdDescription: "",
  originText: "",
  inspirationQuote: "",
  loadingDuration: 3000,
  bodyFont: "Inter",
  headingFont: "Cormorant Garamond",
  gothicFont: "UnifrakturCook",
};

let settings: SiteSettings = { ...DEFAULT_SITE_SETTINGS };
let listeners: (() => void)[] = [];
let initialized = false;

function notify() {
  listeners.forEach((l) => l());
}

// Strip eye-related emoji (👁 👁️ 👀 🗨 with optional variation selector / ZWJ sequences)
const EYE_EMOJI_RE = /[\u{1F441}\u{1F440}\u{1F573}](?:️)?(?:‍[\u{1F5E8}\u{1F5E9}](?:️)?)?/gu;

function stripEyeEmoji<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(EYE_EMOJI_RE, "").replace(/[ \t]+([.,;!?])/g, "$1").trim() as unknown as T;
  }
  return value;
}

function sanitizeSettings(raw: Partial<SiteSettings>): Partial<SiteSettings> {
  const out: Record<string, unknown> = { ...raw };
  for (const key of Object.keys(out)) {
    out[key] = stripEyeEmoji(out[key]);
  }
  return out as Partial<SiteSettings>;
}

function init() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  initialized = true;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleaned = sanitizeSettings(parsed);
      settings = { ...DEFAULT_SITE_SETTINGS, ...cleaned };
      // Persist the cleaned version so it doesn't need to run again
      const before = JSON.stringify(parsed);
      const after = JSON.stringify(cleaned);
      if (before !== after) {
        localStorage.setItem(SETTINGS_KEY, after);
      }
    }
  } catch {
    // ignore parse errors
  }
}

export function getSiteSettings(): SiteSettings {
  init();
  return settings;
}

export function getSetting<K extends keyof SiteSettings>(key: K): SiteSettings[K] {
  init();
  return settings[key];
}

export function updateSiteSettings(partial: Partial<SiteSettings>) {
  init();
  settings = { ...settings, ...partial };
  if (typeof window !== "undefined") {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
  notify();
}

export function resetSiteSettings() {
  settings = { ...DEFAULT_SITE_SETTINGS };
  if (typeof window !== "undefined") {
    localStorage.removeItem(SETTINGS_KEY);
  }
  notify();
}

export function subscribeSiteSettings(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
