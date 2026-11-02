"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  House,
  MicrophoneStage,
  FilmSlate,
  Radio as RadioIcon,
  BookOpen,
  DownloadSimple,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { Icon } from "@/components/Icon";
import { Link, usePathname } from "@/i18n/navigation";
import type { Album, SiteContent } from "@/lib/content-types";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Full primary navigation, shared by the desktop sidebar and the mobile "More" sheet. */
export const NAV_ITEMS = [
  { key: "home", href: "/", icon: House },
  { key: "shows", href: "/shows", icon: MicrophoneStage },
  { key: "films", href: "/films", icon: FilmSlate },
  { key: "radio", href: "/radio", icon: RadioIcon },
  { key: "references", href: "/references", icon: BookOpen },
  { key: "downloads", href: "/downloads", icon: DownloadSimple },
  { key: "contact", href: "/contact", icon: EnvelopeSimple },
] as const;

/** Fixed left navigation column shown on desktop viewports. */
export function Sidebar({ site, albums }: { site: SiteContent; albums: Album[] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] p-4 md:flex">
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

      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150 ${
                active ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon icon={item.icon} context="nav" active={active} />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {albums.length > 0 && (
        <div className="mt-6 flex-1 overflow-y-auto border-t border-[var(--border)] pt-4">
          <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            {t("radio")}
          </p>
          <ul className="flex flex-col gap-0.5">
            {albums.map((album) => (
              <li key={album.slug}>
                <Link
                  href={`/radio/${album.slug}`}
                  className="flex items-center gap-3 rounded-md px-3 py-1.5 transition-colors duration-150 hover:bg-[var(--surface-strong)]"
                >
                  <Image
                    src={album.cover.localSrc || album.cover.src}
                    alt={album.cover.alt || album.title}
                    width={40}
                    height={40}
                    className="h-10 w-10 flex-shrink-0 rounded object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[var(--foreground)]">{album.title}</span>
                    {album.subtitle && (
                      <span className="block truncate text-xs text-[var(--foreground-muted)]">{album.subtitle}</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 px-2 pt-2">
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
