import { parseHex } from "./color.ts";

export const BOX_SHADOW_LIMITS = {
  layers: 3,
  offset: 100,
  blur: 200,
  spread: 100,
} as const;

export type ShadowLayer = {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
};

export type BoxShadowErrorKey = "layers" | "number" | "color";

export class BoxShadowError extends Error {
  key: BoxShadowErrorKey;

  constructor(key: BoxShadowErrorKey) {
    super(key);
    this.name = "BoxShadowError";
    this.key = key;
  }
}

function validNumber(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function validateLayer(layer: ShadowLayer) {
  if (
    !validNumber(layer.x, -BOX_SHADOW_LIMITS.offset, BOX_SHADOW_LIMITS.offset) ||
    !validNumber(layer.y, -BOX_SHADOW_LIMITS.offset, BOX_SHADOW_LIMITS.offset) ||
    !validNumber(layer.blur, 0, BOX_SHADOW_LIMITS.blur) ||
    !validNumber(layer.spread, -BOX_SHADOW_LIMITS.spread, BOX_SHADOW_LIMITS.spread) ||
    !validNumber(layer.opacity, 0, 100)
  ) {
    throw new BoxShadowError("number");
  }
  if (!parseHex(layer.color)) throw new BoxShadowError("color");
}

function formatNumber(value: number): string {
  return String(Object.is(value, -0) ? 0 : value);
}

export function shadowLayerCss(layer: ShadowLayer): string {
  validateLayer(layer);
  const rgb = parseHex(layer.color)!;
  const alpha = Number((layer.opacity / 100).toFixed(2));
  const inset = layer.inset ? "inset " : "";
  return `${inset}${formatNumber(layer.x)}px ${formatNumber(layer.y)}px ${formatNumber(layer.blur)}px ${formatNumber(layer.spread)}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function boxShadowValue(layers: ShadowLayer[]): string {
  if (layers.length < 1 || layers.length > BOX_SHADOW_LIMITS.layers) {
    throw new BoxShadowError("layers");
  }
  return layers.map(shadowLayerCss).join(", ");
}

export function boxShadowDeclaration(layers: ShadowLayer[]): string {
  const values = layers.map(shadowLayerCss);
  if (values.length < 1 || values.length > BOX_SHADOW_LIMITS.layers) {
    throw new BoxShadowError("layers");
  }
  return values.length === 1
    ? `box-shadow: ${values[0]};`
    : `box-shadow: ${values[0]},\n  ${values.slice(1).join(",\n  ")};`;
}
