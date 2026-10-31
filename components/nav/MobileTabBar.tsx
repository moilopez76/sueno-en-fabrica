"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const TABS = [
  { key: "home", href: "/", icon: "🏠" },
  { key: "shows", href: "/shows", icon: "🎭" },
  { key: "films", href: "/films", icon: "🎬" },
  { key: "radio", href: "/radio", icon: "📻" },
  { key: "contact", href: "/contact", icon: "✉️" },
] as const;

/** Bottom tab bar shown on mobile viewports, under the mini-player. */
export function MobileTabBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex h-[56px] border-t border-[var(--border)] bg-[var(--surface-strong)] md:hidden"
    >
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] ${
              active ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"
            }`}
          >
            <span aria-hidden className="text-lg leading-none">
              {tab.icon}
            </span>
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}
