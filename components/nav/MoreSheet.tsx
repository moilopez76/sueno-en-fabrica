"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, DownloadSimple, EnvelopeSimple, X } from "@phosphor-icons/react";
import { Icon } from "@/components/Icon";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

const MORE_ITEMS = [
  { key: "references", href: "/references", icon: BookOpen },
  { key: "downloads", href: "/downloads", icon: DownloadSimple },
  { key: "contact", href: "/contact", icon: EnvelopeSimple },
] as const;

/**
 * Bottom sheet opened from the mobile tab bar's "More" item, listing the
 * items that don't fit in the 5-tab bar (References, Downloads, Contact)
 * plus the language switcher.
 */
export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div
        id="mobile-more-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t("more")}
        className={`pb-safe fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-2xl border-t border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-elevated)] transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-lg font-bold text-[var(--foreground)]">{t("more")}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeMenu")}
            className="tap-scale flex h-11 w-11 items-center justify-center rounded-full text-[var(--foreground-muted)] active:bg-[var(--surface-strong)]"
          >
            <Icon icon={X} context="player" />
          </button>
        </div>

        <nav aria-label="More" className="flex flex-col gap-1 overflow-y-auto px-3 py-2">
          {MORE_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`tap-scale flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold transition-colors ${
                  active
                    ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                    : "text-[var(--foreground)] active:bg-[var(--surface-strong)]"
                }`}
              >
                <Icon icon={item.icon} context="nav" active={active} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] px-5 py-4">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}
