/** Encode every input character, including whitespace, as UTF-8 Base64. */
export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

/** Decode UTF-8 text, tolerating whitespace in pasted Base64. */
export function decodeBase64(input: string): string {
  const binary = atob(input.replace(/\s+/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  // A leading BOM is part of the user's text, not a file-encoding directive.
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
}
