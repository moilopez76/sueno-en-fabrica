/**
 * Canonical registry of every page on the old PHP site, mapping old filenames
 * to the new category + slug used throughout the importer, redirects and app
 * routes. This is the single source of truth: keep it in sync with the pages
 * listed in the importer.
 */
export type PageCategory = "home" | "show" | "film" | "radio" | "references" | "downloads" | "contact";

export interface OldPageEntry {
  /** Old PHP filename, e.g. "we-nous-nosotros.php" */
  file: string;
  category: PageCategory;
  /** New slug under its category, e.g. "we-nous-nosotros" */
  slug: string;
}

export const OLD_PAGES: OldPageEntry[] = [
  { file: "index.php", category: "home", slug: "" },
  { file: "we-nous-nosotros.php", category: "show", slug: "we-nous-nosotros" },
  { file: "filaments.php", category: "show", slug: "filaments" },
  { file: "eloge-de-l-arbre.php", category: "show", slug: "eloge-de-l-arbre" },
  { file: "valparaiso-le-cap.php", category: "show", slug: "valparaiso-le-cap" },
  { file: "concert-sueno-en-la-fabrica.php", category: "show", slug: "concert-sueno-en-la-fabrica" },
  { file: "harmonie-des-spheres.php", category: "show", slug: "harmonie-des-spheres" },
  { file: "le-reve-d-herbert.php", category: "show", slug: "le-reve-d-herbert" },
  { file: "retro-latino-trio.php", category: "show", slug: "retro-latino-trio" },
  { file: "nimbaya.php", category: "show", slug: "nimbaya" },
  { file: "tissages.php", category: "show", slug: "tissages" },
  { file: "film-etincelles.php", category: "film", slug: "etincelles" },
  { file: "film-cosmos-emaux.php", category: "film", slug: "cosmos-emaux" },
  { file: "film-envol-batisseurs.php", category: "film", slug: "envol-batisseurs" },
  { file: "film-semer-cest-saimer.php", category: "film", slug: "semer-cest-saimer" },
  { file: "film-chez-rogelio.php", category: "film", slug: "chez-rogelio" },
  { file: "radio-music.php", category: "radio", slug: "" },
  { file: "references.php", category: "references", slug: "" },
  { file: "downloads.php", category: "downloads", slug: "" },
  { file: "contact.php", category: "contact", slug: "" },
];

export function newPathFor(entry: OldPageEntry, locale: string): string {
  const base = `/${locale}`;
  switch (entry.category) {
    case "home":
      return base || "/";
    case "show":
      return `${base}/shows/${entry.slug}`;
    case "film":
      return `${base}/films/${entry.slug}`;
    case "radio":
      return `${base}/radio`;
    case "references":
      return `${base}/references`;
    case "downloads":
      return `${base}/downloads`;
    case "contact":
      return `${base}/contact`;
    default:
      return base;
  }
}
