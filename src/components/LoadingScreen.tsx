"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function LoadingScreen() {
  const settings = useSiteSettings();
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = settings.loadingDuration || 3000;
    const timer1 = setTimeout(() => setFadeOut(true), duration - 1000);
    const timer2 = setTimeout(() => setVisible(false), duration - 200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [settings.loadingDuration]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo image */}
      <Image
        src="/images/logos/corbus-logo.png"
        alt="Corbus"
        width={240}
        height={80}
        priority
        className="select-none"
        style={{
          height: "80px",
          width: "auto",
          animation: "fadeInUp 1s ease-out 0.2s forwards",
          opacity: 0,
        }}
      />

      <p
        className="text-white/30 text-[10px] tracking-[0.5em] uppercase"
        style={{
          marginTop: "20px",
          animation: "fadeInUp 1s ease-out 0.6s forwards",
          opacity: 0,
        }}
      >
        {settings.tagline}
      </p>

      {/* Loading bar */}
      <div className="w-32 h-px bg-white/10 overflow-hidden rounded-full" style={{ marginTop: "40px" }}>
        <div
          className="h-full bg-white/50 rounded-full"
          style={{
            animation: "loadBar 1.8s ease-in-out forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes loadBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
