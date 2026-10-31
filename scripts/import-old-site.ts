/**
 * Imports https://www.suenoenlafabrica.com into typed JSON content files
 * under /content and mirrors referenced media under /public/media.
 *
 * Usage:
 *   npm run import
 *   ASSET_MODE=remote npm run import      # don't download images/files, link to old server
 *   AUDIO_MODE=local npm run import       # also mirror every mp3 locally (large download)
 *
 * Nothing here invents content: every string, link, image and track comes
 * directly from the live site at crawl time.
 */
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import fs from "node:fs/promises";
import path from "node:path";
import { OLD_PAGES, type OldPageEntry } from "../lib/pages";
import type {
  Album,
  FileAsset,
  FunderLogo,
  ImageAsset,
  LinkRef,
  Locale,
  NavItem,
  PageContent,
  RadioContent,
  SiteContent,
  Track,
  VideoEmbed,
} from "../lib/content-types";

const BASE_URL = "https://www.suenoenlafabrica.com";
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const MEDIA_DIR = path.join(ROOT, "public", "media");

// "local" downloads the asset into /public/media; "remote" keeps pointing at
// the old server. Images/files default to local (small); audio defaults to
// remote because the full catalogue is several hundred MB - set
// AUDIO_MODE=local to mirror it too.
const ASSET_MODE = (process.env.ASSET_MODE ?? "local") as "local" | "remote";
const AUDIO_MODE = (process.env.AUDIO_MODE ?? "remote") as "local" | "remote";

const LOCALES: Locale[] = ["fr", "en", "es"];

const assetMap = new Map<string, string>();
const downloadFailures: string[] = [];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SuenoImporter/1.0; +https://github.com/)" },
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SuenoImporter/1.0; +https://github.com/)" },
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function resolveUrl(src: string | undefined | null): string | undefined {
  if (!src) return undefined;
  try {
    return new URL(src, `${BASE_URL}/`).toString();
  } catch {
    return undefined;
  }
}

function relPathFromOldUrl(absUrl: string): string {
  const u = new URL(absUrl);
  return decodeURIComponent(u.pathname.replace(/^\/+/, ""));
}

// Large binary archives (full album .rar/.zip downloads) stay on the old
// server even in "local" mode; mirroring hundreds of MB of zipped audio into
// this repo isn't practical. Only applies to "file" assets, not images/audio.
const MAX_LOCAL_FILE_BYTES = 20 * 1024 * 1024;

async function headContentLength(url: string): Promise<number | undefined> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const len = res.headers.get("content-length");
    return len ? Number(len) : undefined;
  } catch {
    return undefined;
  }
}

/** Downloads (or links to) an asset, returning the path to use in the new site. */
async function resolveAsset(absUrl: string | undefined, kind: "image" | "file" | "audio"): Promise<string> {
  if (!absUrl) return "";
  const mode = kind === "audio" ? AUDIO_MODE : ASSET_MODE;

  if (mode === "remote") {
    return absUrl;
  }

  if (assetMap.has(absUrl)) return assetMap.get(absUrl)!;

  if (kind === "file") {
    const size = await headContentLength(absUrl);
    if (size !== undefined && size > MAX_LOCAL_FILE_BYTES) {
      console.log(`  skipping large file (${(size / 1024 / 1024).toFixed(0)} MB, kept remote): ${absUrl}`);
      assetMap.set(absUrl, absUrl);
      return absUrl;
    }
  }

  const relPath = relPathFromOldUrl(absUrl);
  const localPublicPath = `/media/${relPath}`;
  const diskPath = path.join(MEDIA_DIR, relPath);

  let alreadyOnDisk = false;
  try {
    await fs.access(diskPath);
    alreadyOnDisk = true;
  } catch {
    // not downloaded yet
  }

  if (!alreadyOnDisk) {
    try {
      await fs.mkdir(path.dirname(diskPath), { recursive: true });
      const buf = await fetchBuffer(absUrl);
      await fs.writeFile(diskPath, buf);
      console.log(`  downloaded ${relPath} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.warn(`  WARN: failed to download ${absUrl}: ${(err as Error).message}`);
      downloadFailures.push(absUrl);
      assetMap.set(absUrl, absUrl);
      return absUrl;
    }
  }

  assetMap.set(absUrl, localPublicPath);
  return localPublicPath;
}

function stripHtml(html: string): string {
  return cheerio.load(`<div>${html}</div>`)("div").text().replace(/\s+/g, " ").trim();
}

function isExternal(href: string): boolean {
  try {
    const u = new URL(href, `${BASE_URL}/`);
    return u.hostname !== new URL(BASE_URL).hostname;
  } catch {
    return false;
  }
}

const FILE_EXTENSIONS = ["pdf", "zip", "doc", "docx", "ppt", "pptx", "rar"];

type Cheerio$ = ReturnType<typeof cheerio.load>;
type CheerioSel = ReturnType<Cheerio$>;

/** Text content of an element, turning <br> into a space so adjacent lines don't run together. */
function textWithBreaks($el: CheerioSel): string {
  const clone = $el.clone();
  clone.find("br").replaceWith(" ");
  return clone.text().replace(/\s+/g, " ").trim();
}

async function extractImage($: Cheerio$, el: AnyNode): Promise<ImageAsset> {
  const $el = $(el);
  const absSrc = resolveUrl($el.attr("src"));
  const localSrc = await resolveAsset(absSrc, "image");
  const rel = $el.attr("rel");
  let caption: string | undefined;
  if (rel) {
    const capEl = $(`#${rel}`);
    if (capEl.length) {
      caption = textWithBreaks(capEl);
    }
  }
  const width = $el.attr("width") ? Number($el.attr("width")) : undefined;
  const height = $el.attr("height") ? Number($el.attr("height")) : undefined;
  return {
    src: absSrc ?? "",
    localSrc,
    alt: $el.attr("alt") ?? "",
    caption: caption || undefined,
    width: Number.isFinite(width) ? width : undefined,
    height: Number.isFinite(height) ? height : undefined,
  };
}

function videoFromIframeSrc(src: string): VideoEmbed | undefined {
  const abs = resolveUrl(src);
  if (!abs) return undefined;
  if (abs.includes("youtube.com") || abs.includes("youtu.be")) {
    return { provider: "youtube", url: abs };
  }
  if (abs.includes("vimeo.com")) {
    return { provider: "vimeo", url: abs };
  }
  if (abs.includes("spotify.com")) {
    return { provider: "spotify", url: abs };
  }
  return { provider: "other", url: abs };
}

const STOPWORDS = new Set([
  "de", "la", "le", "les", "du", "des", "el", "en", "the", "and", "et", "a", "au", "aux", "d", "l",
  "con", "los", "las", "en", "un", "une", "su", "sur", "avec", "live", "trio",
]);

function normalizeWords(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
  return new Set(normalized.split(/\s+/).filter((w) => w.length >= 4 && !STOPWORDS.has(w)));
}

function relatedAlbums(pageTitle: string, slug: string, albums: Album[]): string[] {
  const pageWords = new Set([...normalizeWords(pageTitle), ...normalizeWords(slug.replace(/-/g, " "))]);
  const matches: string[] = [];
  for (const album of albums) {
    const albumWords = new Set([...normalizeWords(album.title), ...normalizeWords(album.subtitle ?? "")]);
    const shared = [...pageWords].some((w) => albumWords.has(w));
    if (shared) matches.push(album.slug);
  }
  return matches;
}

// ---------------------------------------------------------------------------
// Radio / playlist
// ---------------------------------------------------------------------------

async function importRadio(): Promise<RadioContent> {
  console.log("\n== Radio Sueño playlist ==");
  const radioHtml = await fetchText(`${BASE_URL}/radio-music.php?lang=fr`);
  const $ = cheerio.load(radioHtml);

  const defaultAlbumMatch = radioHtml.match(/var\s+defaultAlbum\s*=\s*"([^"]+)"/);
  const defaultAlbum = defaultAlbumMatch?.[1] ?? "alma";

  type AlbumMeta = { slug: string; title: string; subtitle?: string; cover: string; random: boolean };
  const albumMeta: AlbumMeta[] = [];
  for (const img of $(".albums-grid img").toArray()) {
    const $img = $(img);
    const slug = $img.attr("data-album");
    if (!slug) continue;
    const altHtml = $img.attr("alt") ?? "";
    const $alt = cheerio.load(`<div>${altHtml}</div>`);
    const bold = $alt("b").first().text().trim();
    const em = $alt("em").first().text().trim();
    const cover = resolveUrl($img.attr("src")) ?? "";
    albumMeta.push({
      slug,
      title: bold || em || slug,
      subtitle: bold && em ? em : undefined,
      cover,
      random: $img.attr("data-random") === "true",
    });
  }

  const jsUrl = `${BASE_URL}/audio/radio/radio-sueno.js`;
  const js = await fetchText(jsUrl);
  const trackLines = js.matchAll(/(\w+)\s*\[\s*["']([^"']+)["']\s*\]\s*=\s*["']([^"']*)["']\s*;/g);
  const tracksByAlbum = new Map<string, { file: string; title: string }[]>();
  for (const match of trackLines) {
    const [, varName, file, title] = match;
    if (!tracksByAlbum.has(varName)) tracksByAlbum.set(varName, []);
    tracksByAlbum.get(varName)!.push({ file, title });
  }

  const albums: Album[] = [];
  for (const meta of albumMeta) {
    const rawTracks = tracksByAlbum.get(meta.slug) ?? [];
    if (rawTracks.length === 0) {
      console.warn(`  WARN: no tracks found in radio-sueno.js for album "${meta.slug}"`);
    }
    const tracks: Track[] = [];
    for (const t of rawTracks) {
      const audioSrc = `${BASE_URL}/audio/radio/${meta.slug}/${t.file}`;
      const localAudioSrc = await resolveAsset(audioSrc, "audio");
      tracks.push({ file: t.file, title: t.title, audioSrc, localAudioSrc });
    }
    const coverLocal = await resolveAsset(meta.cover, "image");
    albums.push({
      slug: meta.slug,
      title: meta.title,
      subtitle: meta.subtitle,
      cover: { src: meta.cover, localSrc: coverLocal, alt: meta.title },
      tracks,
      random: meta.random,
    });
    console.log(`  ${meta.slug}: ${tracks.length} tracks`);
  }

  if (albums.every((a) => a.tracks.length === 0)) {
    console.error("Could not locate any playlist tracks. Aborting radio import - please check radio-sueno.js manually.");
  }

  return { defaultAlbum, albums };
}

// ---------------------------------------------------------------------------
// Site navigation / chrome (per locale, derived from the home page)
// ---------------------------------------------------------------------------

async function importSite(locale: Locale, albums: Album[]): Promise<SiteContent> {
  const html = await fetchText(`${BASE_URL}/index.php?lang=${locale}`);
  const $ = cheerio.load(html);

  const logoSrc = resolveUrl($("#logo img").attr("src"));
  const logo: ImageAsset = {
    src: logoSrc ?? "",
    localSrc: await resolveAsset(logoSrc, "image"),
    alt: $("#logo img").attr("alt") ?? "Sueño en la Fábrica",
  };

  const shows: NavItem[] = [];
  $(".bulle_spectacle a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const title = $(el).find("a").last().text().trim() || $(el).text().trim();
    if (!href || !title) return;
    const entry = OLD_PAGES.find((p) => p.file === href.replace(/^\.?\//, ""));
    if (entry && !shows.some((s) => s.slug === entry.slug)) {
      shows.push({ slug: entry.slug, title });
    }
  });

  const films: NavItem[] = [];
  $(".menu li")
    .has("ul")
    .each((_, li) => {
      $(li)
        .find("ul li a")
        .each((__, a) => {
          const href = $(a).attr("href");
          const title = $(a).text().trim();
          const entry = OLD_PAGES.find((p) => p.file === href);
          if (entry && !films.some((f) => f.slug === entry.slug)) {
            films.push({ slug: entry.slug, title });
          }
        });
    });

  const headings = $("h2.underlined").toArray();
  const managedByHeading = headings[0];
  const fundersHeading = headings[1];

  let managedBy: SiteContent["managedBy"] = {
    label: "Aria Prod",
    link: { href: "https://www.aria-prod.fr/", label: "Aria Prod", external: true },
    logo: { src: "", localSrc: "", alt: "Aria Prod" },
  };
  if (managedByHeading) {
    const table = $(managedByHeading).nextAll("table").first();
    const a = table.find("a").first();
    const img = a.find("img").first();
    const absSrc = resolveUrl(img.attr("src"));
    const href = a.attr("href") ?? "https://www.aria-prod.fr/";
    const label = textWithBreaks(table.find("td").last()) || "Aria Prod";
    managedBy = {
      label,
      link: { href, label, external: isExternal(href) },
      logo: { src: absSrc ?? "", localSrc: await resolveAsset(absSrc, "image"), alt: img.attr("alt") ?? label },
    };
  }

  const funders: FunderLogo[] = [];
  if (fundersHeading) {
    const table = $(fundersHeading).nextAll("table").first();
    const imgs = table.find("img").toArray();
    const labelCells = table.find("tr").eq(1).find("td").toArray();
    for (let i = 0; i < imgs.length; i++) {
      const img = $(imgs[i]);
      const absSrc = resolveUrl(img.attr("src"));
      const label = labelCells[i] ? textWithBreaks($(labelCells[i])) : img.attr("alt") ?? "";
      funders.push({
        image: { src: absSrc ?? "", localSrc: await resolveAsset(absSrc, "image"), alt: img.attr("alt") ?? label },
        label,
      });
    }
  }

  const footerHtml = await rewriteFooterHtml($, $("#copyright").first());

  return { locale, logo, shows, films, managedBy, funders, footerHtml };
}

async function rewriteFooterHtml($: Cheerio$, footerEl: ReturnType<Cheerio$>): Promise<string> {
  // The footer has no media of its own; keep the text verbatim except for the
  // "Réalisation" credit link, which by explicit request now points to this
  // remaster's author instead of the original site builder (D'CLIC Informatique).
  const html = footerEl.html()?.trim() ?? "";
  return html.replace(
    /<a href="https:\/\/www\.dclic\.info"[^>]*>[^<]*<\/a>/i,
    '<a href="https://moi-lopez.com" target="_blank" title="Moises Lopez">Moises Lopez</a>',
  );
}

// ---------------------------------------------------------------------------
// Individual page content
// ---------------------------------------------------------------------------

async function importPage(entry: OldPageEntry, locale: Locale, albums: Album[]): Promise<PageContent> {
  const oldUrl = `${BASE_URL}/${entry.file}?lang=${locale}`;
  const html = await fetchText(oldUrl);
  const $ = cheerio.load(html);

  const title = $("#text h1").first().text().trim() || $("title").text().trim();

  const headerSrc = resolveUrl($("#entete").attr("src"));
  const headerImage: ImageAsset | undefined = headerSrc
    ? { src: headerSrc, localSrc: await resolveAsset(headerSrc, "image"), alt: title }
    : undefined;

  const $text = $("#text").clone();

  // Remove the "managed by / supported by" funder sections that only appear
  // on the home page - they're captured once in site.<locale>.json instead.
  $text.find("h2.underlined").each((_, h2) => {
    const $h2 = $text.find(h2);
    $h2.nextAll("table").first().remove();
    $h2.remove();
  });

  // Videos (iframes), extracted before stripping.
  const videos: VideoEmbed[] = [];
  $text.find("iframe").each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      const video = videoFromIframeSrc(src);
      if (video) videos.push(video);
    }
  });
  $text.find("iframe").remove();

  // Downloadable files vs external links - read while images (used as link
  // labels in a couple of cases) are still present.
  const files: FileAsset[] = [];
  const externalLinks: LinkRef[] = [];
  const seenExternal = new Set<string>();
  for (const a of $text.find("a[href]").toArray()) {
    const $a = $(a);
    const href = $a.attr("href") ?? "";
    const abs = resolveUrl(href);
    if (!abs) continue;
    const ext = abs.split(".").pop()?.toLowerCase().split("?")[0] ?? "";
    const label = textWithBreaks($a) || $a.find("img").attr("alt") || ext.toUpperCase();
    if (FILE_EXTENSIONS.includes(ext)) {
      files.push({
        href: abs,
        localHref: await resolveAsset(abs, "file"),
        label,
        type: ext,
      });
    } else if (isExternal(abs) && !seenExternal.has(abs)) {
      seenExternal.add(abs);
      externalLinks.push({ href: abs, label: label || abs, external: true });
    }
  }

  // Gallery images, extracted before stripping.
  const gallery: ImageAsset[] = [];
  for (const img of $text.find("img").toArray()) {
    gallery.push(await extractImage($, img));
  }
  $text.find('div[id^="caption"]').remove();
  $text.find("img").remove();
  // Drop now-empty float wrapper divs left behind after image removal.
  $text.find("div").each((_, div) => {
    const $div = $(div);
    if ($div.children().length === 0 && $div.text().trim() === "") $div.remove();
  });

  $text.find("script").remove();
  $text.find("h1").first().remove(); // rendered separately as the page title

  const bodyHtml = $text.html()?.trim() ?? "";

  const footerHtml = await rewriteFooterHtml($, $("#copyright").first());

  return {
    slug: entry.slug,
    category: entry.category,
    locale,
    oldFile: entry.file,
    oldUrl,
    title,
    headerImage,
    bodyHtml,
    videos,
    gallery,
    files,
    externalLinks,
    relatedAlbumSlugs: entry.category === "show" || entry.category === "film" ? relatedAlbums(title, entry.slug, albums) : [],
    footerHtml,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Importing ${BASE_URL} (ASSET_MODE=${ASSET_MODE}, AUDIO_MODE=${AUDIO_MODE})`);
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  for (const locale of LOCALES) {
    await fs.mkdir(path.join(CONTENT_DIR, locale), { recursive: true });
  }

  const radio = await importRadio();
  await fs.writeFile(path.join(CONTENT_DIR, "radio.json"), JSON.stringify(radio, null, 2));

  for (const locale of LOCALES) {
    console.log(`\n== Site chrome (${locale}) ==`);
    const site = await importSite(locale, radio.albums);
    await fs.writeFile(path.join(CONTENT_DIR, `site.${locale}.json`), JSON.stringify(site, null, 2));
    await sleep(150);
  }

  for (const locale of LOCALES) {
    console.log(`\n== Pages (${locale}) ==`);
    for (const entry of OLD_PAGES) {
      process.stdout.write(`  ${entry.file} ... `);
      try {
        const page = await importPage(entry, locale, radio.albums);
        const fileName = entry.category === "home" ? "home" : entry.slug ? `${entry.category}-${entry.slug}` : entry.category;
        await fs.writeFile(path.join(CONTENT_DIR, locale, `${fileName}.json`), JSON.stringify(page, null, 2));
        console.log("ok");
      } catch (err) {
        console.log(`FAILED: ${(err as Error).message}`);
      }
      await sleep(150);
    }
  }

  await fs.writeFile(
    path.join(CONTENT_DIR, "asset-map.json"),
    JSON.stringify(Object.fromEntries(assetMap), null, 2),
  );

  if (downloadFailures.length) {
    console.warn(`\n${downloadFailures.length} assets failed to download and still point at the old server:`);
    for (const f of downloadFailures) console.warn(`  - ${f}`);
  }

  console.log("\nImport complete.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
