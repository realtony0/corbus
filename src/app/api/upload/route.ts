import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Uploads used to be written to public/images with fs.writeFile. That only
 * ever worked on a local dev machine: on Cloudflare (as on any serverless
 * host) the bundle is read-only and ephemeral, so uploaded images either
 * failed outright or vanished on the next deploy. They now go to an R2
 * bucket bound as MEDIA and are served from its public domain.
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

/** Minimal shape of the R2 binding, so we don't need @cloudflare/workers-types. */
interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }
  ): Promise<unknown>;
}

async function getBucket(): Promise<R2Bucket | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { MEDIA?: R2Bucket }).MEDIA ?? null;
  } catch {
    return null;
  }
}

function publicUrlFor(key: string): string | null {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/${key}`;
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const rawFolder = String(formData.get("folder") ?? "uploads");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: `Type non supporté : ${file.type || "inconnu"}` },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Fichier trop lourd (10 Mo maximum)" },
        { status: 413 }
      );
    }

    // Keep the key inside the bucket's namespace: no traversal, no leading slash.
    const folder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, "") || "uploads";
    const dot = file.name.lastIndexOf(".");
    const ext = dot > 0 ? file.name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, "") : "";
    const baseName =
      (dot > 0 ? file.name.slice(0, dot) : file.name)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 60) || "image";
    const key = `${folder}/${baseName}_${Date.now()}${ext}`;

    const bucket = await getBucket();
    if (!bucket) {
      return NextResponse.json(
        {
          error:
            "Bucket R2 indisponible. Vérifie le binding MEDIA dans wrangler.jsonc (en local : npm run preview).",
        },
        { status: 503 }
      );
    }

    const url = publicUrlFor(key);
    if (!url) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_R2_PUBLIC_URL n'est pas défini" },
        { status: 503 }
      );
    }

    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    return NextResponse.json({ path: url, key, name: baseName + ext });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 });
  }
}
