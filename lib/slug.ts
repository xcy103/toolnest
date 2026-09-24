export type SlugOptions = {
  separator: "-" | "_";
  lowercase: boolean;
  collapseSeparators: boolean;
};

export function generateSlug(input: string, options: SlugOptions): string {
  const normalized = input
    .normalize("NFKD")
    .replace(/(\p{Script=Latin})\p{M}+/gu, "$1");
  const text = options.lowercase ? normalized.toLowerCase() : normalized;
  const boundary = options.collapseSeparators
    ? /[^\p{L}\p{N}\p{M}]+/gu
    : /[^\p{L}\p{N}\p{M}]/gu;
  return text
    .replace(boundary, options.separator)
    .replace(new RegExp(`^${options.separator}+|${options.separator}+$`, "g"), "");
}
