/**
 * Downscale an image file to a data URL before it goes anywhere.
 *
 * In local mode this keeps logos and avatars inside the localStorage quota; in
 * Supabase mode the same call keeps uploads small enough that a phone on a bad
 * connection still finishes. Either way the caller does not care.
 */
export async function fileToScaledDataUrl(
  file: File,
  max = 320,
  quality = 0.85,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  // WebP unless the source is a plain photo, where JPEG is smaller.
  const type =
    file.type === "image/png" || file.type === "image/webp" ? "image/webp" : "image/jpeg";
  return canvas.toDataURL(type, quality);
}
