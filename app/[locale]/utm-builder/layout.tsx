import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/utm-builder">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("utm-builder", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/utm-builder">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("utm-builder", locale)} />{children}</>;
}
