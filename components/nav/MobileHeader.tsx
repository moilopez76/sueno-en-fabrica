import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { SiteContent } from "@/lib/content-types";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Top bar shown only on mobile viewports (sidebar replaces it on desktop). */
export function MobileHeader({ site }: { site: SiteContent }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-2 backdrop-blur md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src={site.logo.localSrc || site.logo.src}
          alt={site.logo.alt}
          width={120}
          height={36}
          className="h-8 w-auto object-contain"
          priority
        />
      </Link>
      <LanguageSwitcher />
    </header>
  );
}
