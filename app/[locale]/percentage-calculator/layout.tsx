import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/percentage-calculator">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("percentage-calculator", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/percentage-calculator">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("percentage-calculator", locale)} />{children}</>;
}
