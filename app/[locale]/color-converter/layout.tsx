import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

/**
 * The tool page itself is a Client Component, so its metadata lives here: a
 * per-tool title/description/canonical plus the structured-data block.
 */
export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/color-converter">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("color-converter", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/color-converter">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("color-converter", locale)} />
      {children}
    </>
  );
}
