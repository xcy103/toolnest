import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/business-date-calculator">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("business-date-calculator", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/business-date-calculator">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("business-date-calculator", locale)} />
      {children}
    </>
  );
}
