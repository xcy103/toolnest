import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/text-sorter">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("text-sorter", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/text-sorter">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("text-sorter", locale)} />
      {children}
    </>
  );
}
