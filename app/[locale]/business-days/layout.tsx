import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/business-days">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("business-days", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/business-days">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("business-days", locale)} />
      {children}
    </>
  );
}
