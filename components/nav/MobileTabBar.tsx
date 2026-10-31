"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconHome, IconMic, IconFilm, IconRadio, IconMail } from "@/components/icons/Icons";

const TABS = [
  { key: "home", href: "/", icon: IconHome },
  { key: "shows", href: "/shows", icon: IconMic },
  { key: "films", href: "/films", icon: IconFilm },
  { key: "radio", href: "/radio", icon: IconRadio },
  { key: "contact", href: "/contact", icon: IconMail },
] as const;

/** Bottom tab bar shown on mobile viewports, under the mini-player. */
export function MobileTabBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 flex h-[64px] border-t border-[var(--border)] bg-[var(--surface-strong)]/85 backdrop-blur-xl md:hidden"
    >
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="tap-scale relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wide"
          >
            <span
              className={`flex h-8 w-11 items-center justify-center rounded-full transition-colors ${
                active ? "bg-[var(--accent)]/15" : ""
              }`}
            >
              <Icon
                className={`h-6 w-6 transition-colors ${active ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}`}
                strokeWidth={active ? 2.1 : 1.8}
              />
            </span>
            <span className={active ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}>{t(tab.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
