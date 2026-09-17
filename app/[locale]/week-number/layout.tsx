import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/week-number">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("week-number", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/week-number">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("week-number", locale)} />{children}</>;
}
