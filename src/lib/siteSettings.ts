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
  ravenDescription: string;
  crowDescription: string;
  blackbirdDescription: string;
  originText: string;
  // Appearance
  loadingDuration: number;
  bodyFont: string;
  headingFont: string;
  gothicFont: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  whatsapp: "221788292047",
  instagram: "@amwebagency",
  email: "contact@amwebagency.com",
  tagline: "Votre agence web créative",
  heroImage: "/images/gallery/photo4.jpg",
  heroLogoVisible: true,
  welcomeTitle: "Bienvenue chez Am Web Agency",
  welcomeSubtitle: "",
  welcomeDescription: "",
  quoteText: "Fashion with Spirit, Style with Meaning",
  ravenDescription: "",
  crowDescription: "",
  blackbirdDescription: "",
  originText: "",
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

function init() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  initialized = true;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      settings = { ...DEFAULT_SITE_SETTINGS, ...parsed };
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
