import { OLD_PAGES, newPathFor } from "./pages";
import { locales } from "../i18n/routing";

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: { type: "query"; key: string; value: string }[];
};

/**
 * Builds a redirect for every old-site URL (`/file.php` and `/file.php?lang=xx`)
 * to its new localized route, so bookmarks and search engine links keep working.
 */
export function buildOldSiteRedirects(): Redirect[] {
  const redirects: Redirect[] = [];

  for (const entry of OLD_PAGES) {
    const source = `/${entry.file}`;

    // No ?lang= query -> old site defaulted to French.
    redirects.push({
      source,
      destination: newPathFor(entry, "fr"),
      permanent: true,
    });

    for (const locale of locales) {
      redirects.push({
        source,
        has: [{ type: "query", key: "lang", value: locale }],
        destination: newPathFor(entry, locale),
        permanent: true,
      });
    }
  }

  return redirects;
}

export const oldSiteRedirects = buildOldSiteRedirects();
