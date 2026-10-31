import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getAlbumsBySlug, getPage, listPagesByCategory } from "@/lib/content";
import { absoluteMediaUrl, buildPageMetadata, excerptFromHtml } from "@/lib/seo";
import { PageContentView } from "@/components/content/PageContentView";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    listPagesByCategory(locale, "show").map((show) => ({ locale, slug: show.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getPage(locale as Locale, "show", slug);
  if (!page) return { title: "Spectacle" };
  return buildPageMetadata({
    locale: locale as Locale,
    pathWithoutLocale: `/shows/${slug}`,
    title: page.title,
    description: excerptFromHtml(page.bodyHtml),
    image: absoluteMediaUrl(page.headerImage?.localSrc || page.headerImage?.src),
  });
}

export default async function ShowDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = getPage(locale as Locale, "show", slug);
  if (!page) notFound();
  const relatedAlbums = getAlbumsBySlug(page.relatedAlbumSlugs);

  return <PageContentView page={page} relatedAlbums={relatedAlbums} />;
}
