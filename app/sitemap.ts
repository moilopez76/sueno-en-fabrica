import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getRadioContent, listPagesByCategory } from "@/lib/content";
import { localeAlternates, SITE_URL } from "@/lib/seo";

const STATIC_PATHS = ["/", "/shows", "/films", "/radio", "/references", "/downloads", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const { albums } = getRadioContent();
  const dynamicPaths = new Set<string>(STATIC_PATHS);

  for (const locale of routing.locales) {
    for (const show of listPagesByCategory(locale, "show")) dynamicPaths.add(`/shows/${show.slug}`);
    for (const film of listPagesByCategory(locale, "film")) dynamicPaths.add(`/films/${film.slug}`);
  }
  for (const album of albums) dynamicPaths.add(`/radio/${album.slug}`);

  return [...dynamicPaths].flatMap((pathWithoutLocale) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`,
      alternates: { languages: localeAlternates(pathWithoutLocale) },
    })),
  );
}
