import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/json-yaml">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("json-yaml", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/json-yaml">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("json-yaml", locale)} />
      {children}
    </>
  );
}
