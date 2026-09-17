import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/weekday">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("weekday", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/weekday">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("weekday", locale)} />{children}</>;
}
