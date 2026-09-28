export const URL_PARSER_LIMITS = { characters: 20_000, parameters: 200 };

export type UrlParserErrorKey = "empty" | "tooLong" | "base" | "invalid" | "parameters";

export class UrlParserError extends Error {
  key: UrlParserErrorKey;

  constructor(key: UrlParserErrorKey) {
    super(key);
    this.key = key;
  }
}

export type ParsedUrl = {
  href: string;
  protocol: string;
  origin: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  username: string;
  password: string;
  parameters: [string, string][];
};

export function parseUrl(input: string, base = ""): ParsedUrl {
  if (input.length > URL_PARSER_LIMITS.characters || base.length > URL_PARSER_LIMITS.characters) {
    throw new UrlParserError("tooLong");
  }
  const value = input.trim();
  if (!value) throw new UrlParserError("empty");
  let baseUrl: URL | undefined;
  if (base.trim()) {
    try {
      baseUrl = new URL(base.trim());
      if (!["http:", "https:", "ftp:", "ws:", "wss:", "file:"].includes(baseUrl.protocol)) throw new Error("base");
    } catch {
      throw new UrlParserError("base");
    }
  }
  let url: URL;
  try {
    url = new URL(value, baseUrl);
  } catch {
    throw new UrlParserError("invalid");
  }
  const parameters: [string, string][] = [];
  for (const pair of url.searchParams) {
    if (parameters.length === URL_PARSER_LIMITS.parameters) throw new UrlParserError("parameters");
    parameters.push(pair);
  }
  return {
    href: url.href, protocol: url.protocol, origin: url.origin,
    hostname: url.hostname, port: url.port, pathname: url.pathname,
    search: url.search, hash: url.hash, username: url.username,
    password: url.password, parameters,
  };
}
