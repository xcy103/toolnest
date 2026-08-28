import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/unix-timestamp">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("unix-timestamp", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/unix-timestamp">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("unix-timestamp", locale)} />
      {children}
    </>
  );
}
