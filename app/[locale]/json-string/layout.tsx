import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/json-string">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("json-string", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/json-string">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("json-string", locale)} />
      {children}
    </>
  );
}
