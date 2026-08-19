import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

/**
 * The tool page itself is a Client Component, so its metadata lives here: a
 * per-tool title/description/canonical plus the structured-data block.
 */
export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/json-csv">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("json-csv", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/json-csv">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("json-csv", locale)} />
      {children}
    </>
  );
}
