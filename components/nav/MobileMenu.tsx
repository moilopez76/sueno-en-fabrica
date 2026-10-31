"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconClose, IconMenu } from "@/components/icons/Icons";
import { NAV_ITEMS } from "./Sidebar";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Hamburger button + slide-in drawer exposing the full primary navigation on
 * mobile (including References/Downloads, which don't fit in the bottom tab
 * bar). Animates the icon between menu/close and the panel between
 * hidden/visible, and closes on route change, outside click or Escape.
 */
export function MobileMenu() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("closeMenu") : t("menu")}
        aria-expanded={open}
        aria-controls="mobile-menu-drawer"
        className="tap-scale relative flex h-11 w-11 items-center justify-center rounded-full text-[var(--foreground)] active:bg-[var(--surface-strong)]"
      >
        <IconMenu
          className={`absolute h-6 w-6 transition-all duration-200 ${open ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}
        />
        <IconClose
          className={`absolute h-6 w-6 transition-all duration-200 ${open ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        />
      </button>

      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <div
        id="mobile-menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        className={`pt-safe pb-safe fixed inset-y-0 right-0 z-50 flex w-[82%] max-w-xs flex-col border-l border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-elevated)] transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-lg font-bold">{t("menu")}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("closeMenu")}
            className="tap-scale flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground-muted)] active:bg-[var(--surface-strong)]"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`tap-scale flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold transition-colors ${
                  active
                    ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                    : "text-[var(--foreground)] active:bg-[var(--surface-strong)]"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
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
