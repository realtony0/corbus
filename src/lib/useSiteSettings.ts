"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import {
  DEFAULT_SITE_SETTINGS,
  SiteSettings,
  getSiteSettingsOverride,
  subscribeSiteSettings,
} from "./siteSettings";

/** Server-rendered settings, provided once by the root layout. */
export const SiteSettingsContext = createContext<SiteSettings>(
  DEFAULT_SITE_SETTINGS
);

function getOverride(): SiteSettings | null {
  return getSiteSettingsOverride();
}

function noOverride(): null {
  return null;
}

export function useSiteSettings(): SiteSettings {
  const fromServer = useContext(SiteSettingsContext);
  // null on the server and on the hydration pass, so both snapshots agree.
  const live = useSyncExternalStore(subscribeSiteSettings, getOverride, noOverride);
  return live ?? fromServer;
}

export function useSiteSetting<K extends keyof SiteSettings>(
  key: K
): SiteSettings[K] {
  return useSiteSettings()[key];
}
