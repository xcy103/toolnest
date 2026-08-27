import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/html-entities">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("html-entities", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/html-entities">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("html-entities", locale)} />
      {children}
    </>
  );
}
