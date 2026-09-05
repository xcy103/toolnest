import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/image-resizer">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("image-resizer", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/image-resizer">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("image-resizer", locale)} />{children}</>;
}
