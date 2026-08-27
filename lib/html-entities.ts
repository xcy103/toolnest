const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
  nbsp: "\u00a0",
  copy: "\u00a9",
  reg: "\u00ae",
  trade: "\u2122",
};

/** Encode the structural HTML characters while leaving regular Unicode readable. */
export function encodeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeNumericEntity(body: string): string | null {
  const isHex = body[1]?.toLowerCase() === "x";
  const digits = isHex ? body.slice(2) : body.slice(1);
  if (!digits || !/^[0-9a-f]+$/i.test(digits)) return null;
  const codePoint = Number.parseInt(digits, isHex ? 16 : 10);
  if (!Number.isInteger(codePoint)) return null;
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return null;
  }
}

/** Decode common named entities plus decimal and hexadecimal numeric entities. */
export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (match, body: string) => {
    if (body.startsWith("#")) return decodeNumericEntity(body) ?? match;
    return namedEntities[body.toLowerCase()] ?? match;
  });
}
