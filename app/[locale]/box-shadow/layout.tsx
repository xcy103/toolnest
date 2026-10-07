import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/box-shadow">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("box-shadow", locale);
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]/box-shadow">) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={await toolJsonLd("box-shadow", locale)} />
      {children}
    </>
  );
}
