export type UrlCodecScope = "component" | "uri";

/** Preserve all source characters; component scope also escapes URL delimiters. */
export function encodeUrl(text: string, scope: UrlCodecScope): string {
  return scope === "component" ? encodeURIComponent(text) : encodeURI(text);
}

/** Decode percent escapes without trimming meaningful source whitespace. */
export function decodeUrl(text: string, scope: UrlCodecScope): string {
  return scope === "component" ? decodeURIComponent(text) : decodeURI(text);
}
