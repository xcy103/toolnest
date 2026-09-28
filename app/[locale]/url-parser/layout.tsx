import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/url-parser">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("url-parser", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/url-parser">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("url-parser", locale)} />{children}</>;
}
