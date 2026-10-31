import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SiteContent } from "@/lib/content-types";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { IconHome, IconMic, IconFilm, IconRadio, IconBook, IconDownload, IconMail } from "@/components/icons/Icons";

/** Full primary navigation, shared by the desktop sidebar and the mobile drawer menu. */
export const NAV_ITEMS = [
  { key: "home", href: "/", icon: IconHome },
  { key: "shows", href: "/shows", icon: IconMic },
  { key: "films", href: "/films", icon: IconFilm },
  { key: "radio", href: "/radio", icon: IconRadio },
  { key: "references", href: "/references", icon: IconBook },
  { key: "downloads", href: "/downloads", icon: IconDownload },
  { key: "contact", href: "/contact", icon: IconMail },
] as const;

/** Fixed left navigation column shown on desktop viewports. */
export function Sidebar({ site }: { site: SiteContent }) {
  const t = useTranslations("nav");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 md:flex">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2">
        <Image
          src={site.logo.localSrc || site.logo.src}
          alt={site.logo.alt}
          width={160}
          height={48}
          className="h-10 w-auto object-contain"
          priority
        />
      </Link>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 px-2">
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
