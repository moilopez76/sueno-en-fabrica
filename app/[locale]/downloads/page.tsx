import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPage } from "@/lib/content";
import { absoluteMediaUrl, buildPageMetadata, excerptFromHtml } from "@/lib/seo";
import { PageContentView } from "@/components/content/PageContentView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = getPage(locale as Locale, "downloads", "");
  return buildPageMetadata({
    locale: locale as Locale,
    pathWithoutLocale: "/downloads",
    title: page?.title ?? "Téléchargements",
    description: page ? excerptFromHtml(page.bodyHtml) : undefined,
    image: absoluteMediaUrl(page?.headerImage?.localSrc || page?.headerImage?.src),
  });
}

export default async function DownloadsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = getPage(locale as Locale, "downloads", "");
  if (!page) notFound();
  return <PageContentView page={page} relatedAlbums={[]} />;
}
