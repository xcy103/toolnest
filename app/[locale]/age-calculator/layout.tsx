import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/age-calculator">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("age-calculator", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/age-calculator">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("age-calculator", locale)} />{children}</>;
}
