"use client";

import FooterSection from "@/components/FooterSection";
import WingsSection from "@/components/WingsSection";
import OriginSection from "@/components/OriginSection";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function AboutPage() {
  const settings = useSiteSettings();

  return (
    <>
      <section className="pb-0 bg-black" style={{ paddingTop: "180px" }}>
        <div className="text-center mb-0">
          <h1 className="font-gothic text-4xl md:text-6xl mb-4">
            {settings.aboutTitle || "Who & What We Are?"}
          </h1>
          <p className="text-white/40 text-sm tracking-[0.3em] uppercase">
            {settings.aboutSubtitle || "Fashion with Spirit, Style with Meaning"}
          </p>
        </div>
      </section>
      <WingsSection />
      <OriginSection />
      <FooterSection />
    </>
  );
}
