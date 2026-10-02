import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/json-path-explorer">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("json-path-explorer", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/json-path-explorer">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("json-path-explorer", locale)} />{children}</>;
}
