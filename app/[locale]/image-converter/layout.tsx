import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/image-converter">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("image-converter", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/image-converter">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("image-converter", locale)} />{children}</>;
}
