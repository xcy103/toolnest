export const MAX_IMAGE_SIDE = 8192;
export const MAX_IMAGE_PIXELS = 16_777_216;
export const IMAGE_FORMATS = ["image/png", "image/jpeg", "image/webp"] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];
export type CropRect = { x: number; y: number; width: number; height: number };
export type IcoImage = { size: number; bytes: Uint8Array };

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

export function validCrop(rect: CropRect, sourceWidth: number, sourceHeight: number): boolean {
  const values = [rect.x, rect.y, rect.width, rect.height, sourceWidth, sourceHeight];
  return values.every(Number.isInteger) && rect.x >= 0 && rect.y >= 0
    && rect.width > 0 && rect.height > 0 && sourceWidth > 0 && sourceHeight > 0
    && rect.x + rect.width <= sourceWidth && rect.y + rect.height <= sourceHeight
    && validDimensions(rect.width, rect.height);
}

export function cropFilename(name: string, format: ImageFormat): string {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  const ext = format === "image/jpeg" ? "jpg" : format.split("/")[1];
  return `${base}-cropped.${ext}`;
}

export function compressedFilename(name: string, format: ImageFormat): string {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  const ext = format === "image/jpeg" ? "jpg" : format.split("/")[1];
  return `${base}-compressed.${ext}`;
}

export function fitWithinWidth(width: number, height: number, maxWidth: number): { width: number; height: number } {
  if (!validDimensions(width, height) || !Number.isInteger(maxWidth) || maxWidth < 1 || maxWidth > MAX_IMAGE_SIDE) {
    throw new Error("dimensions");
  }
  const scale = Math.min(1, maxWidth / width);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
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

export async function encodeCrop(
  source: CanvasImageSource, sourceWidth: number, sourceHeight: number, rect: CropRect,
  format: ImageFormat, quality: number, background: string,
): Promise<Blob> {
  if (!validCrop(rect, sourceWidth, sourceHeight)) throw new Error("crop");
  const canvas = document.createElement("canvas");
  canvas.width = rect.width;
  canvas.height = rect.height;
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("export");
    if (format === "image/jpeg") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
    ctx.drawImage(source, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, quality));
    if (!blob || blob.type !== format) throw new Error("export");
    return blob;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export async function encodeSquare(source: CanvasImageSource, sourceWidth: number, sourceHeight: number, size: number): Promise<Blob> {
  if (!validDimensions(sourceWidth, sourceHeight) || !Number.isInteger(size) || size < 1 || size > 512) {
    throw new Error("dimensions");
  }
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("export");
    const scale = Math.min(size / sourceWidth, size / sourceHeight);
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, Math.floor((size - width) / 2), Math.floor((size - height) / 2), width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob || blob.type !== "image/png") throw new Error("export");
    return blob;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export function buildIco(images: readonly IcoImage[]): Uint8Array {
  if (images.length < 1 || images.length > 65_535) throw new Error("images");
  const seen = new Set<number>();
  let total = 6 + images.length * 16;
  for (const image of images) {
    if (!Number.isInteger(image.size) || image.size < 1 || image.size > 256 || image.bytes.length < 1 || seen.has(image.size)) {
      throw new Error("images");
    }
    seen.add(image.size);
    total += image.bytes.length;
  }
  if (total > 0xffff_ffff) throw new Error("images");

  const output = new Uint8Array(total);
  const view = new DataView(output.buffer);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);
  let offset = 6 + images.length * 16;
  images.forEach((image, index) => {
    const entry = 6 + index * 16;
    output[entry] = image.size === 256 ? 0 : image.size;
    output[entry + 1] = image.size === 256 ? 0 : image.size;
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, 32, true);
    view.setUint32(entry + 8, image.bytes.length, true);
    view.setUint32(entry + 12, offset, true);
    output.set(image.bytes, offset);
    offset += image.bytes.length;
  });
  return output;
}
