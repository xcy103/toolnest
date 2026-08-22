import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

/**
 * The tool page itself is a Client Component, so its metadata lives here: a
 * per-tool title/description/canonical plus the structured-data block.
 */
export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/find-replace">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("find-replace", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/find-replace">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("find-replace", locale)} />
      {children}
    </>
  );
}
