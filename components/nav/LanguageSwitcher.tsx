"use client";

import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

const LABELS: Record<string, string> = { fr: "FR", en: "EN", es: "ES" };

/** Switches between the real /fr, /en, /es routes, keeping the current page. */
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
            l === locale
              ? "bg-[var(--accent)] text-black"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
