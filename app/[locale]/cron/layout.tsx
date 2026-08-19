import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

/**
 * The tool page itself is a Client Component, so its metadata lives here: a
 * per-tool title/description/canonical plus the structured-data block.
 */
export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/cron">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("cron", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/cron">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("cron", locale)} />
      {children}
    </>
  );
}
