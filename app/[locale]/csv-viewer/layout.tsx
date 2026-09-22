import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/csv-viewer">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("csv-viewer", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/csv-viewer">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("csv-viewer", locale)} />{children}</>;
}
