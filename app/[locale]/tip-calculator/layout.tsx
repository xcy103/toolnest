import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/tip-calculator">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("tip-calculator", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/tip-calculator">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("tip-calculator", locale)} />
      {children}
    </>
  );
}
