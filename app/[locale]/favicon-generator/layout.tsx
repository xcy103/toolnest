import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/favicon-generator">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("favicon-generator", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/favicon-generator">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("favicon-generator", locale)} />{children}</>;
}
