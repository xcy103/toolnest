import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/remove-duplicates">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("remove-duplicates", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/remove-duplicates">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("remove-duplicates", locale)} />
      {children}
    </>
  );
}
