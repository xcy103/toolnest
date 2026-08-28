/** Category keys — resolved to display names via the `categories` messages. */
export type CategoryKey =
  | "encode"
  | "dev"
  | "time"
  | "calc"
  | "generate"
  | "text"
  | "color"
  | "image";

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
    slug: "html-entities",
    href: "/html-entities",
    icon: "&lt;&gt;",
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
    slug: "json-csv",
    href: "/json-csv",
    icon: "🧾",
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
    slug: "unix-timestamp",
    href: "/unix-timestamp",
    icon: "⏱",
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
    slug: "unit-converter",
    href: "/unit-converter",
    icon: "📏",
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
  {
    slug: "remove-duplicates",
    href: "/remove-duplicates",
    icon: "≠",
    categoryKey: "text",
    available: true,
  },
  {
    slug: "text-sorter",
    href: "/text-sorter",
    icon: "A↧",
    categoryKey: "text",
    available: true,
  },
  {
    slug: "base-converter",
    href: "/base-converter",
    icon: "🔢",
    categoryKey: "dev",
    available: true,
  },
  {
    slug: "world-clock",
    href: "/world-clock",
    icon: "🌍",
    categoryKey: "time",
    available: true,
  },
  {
    slug: "meeting-planner",
    href: "/meeting-planner",
    icon: "📅",
    categoryKey: "time",
    available: true,
  },
  {
    slug: "countdown",
    href: "/countdown",
    icon: "⏳",
    categoryKey: "time",
    available: true,
  },
  {
    slug: "jwt",
    href: "/jwt",
    icon: "🎫",
    categoryKey: "dev",
    available: true,
  },
  {
    slug: "regex",
    href: "/regex",
    icon: "✳️",
    categoryKey: "dev",
    available: true,
  },
  {
    slug: "cron",
    href: "/cron",
    icon: "⏰",
    categoryKey: "dev",
    available: true,
  },
  {
    slug: "find-replace",
    href: "/find-replace",
    icon: "🔎",
    categoryKey: "text",
    available: true,
  },
  {
    slug: "diff",
    href: "/diff",
    icon: "🔀",
    categoryKey: "text",
    available: true,
  },
  {
    slug: "color-converter",
    href: "/color-converter",
    icon: "🎨",
    categoryKey: "color",
    available: true,
  },
  {
    slug: "contrast",
    href: "/contrast",
    icon: "👁️",
    categoryKey: "color",
    available: true,
  },
  {
    slug: "gradient",
    href: "/gradient",
    icon: "🌈",
    categoryKey: "color",
    available: true,
  },
  {
    slug: "image-compressor",
    href: "/image-compressor",
    icon: "🖼️",
    categoryKey: "image",
    available: true,
  },
  {
    slug: "lorem",
    href: "/lorem",
    icon: "📄",
    categoryKey: "text",
    available: true,
  },
  {
    slug: "markdown",
    href: "/markdown",
    icon: "📖",
    categoryKey: "text",
    available: true,
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

/** Distinct category keys, in the order they first appear in the registry. */
export const categories: CategoryKey[] = tools.reduce<CategoryKey[]>(
  (acc, tool) => (acc.includes(tool.categoryKey) ? acc : [...acc, tool.categoryKey]),
  [],
);

/** Tools belonging to a category, in registry order. */
export function toolsInCategory(category: CategoryKey): Tool[] {
  return tools.filter((tool) => tool.categoryKey === category);
}

/** Type guard: is this string one of the known category keys? */
export function isCategory(value: string): value is CategoryKey {
  return (categories as string[]).includes(value);
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
