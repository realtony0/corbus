"use client";

import { useSiteSettings } from "@/lib/useSiteSettings";

export default function DynamicFonts() {
  const { bodyFont, headingFont, gothicFont } = useSiteSettings();

  return (
    <style jsx global>{`
      body {
        font-family: "${bodyFont}", "Helvetica Neue", sans-serif !important;
      }
      .font-gothic {
        font-family: "${gothicFont}", "Old English Text MT", "Corbus Gothic", serif !important;
        font-weight: 700;
      }
      .font-heading {
        font-family: "${headingFont}", "Georgia", serif;
      }
      h1, h2, h3 {
        font-family: "${headingFont}", "Georgia", serif;
      }
      h1.font-gothic, h2.font-gothic, h3.font-gothic,
      .font-gothic h1, .font-gothic h2, .font-gothic h3 {
        font-family: "${gothicFont}", "Old English Text MT", "Corbus Gothic", serif !important;
        font-weight: 700;
      }
    `}</style>
  );
}
