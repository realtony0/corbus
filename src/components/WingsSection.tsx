"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function WingsSection() {
  const settings = useSiteSettings();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.max(0, Math.min(1, 1 - rect.top / vh));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const wingsScale = 0.8 + scrollProgress * 0.3;
  const wingsOpacity = Math.min(0.12, scrollProgress * 0.15);

  return (
    <section
      ref={ref}
      className="relative bg-black overflow-hidden"
      style={{ paddingTop: "80px", paddingBottom: "80px" }}
    >
      {/* Top gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent z-[1]" />

      {/* Wings background */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transform: `scale(${wingsScale})`,
          opacity: wingsOpacity,
          willChange: "transform, opacity",
        }}
      >
        <Image
          src="/images/logos/wings.jpg"
          alt=""
          width={1200}
          height={600}
          className="w-full max-w-6xl h-auto object-contain"
          style={{ filter: "invert(1) brightness(3) contrast(0.5)" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">

        {/* Title + subtitle + image row */}
        <div className="flex flex-col items-center" style={{ marginBottom: "50px" }}>
          <h2
            className={`font-gothic text-3xl md:text-5xl text-center transition-all duration-[1.2s] ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ marginBottom: "14px" }}
          >
            {settings.welcomeTitle}
          </h2>

          <p
            className={`text-center text-white/50 text-[10px] md:text-xs tracking-[0.3em] uppercase transition-all duration-[1.2s] ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0.15s" }}
          >
            {settings.welcomeSubtitle || "Where darkness meets light, where mystery defines truth"}
          </p>
        </div>

        {/* Text section */}
        <div
          className={`transition-all duration-[1.2s] ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "0.3s", marginBottom: "60px" }}
        >
          <p className="text-white/70 text-sm md:text-[15px] leading-[2] text-center" style={{ marginBottom: "24px" }}>
            The Corbus Collection represents the revolt of man&apos;s soul in a
            corrupted, cruel, and fake society we&apos;re all living in.
          </p>
          <p className="text-white/70 text-sm md:text-[15px] leading-[2] text-center" style={{ marginBottom: "24px" }}>
            Inspired by the crow, a symbol of mystery, intelligence and freedom,
            Corbus invites you to express your unique and rebellious personality.
          </p>
          <p className="text-white/70 text-sm md:text-[15px] leading-[2] text-center">
            The surname Corbus is a name for a person who is raven-haired or
            dark-complexioned. The surname Corvi is derived from the Italian
            word &laquo;&nbsp;corvo&nbsp;&raquo; which comes from the Latin
            &laquo;&nbsp;corvus&nbsp;&raquo; which means raven or crow.
            Furthermore, this nickname surname was often used to describe
            priests 👁️
          </p>
        </div>

        {/* Three birds grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "RAVEN 🐦‍⬛",
              text: settings.ravenDescription || "« Seen as a messenger between worlds, the raven is associated with transformation, mystery, and prophecy. It is a symbol of death and rebirth, linking it to the cycles of life. Ravens are frequently associated with witches due to their intelligence and dark plumage, making them ideal familiars. They are seen as conduits of wisdom and carriers of magical messages. »",
              delay: "0.5s",
            },
            {
              title: "CROW 🐦‍⬛",
              text: settings.crowDescription || "« Crows are symbols of adaptability, cunning, and community. They are often seen as harbingers of change and transformation. The crow's connection to magic lies in its ability to mimic sounds, symbolising the blending of worlds and the power of words in spellwork. Its presence during rituals is believed to strengthen divination. Crows feature prominently in many cultures. In some Native American stories, they are considered creators or tricksters. »",
              delay: "0.65s",
            },
            {
              title: "BLACKBIRDS 🐦‍⬛👁️",
              text: settings.blackbirdDescription || "« Blackbirds are linked to mystery, intuition, and the unknown. Their song is said to call to the inner self, urging introspection and spiritual awakening. A blackbird's song can be seen as a guide to other realms, useful for meditation or dream work. They are also considered guardians of secrets. In Celtic mythology, the blackbird is a guide to the Otherworld. Its melodious song is believed to open doorways between this world and the next. »",
              delay: "0.8s",
            },
          ].map((bird) => (
            <div
              key={bird.title}
              className={`relative border border-white/[0.06] rounded-sm p-5 md:p-6 text-center transition-all duration-[1.2s] ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: bird.delay }}
            >
              <h3 className="font-gothic text-base md:text-lg tracking-[0.15em]" style={{ marginBottom: "10px" }}>
                {bird.title}
              </h3>
              <p className="text-white/55 text-xs md:text-sm leading-[1.8]">
                {bird.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
