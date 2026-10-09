"use client";

/** Longest edge of an uploaded image, in pixels. */
const MAX_EDGE = 2000;
const JPEG_QUALITY = 0.85;

/** Formats the server stores as-is; everything else is re-encoded to JPEG. */
const PASS_THROUGH = new Set(["image/jpeg", "image/png", "image/webp"]);

export class ImagePrepError extends Error {}

/**
 * Prepares a picture for upload, in the browser.
 *
 * Phones shoot HEIC, which the upload endpoint rejects and which Chrome and
 * Android cannot display anyway — so storing it as-is would only turn a
 * visible error into broken images for visitors. Safari can decode HEIC, so
 * re-encoding here turns an iPhone photo into a JPEG everyone can see.
 *
 * It also bounds the dimensions: a modern phone photo easily exceeds the 10 MB
 * the endpoint accepts, and a 4000px image on a product card is wasted bytes.
 */
export async function prepareImage(file: File): Promise<File> {
  const small = file.size <= 1_500_000;
  if (PASS_THROUGH.has(file.type) && small) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImagePrepError(
      `Ce format (${file.type || "inconnu"}) ne peut pas être lu par ce ` +
        `navigateur. Sur iPhone : Réglages > Appareil photo > Formats > ` +
        `« Plus compatible », ou convertis la photo en JPEG.`
    );
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImagePrepError("Impossible de préparer l'image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  if (!blob) throw new ImagePrepError("Impossible de convertir l'image.");

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
