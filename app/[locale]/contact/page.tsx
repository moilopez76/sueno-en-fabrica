import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPage } from "@/lib/content";
import { absoluteMediaUrl, buildPageMetadata, excerptFromHtml } from "@/lib/seo";
import { ExternalLinkList } from "@/components/content/LinksAndFiles";
import { PageFooter } from "@/components/content/LinksAndFiles";
import { ContactForm } from "@/components/content/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = getPage(locale as Locale, "contact", "");
  return buildPageMetadata({
    locale: locale as Locale,
    pathWithoutLocale: "/contact",
    title: page?.title ?? "Contact",
    description: page ? excerptFromHtml(page.bodyHtml) : undefined,
    image: absoluteMediaUrl(page?.headerImage?.localSrc || page?.headerImage?.src),
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = getPage(locale as Locale, "contact", "");
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{page.title}</h1>
      <div
        className="prose-sueno"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />
      <ExternalLinkList links={page.externalLinks} />
      <ContactForm />
      <PageFooter html={page.footerHtml} />
    </div>
  );
}
