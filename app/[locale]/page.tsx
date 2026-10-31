import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getHomePage, getRadioContent, getSiteContent, listPagesByCategory } from "@/lib/content";
import { absoluteMediaUrl, buildPageMetadata, excerptFromHtml } from "@/lib/seo";
import { VideoEmbeds, Gallery } from "@/components/content/MediaBlocks";
import { ExternalLinkList } from "@/components/content/LinksAndFiles";
import { Carousel } from "@/components/content/Carousel";
import { AlbumCard } from "@/components/content/AlbumCard";
import { PageCard } from "@/components/content/PageCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = getHomePage(locale as Locale);
  return buildPageMetadata({
    locale: locale as Locale,
    pathWithoutLocale: "/",
    title: page.title,
    description: excerptFromHtml(page.bodyHtml),
    image: absoluteMediaUrl(page.headerImage?.localSrc || page.headerImage?.src),
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  const page = getHomePage(locale as Locale);
  const site = getSiteContent(locale as Locale);
  const { albums } = getRadioContent();
  const shows = listPagesByCategory(locale as Locale, "show");
  const films = listPagesByCategory(locale as Locale, "film");

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{page.title}</h1>

      <div
        className="prose-sueno"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />

      <VideoEmbeds videos={page.videos} />
      <Gallery images={page.gallery.filter((img) => !img.caption)} label={t("gallery")} />

      <Carousel title={t("albums")}>
        {albums.map((album) => (
          <AlbumCard key={album.slug} album={album} />
        ))}
      </Carousel>

      <Carousel title="Spectacles">
        {shows.map((show) => (
          <PageCard key={show.slug} href={`/shows/${show.slug}`} title={show.title} image={show.headerImage} />
        ))}
      </Carousel>

      <Carousel title="Films">
        {films.map((film) => (
          <PageCard key={film.slug} href={`/films/${film.slug}`} title={film.title} image={film.headerImage} />
        ))}
      </Carousel>

      <section className="my-8" aria-label={t("supportedBy")}>
        <h2 className="mb-3 text-lg font-bold sm:text-xl">{t("managedBy")}</h2>
        <a
          href={site.managedBy.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-col items-center gap-2"
        >
          {site.managedBy.logo.localSrc && (
            <Image
              src={site.managedBy.logo.localSrc || site.managedBy.logo.src}
              alt={site.managedBy.logo.alt}
              width={160}
              height={80}
              className="h-16 w-auto object-contain"
            />
          )}
          <span className="text-sm text-[var(--foreground-muted)]">{site.managedBy.label}</span>
        </a>

        <h2 className="mb-3 mt-6 text-lg font-bold sm:text-xl">{t("supportedBy")}</h2>
        <ul className="flex flex-wrap items-center gap-6">
          {site.funders.map((funder, i) => (
            <li key={i} className="flex flex-col items-center gap-1 text-center">
              {funder.image.localSrc && (
                <Image
                  src={funder.image.localSrc || funder.image.src}
                  alt={funder.image.alt}
                  width={80}
                  height={80}
                  className="h-14 w-14 object-contain"
                />
              )}
              <span className="max-w-[7rem] text-xs text-[var(--foreground-muted)]">{funder.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <ExternalLinkList links={page.externalLinks} />
    </div>
  );
}
