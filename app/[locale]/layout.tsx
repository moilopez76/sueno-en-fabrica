import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getSiteContent, getRadioContent } from "@/lib/content";
import { absoluteMediaUrl, buildPageMetadata, SITE_URL } from "@/lib/seo";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { PlayerBar } from "@/components/audio/PlayerBar";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { MobileTabBar } from "@/components/nav/MobileTabBar";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// The site is dark-only: pin the native UI chrome (iOS Safari status bar,
// form controls, scrollbars) to dark regardless of the OS/browser preference.
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const description =
    locale === "en"
      ? "Sueño en la Fábrica — original music and multidisciplinary shows."
      : locale === "es"
        ? "Sueño en la Fábrica — música original y espectáculos multidisciplinarios."
        : "Sueño en la Fábrica — musique originale et spectacles pluridisciplinaires.";
  const base = buildPageMetadata({
    locale: locale as Locale,
    pathWithoutLocale: "/",
    title: "Sueño en la Fábrica",
    description,
  });
  return {
    ...base,
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Sueño en la Fábrica",
      template: "%s | Sueño en la Fábrica",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const site = getSiteContent(locale as Locale);
  const { albums } = getRadioContent();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: "Sueño en la Fábrica",
    url: `${SITE_URL}/${locale}`,
    image: absoluteMediaUrl(site.logo.localSrc || site.logo.src),
    sameAs: [site.managedBy.link.href].filter(Boolean),
  };

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <NextIntlClientProvider messages={messages}>
          <AudioProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-[var(--accent)] focus:px-3 focus:py-2 focus:text-black"
            >
              Aller au contenu principal
            </a>
            {/* Desktop-only full-bleed blurred backdrop (the remastered hero
                artwork), Spotify "now playing"-style. Hidden on mobile/tablet,
                which keep the plain flat background. */}
            {site.headerImage?.localSrc && (
              <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block">
                <Image
                  src={site.headerImage.localSrc || site.headerImage.src}
                  alt=""
                  fill
                  priority
                  className="scale-110 object-cover opacity-50 blur-3xl saturate-125"
                />
                <div className="absolute inset-0 bg-[var(--background)]/70" />
              </div>
            )}
            <Sidebar site={site} albums={albums} />
            <MobileHeader site={site} />
            <div className="relative z-10 pb-[calc(140px+env(safe-area-inset-bottom))] md:ml-64 md:pb-20">
              <main
                id="main-content"
                className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:my-6 md:rounded-2xl md:bg-[var(--surface)]/70 md:py-8 md:shadow-[var(--shadow-elevated)] md:backdrop-blur-xl"
              >
                {children}
              </main>
            </div>
            <PlayerBar />
            <MobileTabBar />
          </AudioProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
