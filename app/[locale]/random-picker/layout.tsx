import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/random-picker">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("random-picker", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/random-picker">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("random-picker", locale)} />{children}</>;
}
