// No "use client" directive on purpose: the server (root layout, API routes)
// imports SiteSettings / DEFAULT_SITE_SETTINGS from here. Marking the module
// client-only would hand the server a client-reference proxy instead of the
// real values, and the defaults would come back empty.

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
  ravenTitle: string;
  ravenDescription: string;
  crowTitle: string;
  crowDescription: string;
  blackbirdTitle: string;
  blackbirdDescription: string;
  originText: string;
  // Page headings
  aboutTitle: string;
  aboutSubtitle: string;
  catalogTitle: string;
  galleryEyebrow: string;
  galleryTitle: string;
  gallerySubtitle: string;
  footerNote: string;
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
  ravenTitle: "RAVEN 🐦‍⬛",
  ravenDescription: "",
  crowTitle: "CROW 🐦‍⬛",
  crowDescription: "",
  blackbirdTitle: "BLACKBIRDS 🐦‍⬛",
  blackbirdDescription: "",
  originText: "",
  aboutTitle: "Who & What We Are?",
  aboutSubtitle: "Fashion with Spirit, Style with Meaning",
  catalogTitle: "All Products",
  galleryEyebrow: "Lookbook",
  galleryTitle: "Gallery",
  gallerySubtitle: "The Corbus Collective",
  footerNote: "",
  loadingDuration: 1400,
  bodyFont: "Inter",
  headingFont: "Cormorant Garamond",
  gothicFont: "UnifrakturCook",
};

/** Merge a partial document coming from the database over the defaults. */
export function mergeSiteSettings(raw: unknown): SiteSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SITE_SETTINGS };
  return { ...DEFAULT_SITE_SETTINGS, ...(raw as Partial<SiteSettings>) };
}

/**
 * Settings live in Supabase and are rendered on the server, so the source of
 * truth reaches every visitor. This client store only holds an *override*:
 * it stays null until the admin saves in this tab, which lets the panel show
 * its change immediately without a reload. Keeping it null during hydration
 * is what makes the client's first snapshot match the server's.
 */
let override: SiteSettings | null = null;
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((l) => l());
}

export function getSiteSettingsOverride(): SiteSettings | null {
  return override;
}

export function updateSiteSettings(next: SiteSettings) {
  override = { ...next };
  notify();
}

export function subscribeSiteSettings(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
