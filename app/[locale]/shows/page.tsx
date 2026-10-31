import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { listPagesByCategory } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { PageCard } from "@/components/content/PageCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale: locale as Locale, pathWithoutLocale: "/shows", title: "Spectacles" });
}

export default async function ShowsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  const shows = listPagesByCategory(locale as Locale, "show");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t("shows")}</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {shows.map((show) => (
          <PageCard key={show.slug} href={`/shows/${show.slug}`} title={show.title} image={show.headerImage} />
        ))}
      </div>
    </div>
  );
}
