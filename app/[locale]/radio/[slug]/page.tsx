import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getRadioContent, listPagesByCategory } from "@/lib/content";
import { absoluteMediaUrl, buildPageMetadata, SITE_URL } from "@/lib/seo";
import { TrackList } from "@/components/content/TrackList";
import { PlayAlbumButton } from "@/components/content/PlayButtons";
import { PageCard } from "@/components/content/PageCard";
import { Carousel } from "@/components/content/Carousel";
import { AlbumGlow } from "@/components/content/AlbumGlow";

export function generateStaticParams() {
  const { albums } = getRadioContent();
  return routing.locales.flatMap((locale) => albums.map((album) => ({ locale, slug: album.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { albums } = getRadioContent();
  const album = albums.find((a) => a.slug === slug);
  if (!album) return { title: "Album" };
  return buildPageMetadata({
    locale: locale as Locale,
    pathWithoutLocale: `/radio/${slug}`,
    title: album.title,
    description: album.subtitle,
    image: absoluteMediaUrl(album.cover.localSrc || album.cover.src),
  });
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { albums } = getRadioContent();
  const album = albums.find((a) => a.slug === slug);
  if (!album) notFound();

  const shows = listPagesByCategory(locale as Locale, "show").filter((p) =>
    p.relatedAlbumSlugs.includes(album.slug),
  );
  const films = listPagesByCategory(locale as Locale, "film").filter((p) =>
    p.relatedAlbumSlugs.includes(album.slug),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: album.title,
    byArtist: { "@type": "MusicGroup", name: "Sueño en la Fábrica" },
    image: absoluteMediaUrl(album.cover.localSrc || album.cover.src),
    url: `${SITE_URL}/${locale}/radio/${album.slug}`,
    track: album.tracks.map((t) => ({ "@type": "MusicRecording", name: t.title })),
  };

  return (
    <div className="relative">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AlbumGlow src={album.cover.localSrc || album.cover.src} />
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <Image
          src={album.cover.localSrc || album.cover.src}
          alt={album.cover.alt || album.title}
          width={240}
          height={240}
          className="h-48 w-48 flex-shrink-0 rounded-lg object-cover shadow-lg sm:h-56 sm:w-56"
          priority
        />
        <div>
          <h1 className="text-2xl font-bold sm:text-4xl">{album.title}</h1>
          {album.subtitle && <p className="mt-1 text-[var(--foreground-muted)]">{album.subtitle}</p>}
        </div>
      </div>

      <PlayAlbumButton album={album} />
      <TrackList album={album} />

      {(shows.length > 0 || films.length > 0) && (
        <Carousel title="Spectacles & Films">
          {[...shows, ...films].map((p) => (
            <PageCard
              key={`${p.category}-${p.slug}`}
              href={`/${p.category === "show" ? "shows" : "films"}/${p.slug}`}
              title={p.title}
              image={p.headerImage}
            />
          ))}
        </Carousel>
      )}
    </div>
  );
}
