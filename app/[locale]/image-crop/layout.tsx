import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { toolJsonLd, toolMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/image-crop">): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata("image-crop", locale);
}

export default async function Layout({ children, params }: LayoutProps<"/[locale]/image-crop">) {
  const { locale } = await params;
  return <><JsonLd data={await toolJsonLd("image-crop", locale)} />{children}</>;
}
