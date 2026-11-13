export const UTM_LIMITS = { urlCharacters: 20_000, fieldCharacters: 200, parameters: 200 };

export type UtmFields = {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
};

export type UtmErrorKey = "urlRequired" | "urlTooLong" | "invalidUrl" | "protocol" | "required" | "fieldTooLong" | "parameters";

export class UtmError extends Error {
  key: UtmErrorKey;

  constructor(key: UtmErrorKey) {
    super(key);
    this.key = key;
  }
}

const keys: [keyof UtmFields, string][] = [
  ["source", "utm_source"],
  ["medium", "utm_medium"],
  ["campaign", "utm_campaign"],
  ["term", "utm_term"],
  ["content", "utm_content"],
];
const trackingKeys = new Set(keys.map(([, key]) => key));

export function buildUtmUrl(input: string, fields: UtmFields): string {
  if (input.length > UTM_LIMITS.urlCharacters) throw new UtmError("urlTooLong");
  const value = input.trim();
  if (!value) throw new UtmError("urlRequired");

  const normalized = Object.fromEntries(
    Object.entries(fields).map(([key, field]) => [key, field.trim()]),
  ) as UtmFields;
  if (!normalized.source || !normalized.medium || !normalized.campaign) throw new UtmError("required");
  if (Object.values(normalized).some((field) => field.length > UTM_LIMITS.fieldCharacters)) {
    throw new UtmError("fieldTooLong");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new UtmError("invalidUrl");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new UtmError("protocol");

  // Decode keys for matching only, so unrelated parameters retain their URL encoding.
  const retained = url.search ? url.search.slice(1).split("&").filter((entry) => {
    if (!entry) return true;
    const key = new URLSearchParams(`?${entry}`).keys().next().value;
    return key === undefined || !trackingKeys.has(key);
  }) : [];
  const added = new URLSearchParams();
  for (const [key, utmKey] of keys) {
    if (normalized[key]) added.append(utmKey, normalized[key]);
  }
  if (retained.filter(Boolean).length + added.size > UTM_LIMITS.parameters) throw new UtmError("parameters");
  url.search = [...retained, added.toString()].join("&");
  return url.href;
}
