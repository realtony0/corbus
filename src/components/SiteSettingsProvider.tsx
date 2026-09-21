"use client";

import { SiteSettings } from "@/lib/siteSettings";
import { SiteSettingsContext } from "@/lib/useSiteSettings";

export default function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
