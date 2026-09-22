import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/list-comparison">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("list-comparison", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/list-comparison">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("list-comparison", locale)} />{children}</>;
}
