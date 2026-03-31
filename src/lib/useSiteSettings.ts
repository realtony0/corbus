"use client";

import { useSyncExternalStore } from "react";
import {
  getSiteSettings,
  subscribeSiteSettings,
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
} from "./siteSettings";

// Cached server snapshot (must be referentially stable)
const serverSnapshot: SiteSettings = { ...DEFAULT_SITE_SETTINGS };

function getSnapshot(): SiteSettings {
  return getSiteSettings();
}

function getServerSnapshotCached(): SiteSettings {
  return serverSnapshot;
}

export function useSiteSettings(): SiteSettings {
  return useSyncExternalStore(subscribeSiteSettings, getSnapshot, getServerSnapshotCached);
}

export function useSiteSetting<K extends keyof SiteSettings>(key: K): SiteSettings[K] {
  const settings = useSiteSettings();
  return settings[key];
}
