import type { NextConfig } from "next";

/**
 * Allow product/gallery images served from the R2 public domain.
 * Read at build time from NEXT_PUBLIC_R2_PUBLIC_URL (e.g. https://media.corbus.sn).
 */
function r2RemotePattern() {
  const raw = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!raw) return [];
  try {
    const url = new URL(raw);
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        pathname: "/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    // Next's default optimizer needs sharp, which the Cloudflare Workers
    // runtime does not provide. Images are served as-is; R2 objects are
    // uploaded with a one-year immutable cache header.
    unoptimized: true,
    formats: ["image/webp"],
    remotePatterns: r2RemotePattern(),
  },
};

export default nextConfig;
