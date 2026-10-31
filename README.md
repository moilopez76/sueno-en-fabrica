# Sueño en la Fábrica — site remaster

A modern, responsive, Spotify-style remaster of [suenoenlafabrica.com](https://www.suenoenlafabrica.com/),
the site of music duo **Sueño en la Fábrica**. Built with Next.js (App Router, TypeScript), Tailwind CSS
and next-intl, with `/fr` (default), `/en` and `/es` locale routes.

Every piece of content — text, images, logos, links, downloads and music — is imported verbatim from the
live old site by `scripts/import-old-site.ts`. **Nothing is hard-coded or invented**; the app only renders
what's in `/content` and `/public/media`.

## Project structure

- `app/[locale]/...` — pages (home, shows, films, radio, references, downloads, contact), all driven by
  `/content` JSON via `lib/content.ts`.
- `components/audio/` — the global `AudioProvider` (queue, play/pause, shuffle, repeat, Media Session API)
  and the Spotify-style player bar / mini-player.
- `components/nav/` — desktop sidebar, mobile header + bottom tab bar, language switcher.
- `components/content/` — shared renderers for imported page content (body HTML, galleries, video embeds,
  file/link lists, album cards, carousels, contact form).
- `lib/content-types.ts` — the shared content schema produced by the importer and consumed by the app.
- `lib/pages.ts` / `lib/redirects.ts` — the canonical old-page registry and the redirect map from every old
  URL (`*.php`, `?lang=xx`) to its new localized route.
- `scripts/import-old-site.ts` — the importer (see below).
- `content/` — generated JSON content, one file per page/locale, plus `radio.json`, `site.<locale>.json`.
- `public/media/` — generated local mirror of images/files referenced by the content (large archives are
  intentionally kept on the old server, see below).

## Re-running the importer

```bash
npm run import
```

This crawls every page of the old site (fr/en/es via `?lang=`), the Radio Sueño playlist
(`audio/radio/radio-sueno.js`), and the site chrome (logo, nav, funder logos, footer credits), rewriting
`/content` and downloading referenced media into `/public/media`. It's safe to re-run: already-downloaded
assets are skipped.

### `ASSET_MODE` / `AUDIO_MODE`

Two environment variables control whether media is mirrored locally or left pointing at the old server:

```bash
ASSET_MODE=local  npm run import   # default — download images/files into /public/media
ASSET_MODE=remote npm run import   # don't download anything, link straight to the old server

AUDIO_MODE=remote npm run import   # default — keep mp3s on the old server (the full catalogue is 100s of MB)
AUDIO_MODE=local  npm run import   # also mirror every track locally
```

Regardless of `ASSET_MODE`, any single downloadable file over 20 MB (e.g. the large `.rar` archives linked
from the Downloads page) is automatically kept remote so the repository doesn't balloon in size.

With `ASSET_MODE=remote` or `AUDIO_MODE=remote`, the relevant `next.config.ts` `images.remotePatterns` entry
for `www.suenoenlafabrica.com` keeps `next/image` working against the old host.

## Development

```bash
npm install
npm run dev     # http://localhost:3000 (redirects to /fr)
npm run build   # production build
npm run lint
```

## Deployment

This is a standard Next.js App Router project — deploy it anywhere Next.js is supported (Vercel, a Node
server, Docker, etc.). No extra services are required: the `/api/contact` route currently just validates
and logs submissions (wire it up to an email/CRM provider when one is available). Make sure environment
variables `ASSET_MODE`/`AUDIO_MODE` are only needed at import time, not at runtime/build time of the app
itself — the generated `/content` and `/public/media` are committed, so a plain `npm run build` doesn't need
network access to the old site.

## Migration notes

- Every old URL (`index.php`, `index.php?lang=en`, `radio-music.php`, …) redirects (HTTP 308) to its new
  localized route via `next.config.ts` → `lib/redirects.ts`.
- `sitemap.xml`, `robots.txt`, per-page Open Graph metadata, hreflang alternates and JSON-LD
  (`MusicGroup`/`MusicAlbum`) are generated from the same `/content` data — see `app/sitemap.ts`,
  `app/robots.ts` and `lib/seo.ts`.
- Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://suenoenlafabrica.com`) in production so canonical URLs,
  `sitemap.xml` and Open Graph tags point at the real domain instead of the placeholder default.
