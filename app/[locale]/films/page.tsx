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
  return buildPageMetadata({ locale: locale as Locale, pathWithoutLocale: "/films", title: "Films" });
}

export default async function FilmsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  const films = listPagesByCategory(locale as Locale, "film");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t("films")}</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {films.map((film) => (
          <PageCard key={film.slug} href={`/films/${film.slug}`} title={film.title} image={film.headerImage} />
        ))}
      </div>
    </div>
  );
}
