import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/duration">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("duration", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/duration">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("duration", locale)} />{children}</>;
}
