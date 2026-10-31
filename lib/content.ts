import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Locale, PageContent, RadioContent, SiteContent } from "./content-types";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(relPath: string): T {
  const full = path.join(CONTENT_DIR, relPath);
  const raw = fs.readFileSync(full, "utf-8");
  return JSON.parse(raw) as T;
}

export function getSiteContent(locale: Locale): SiteContent {
  return readJson<SiteContent>(`site.${locale}.json`);
}

export function getRadioContent(): RadioContent {
  return readJson<RadioContent>("radio.json");
}

function pageFileName(category: PageContent["category"], slug: string): string {
  if (category === "home") return "home";
  return slug ? `${category}-${slug}` : category;
}

export function getPage(locale: Locale, category: PageContent["category"], slug: string): PageContent | null {
  try {
    return readJson<PageContent>(`${locale}/${pageFileName(category, slug)}.json`);
  } catch {
    return null;
  }
}

export function getHomePage(locale: Locale): PageContent {
  const page = getPage(locale, "home", "");
  if (!page) throw new Error(`Missing home page content for locale "${locale}". Run \`npm run import\`.`);
  return page;
}

export function listPagesByCategory(locale: Locale, category: "show" | "film"): PageContent[] {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(`${category}-`) && f.endsWith(".json"))
    .map((f) => readJson<PageContent>(`${locale}/${f}`))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getAlbumsBySlug(slugs: string[]): ReturnType<typeof getRadioContent>["albums"] {
  const { albums } = getRadioContent();
  return albums.filter((a) => slugs.includes(a.slug));
}
