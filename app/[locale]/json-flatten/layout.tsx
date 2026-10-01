import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/json-flatten">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("json-flatten", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/json-flatten">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("json-flatten", locale)} />{children}</>;
}
