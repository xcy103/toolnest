import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/border-radius">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("border-radius", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/border-radius">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("border-radius", locale)} />{children}</>;
}
