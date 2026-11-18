export type DecodedJwt = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
};

function decodeObject(segment: string): Record<string, unknown> {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base64.length % 4) % 4);
  const bytes = Uint8Array.from(atob(base64 + padding), (character) => character.charCodeAt(0));
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const value: unknown = JSON.parse(text);
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("JWT header and payload must be JSON objects");
  }
  return value as Record<string, unknown>;
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length < 2 || !parts[0] || !parts[1]) throw new Error("Invalid JWT");
  return { header: decodeObject(parts[0]), payload: decodeObject(parts[1]) };
}

export function jwtClaimDate(seconds: number): Date | null {
  const date = new Date(seconds * 1000);
  return Number.isFinite(date.getTime()) ? date : null;
}
