import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/date-calculator">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("date-calculator", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/date-calculator">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("date-calculator", locale)} />
      {children}
    </>
  );
}
