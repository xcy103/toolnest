import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/aspect-ratio">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("aspect-ratio", locale);
}
export default async function Layout({ children, params }: LayoutProps<"/[locale]/aspect-ratio">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("aspect-ratio", locale)} />{children}</>;
}
