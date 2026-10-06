import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/px-rem">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("px-rem", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/px-rem">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("px-rem", locale)} />
      {children}
    </>
  );
}
