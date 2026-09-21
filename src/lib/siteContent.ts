import { getSupabase, isSupabaseConfigured } from "./supabase";
import {
  DEFAULT_SITE_SETTINGS,
  SiteSettings,
  mergeSiteSettings,
} from "./siteSettings";

export const DEFAULT_GALLERY = [
  "/images/gallery/hero.jpg",
  "/images/gallery/photo1.jpg",
  "/images/gallery/photo2.jpg",
  "/images/gallery/photo3.jpg",
  "/images/gallery/photo4.jpg",
];

async function readDoc(key: string): Promise<unknown> {
  const { data, error } = await getSupabase()
    .from("site_content")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw new Error(`readDoc(${key}): ${error.message}`);
  return data?.value ?? null;
}

async function writeDoc(key: string, value: unknown): Promise<void> {
  const { error } = await getSupabase()
    .from("site_content")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw new Error(`writeDoc(${key}): ${error.message}`);
}

/**
 * Never throws: the site must still render if Supabase is unreachable or not
 * configured yet, falling back to the built-in defaults.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return { ...DEFAULT_SITE_SETTINGS };
  try {
    return mergeSiteSettings(await readDoc("settings"));
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export async function saveSiteSettings(
  settings: Partial<SiteSettings>
): Promise<SiteSettings> {
  const merged = mergeSiteSettings({
    ...(await getSiteSettings()),
    ...settings,
  });
  await writeDoc("settings", merged);
  return merged;
}

export async function getGallery(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [...DEFAULT_GALLERY];
  try {
    const value = await readDoc("gallery");
    if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      return value as string[];
    }
    return [...DEFAULT_GALLERY];
  } catch {
    return [...DEFAULT_GALLERY];
  }
}

export async function saveGallery(photos: string[]): Promise<string[]> {
  const clean = photos.filter((p) => typeof p === "string" && p.trim() !== "");
  await writeDoc("gallery", clean);
  return clean;
}
