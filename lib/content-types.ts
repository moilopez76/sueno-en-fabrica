/**
 * Shared content types produced by scripts/import-old-site.ts and consumed by
 * the app. Every field is sourced verbatim from the old suenoenlafabrica.com
 * site; nothing here should be invented by hand.
 */

export type Locale = "fr" | "en" | "es";

export interface ImageAsset {
  /** Original absolute URL on the old site. */
  src: string;
  /** Path under /public, e.g. "/media/images/photos/qui_article/didier-boyat.jpg". */
  localSrc: string;
  alt: string;
  /** Caption text extracted from captify-style tooltip captions, if present. */
  caption?: string;
  /** Photo credit, when it could be associated with this image. */
  credit?: string;
  width?: number;
  height?: number;
}

export interface VideoEmbed {
  provider: "youtube" | "vimeo" | "spotify" | "other";
  url: string;
  title?: string;
}

export interface FileAsset {
  /** Original absolute URL on the old site. */
  href: string;
  /** Path under /public, e.g. "/media/files/downloads/dossier.pdf". */
  localHref: string;
  label: string;
  /** File extension, lowercase, without dot. */
  type: string;
}

export interface LinkRef {
  href: string;
  label: string;
  external: boolean;
}

export interface PageContent {
  slug: string;
  category: "home" | "show" | "film" | "radio" | "references" | "downloads" | "contact";
  locale: Locale;
  oldFile: string;
  oldUrl: string;
  title: string;
  headerImage?: ImageAsset;
  /** Sanitized inner HTML of the old #text content area, with asset URLs rewritten to local paths. Verbatim text/markup from the source page. */
  bodyHtml: string;
  videos: VideoEmbed[];
  gallery: ImageAsset[];
  files: FileAsset[];
  externalLinks: LinkRef[];
  relatedAlbumSlugs: string[];
  /** Verbatim HTML of the old #copyright footer for this exact page (credits sometimes vary per page, e.g. extra photographer credits). */
  footerHtml: string;
}

export interface NavItem {
  slug: string;
  title: string;
}

export interface FunderLogo {
  image: ImageAsset;
  label: string;
}

export interface SiteContent {
  locale: Locale;
  logo: ImageAsset;
  shows: NavItem[];
  films: NavItem[];
  managedBy: { label: string; link: LinkRef; logo: ImageAsset };
  funders: FunderLogo[];
  footerHtml: string;
}

export interface Track {
  /** Original mp3 filename on the old site, used as a stable id. */
  file: string;
  title: string;
  audioSrc: string;
  localAudioSrc: string;
}

export interface Album {
  slug: string;
  title: string;
  subtitle?: string;
  cover: ImageAsset;
  tracks: Track[];
  random?: boolean;
}

export interface RadioContent {
  defaultAlbum: string;
  albums: Album[];
}
