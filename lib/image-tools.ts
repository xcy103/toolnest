export const MAX_IMAGE_SIDE = 8192;
export const MAX_IMAGE_PIXELS = 16_777_216;
export const IMAGE_FORMATS = ["image/png", "image/jpeg", "image/webp"] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

export function validDimensions(width: number, height: number): boolean {
  return Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0
    && width <= MAX_IMAGE_SIDE && height <= MAX_IMAGE_SIDE && width * height <= MAX_IMAGE_PIXELS;
}

export function linkedSize(value: string, sourceSide: number, otherSide: number): string {
  if (!/^\d+$/.test(value) || Number(value) < 1 || sourceSide <= 0 || otherSide <= 0) return "";
  return String(Math.max(1, Math.round(Number(value) * otherSide / sourceSide)));
}

export function outputFilename(name: string, format: ImageFormat, resize: boolean): string {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}${resize ? "-resized" : "-converted"}.${format === "image/jpeg" ? "jpg" : format.split("/")[1]}`;
}

export async function encodeImage(
  source: CanvasImageSource, width: number, height: number,
  format: ImageFormat, quality: number, background: string,
): Promise<Blob> {
  if (!validDimensions(width, height)) throw new Error("dimensions");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("export");
    if (format === "image/jpeg") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, quality));
    if (!blob || blob.type !== format) throw new Error("export");
    return blob;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
