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

  const unrelatedCount = Array.from(url.searchParams).filter(([key]) => !keys.some(([, utmKey]) => key === utmKey)).length;
  const addedCount = keys.filter(([key]) => normalized[key]).length;
  if (unrelatedCount + addedCount > UTM_LIMITS.parameters) throw new UtmError("parameters");

  for (const [key, utmKey] of keys) {
    url.searchParams.delete(utmKey);
    if (normalized[key]) url.searchParams.append(utmKey, normalized[key]);
  }
  return url.href;
}
