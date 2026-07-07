export type Tool = {
  /** Route slug, also used as a key. */
  slug: string;
  /** Path, e.g. "/base64". */
  href: string;
  /** Chinese display name. */
  name: string;
  /** Short Chinese description shown on the home card. */
  description: string;
  /** Emoji / glyph used as a lightweight icon. */
  icon: string;
  /** Grouping label shown on the home page. */
  category: string;
  /** Whether the tool page is live. Un-built tools render as "即将上线". */
  available: boolean;
};

export const tools: Tool[] = [
  {
    slug: "base64",
    href: "/base64",
    name: "Base64 编解码",
    description: "文本与 Base64 之间互相编码、解码。",
    icon: "🔤",
    category: "编码",
    available: true,
  },
  {
    slug: "url",
    href: "/url",
    name: "URL 编解码",
    description: "对 URL 及查询参数进行编码与解码。",
    icon: "🔗",
    category: "编码",
    available: false,
  },
  {
    slug: "json",
    href: "/json",
    name: "JSON 工具",
    description: "JSON 格式化、压缩与语法校验。",
    icon: "{ }",
    category: "开发",
    available: false,
  },
  {
    slug: "hash",
    href: "/hash",
    name: "哈希生成",
    description: "生成 MD5、SHA-1、SHA-256 哈希值。",
    icon: "#",
    category: "开发",
    available: false,
  },
  {
    slug: "timezone",
    href: "/timezone",
    name: "时区与时间戳",
    description: "Unix 时间戳与日期互转,多时区实时对照。",
    icon: "🕐",
    category: "时间",
    available: false,
  },
  {
    slug: "calculator",
    href: "/calculator",
    name: "科学计算器",
    description: "基本运算与常见科学函数计算。",
    icon: "🧮",
    category: "计算",
    available: false,
  },
  {
    slug: "qrcode",
    href: "/qrcode",
    name: "二维码生成",
    description: "把文本或链接生成为二维码并下载。",
    icon: "📱",
    category: "生成",
    available: false,
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export const siteConfig = {
  name: "ToolNest",
  tagline: "免费在线工具箱",
  description:
    "ToolNest 是一套免费、快速、纯浏览器运行的在线工具集合,无需注册,数据不出本地。",
  githubUrl: "https://github.com/xcy103/toolnest",
};
