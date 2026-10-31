import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Album, PageContent } from "@/lib/content-types";
import { Gallery, VideoEmbeds } from "./MediaBlocks";
import { ExternalLinkList, FileList, PageFooter } from "./LinksAndFiles";
import { AlbumCard } from "./AlbumCard";
import { Carousel } from "./Carousel";

/**
 * Renders a full old-site page (show, film, references, downloads, contact
 * body text...) from its imported content: header image, verbatim body HTML,
 * gallery, video embeds, related albums, downloadable files, external links
 * and the page's own footer credits.
 */
export function PageContentView({ page, relatedAlbums }: { page: PageContent; relatedAlbums: Album[] }) {
  const t = useTranslations("common");

  return (
    <article>
      {page.headerImage?.localSrc && (
        <div className="relative -mx-4 mb-6 overflow-hidden sm:-mx-6 md:mx-0 md:rounded-xl">
          <Image
            src={page.headerImage.localSrc || page.headerImage.src}
            alt={page.headerImage.alt || page.title}
            width={1200}
            height={400}
            className="h-48 w-full object-cover sm:h-64"
            priority
          />
        </div>
      )}

      <h1 className="mb-4 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">{page.title}</h1>

      <div
        className="prose-sueno"
        // Body HTML is sanitized server-side by the importer (scripts/images/
        // iframes stripped into separate arrays) and kept verbatim otherwise.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />

      <VideoEmbeds videos={page.videos} />
      <Gallery images={page.gallery} label={t("gallery")} />
      <FileList files={page.files} />
      <ExternalLinkList links={page.externalLinks} />

      {relatedAlbums.length > 0 && (
        <Carousel title={t("relatedAlbums")}>
          {relatedAlbums.map((album) => (
            <AlbumCard key={album.slug} album={album} />
          ))}
        </Carousel>
      )}

      <PageFooter html={page.footerHtml} />
    </article>
  );
}
