import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPage, getRadioContent } from "@/lib/content";
import { buildPageMetadata, excerptFromHtml } from "@/lib/seo";
import { AlbumCard } from "@/components/content/AlbumCard";
import { PlayAllButton } from "@/components/content/PlayButtons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = getPage(locale as Locale, "radio", "");
  return buildPageMetadata({
    locale: locale as Locale,
    pathWithoutLocale: "/radio",
    title: "Radio Sueño",
    description: page ? excerptFromHtml(page.bodyHtml) : undefined,
  });
}

export default async function RadioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  const page = getPage(locale as Locale, "radio", "");
  const { albums } = getRadioContent();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{t("radio")}</h1>
      {page?.bodyHtml && (
        <div
          className="prose-sueno mb-6"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      )}
      <PlayAllButton albums={albums} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {albums.map((album) => (
          <AlbumCard key={album.slug} album={album} />
        ))}
      </div>
    </div>
  );
}
