"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { House, MicrophoneStage, FilmSlate, Radio as RadioIcon, DotsThree } from "@phosphor-icons/react";
import { Icon } from "@/components/Icon";
import { Link, usePathname } from "@/i18n/navigation";
import { MoreSheet } from "./MoreSheet";

const TABS = [
  { key: "home", href: "/", icon: House },
  { key: "shows", href: "/shows", icon: MicrophoneStage },
  { key: "films", href: "/films", icon: FilmSlate },
  { key: "radio", href: "/radio", icon: RadioIcon },
] as const;

const MORE_PATHS = ["/references", "/downloads", "/contact"];

/** Bottom tab bar shown on mobile viewports, under the mini-player. */
export function MobileTabBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_PATHS.some((p) => pathname.startsWith(p));

  return (
    <>
      <nav
        aria-label="Main"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 flex h-[64px] border-t border-[var(--border)] bg-[var(--surface-elevated)]/80 backdrop-blur-xl md:hidden"
      >
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="tap-scale flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wide"
            >
              <Icon
                icon={tab.icon}
                context="nav"
                active={active}
                className={active ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"}
              />
              <span className={active ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"}>
                {t(tab.key)}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          aria-controls="mobile-more-sheet"
          className="tap-scale flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wide"
        >
          <Icon
            icon={DotsThree}
            context="nav"
            active={moreActive}
            className={moreActive ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"}
          />
          <span className={moreActive ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"}>
            {t("more")}
          </span>
        </button>
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
