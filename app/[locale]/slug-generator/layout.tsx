import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/slug-generator">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("slug-generator", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/slug-generator">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("slug-generator", locale)} />{children}</>;
}
