import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/bmi-calculator">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("bmi-calculator", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/bmi-calculator">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("bmi-calculator", locale)} />{children}</>;
}
