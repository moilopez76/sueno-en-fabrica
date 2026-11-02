import { OLD_PAGES, newPathFor } from "./pages";
import { locales } from "../i18n/routing";

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: { type: "query"; key: string; value: string }[];
  missing?: { type: "query"; key: string }[];
};

/**
 * Builds a redirect for every old-site URL (`/file.php` and `/file.php?lang=xx`)
 * to its new localized route, so bookmarks and search engine links keep working.
 */
export function buildOldSiteRedirects(): Redirect[] {
  const redirects: Redirect[] = [];

  for (const entry of OLD_PAGES) {
    const source = `/${entry.file}`;

    for (const locale of locales) {
      redirects.push({
        source,
        has: [{ type: "query", key: "lang", value: locale }],
        destination: newPathFor(entry, locale),
        permanent: true,
      });
    }

    // No ?lang= query -> old site defaulted to French. This must come after the
    // locale-specific rules above, and only match when `lang` is absent,
    // otherwise it would shadow them (Next.js uses the first matching rule).
    redirects.push({
      source,
      missing: [{ type: "query", key: "lang" }],
      destination: newPathFor(entry, "fr"),
      permanent: true,
    });
  }

  return redirects;
}

export const oldSiteRedirects = buildOldSiteRedirects();
