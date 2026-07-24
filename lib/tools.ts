/** Category keys — resolved to display names via the `categories` messages. */
export type CategoryKey =
  | "encode"
  | "dev"
  | "time"
  | "calc"
  | "generate"
  | "text";

export type Tool = {
  /** Route slug. Also the key into the `tools` messages namespace. */
  slug: string;
  /** Locale-less path, e.g. "/base64". The i18n `Link` adds the locale prefix. */
  href: string;
  /** Emoji / glyph used as a lightweight icon. */
  icon: string;
  /** Grouping key shown on the home page. */
  categoryKey: CategoryKey;
  /** Whether the tool page is live. Un-built tools render as "coming soon". */
  available: boolean;
};

/**
 * The tool registry. Display names and descriptions are *not* here — they live in
 * `messages/<locale>.json` under `tools.<slug>`, so they can be translated.
 */
export const tools: Tool[] = [
  {
    slug: "base64",
    href: "/base64",
    icon: "🔤",
    categoryKey: "encode",
    available: true,
  },
  {
    slug: "url",
    href: "/url",
    icon: "🔗",
    categoryKey: "encode",
    available: true,
  },
  {
    slug: "json",
    href: "/json",
    icon: "{ }",
    categoryKey: "dev",
    available: true,
  },
  {
    slug: "hash",
    href: "/hash",
    icon: "#",
    categoryKey: "dev",
    available: true,
  },
  {
    slug: "timezone",
    href: "/timezone",
    icon: "🕐",
    categoryKey: "time",
    available: true,
  },
  {
    slug: "calculator",
    href: "/calculator",
    icon: "🧮",
    categoryKey: "calc",
    available: true,
  },
  {
    slug: "qrcode",
    href: "/qrcode",
    icon: "📱",
    categoryKey: "generate",
    available: true,
  },
  {
    slug: "password",
    href: "/password",
    icon: "🔑",
    categoryKey: "generate",
    available: true,
  },
  {
    slug: "uuid",
    href: "/uuid",
    icon: "🆔",
    categoryKey: "generate",
    available: true,
  },
  {
    slug: "word-counter",
    href: "/word-counter",
    icon: "📝",
    categoryKey: "text",
    available: true,
  },
  {
    slug: "case-converter",
    href: "/case-converter",
    icon: "🔠",
    categoryKey: "text",
    available: true,
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

/** Locale-independent site facts. Tagline/description live in the messages. */
export const siteConfig = {
  name: "ToolNest",
  githubUrl: "https://github.com/xcy103/toolnest",
  /**
   * Absolute site origin, used for the sitemap and robots. Override with
   * NEXT_PUBLIC_SITE_URL once the custom domain is live.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolnest.vercel.app",
};
