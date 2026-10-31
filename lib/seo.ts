import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Public base URL of the deployed site, used to build absolute canonical/OG
 * URLs and the sitemap. Override with NEXT_PUBLIC_SITE_URL in production.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sueno-en-fabrica.example.com").replace(
  /\/$/,
  "",
);

/** Builds `{ locale: absoluteUrl }` hreflang alternates for a locale-agnostic path (e.g. "/shows/filaments"). */
export function localeAlternates(pathWithoutLocale: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${SITE_URL}/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
  return languages;
}

export function absoluteMediaUrl(src: string | undefined): string | undefined {
  if (!src) return undefined;
  return src.startsWith("http") ? src : `${SITE_URL}${src}`;
}

/** Plain-text excerpt from the imported body HTML, for meta descriptions. */
export function excerptFromHtml(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Builds full page metadata (title, description, canonical, hreflang, OG, Twitter) for a route. */
export function buildPageMetadata({
  locale,
  pathWithoutLocale,
  title,
  description,
  image,
}: {
  locale: Locale;
  pathWithoutLocale: string;
  title: string;
  description?: string;
  image?: string;
}): Metadata {
  const canonical = `${SITE_URL}/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: localeAlternates(pathWithoutLocale),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Sueño en la Fábrica",
      locale,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
