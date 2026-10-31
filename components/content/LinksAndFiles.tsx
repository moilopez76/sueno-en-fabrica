import { useTranslations } from "next-intl";
import type { FileAsset, LinkRef } from "@/lib/content-types";

export function FileList({ files }: { files: FileAsset[] }) {
  const t = useTranslations("common");
  if (files.length === 0) return null;
  return (
    <ul className="my-4 flex flex-col gap-2">
      {files.map((file, i) => (
        <li key={i}>
          <a
            href={file.localHref || file.href}
            download
            className="inline-flex items-center gap-2 rounded-md bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] hover:text-black"
          >
            <span aria-hidden>⬇</span>
            {t("downloadFile")} — {file.label}
            <span className="text-xs uppercase text-[var(--foreground-muted)]">({file.type})</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ExternalLinkList({ links }: { links: LinkRef[] }) {
  if (links.length === 0) return null;
  return (
    <ul className="my-4 flex flex-col gap-1">
      {links.map((link, i) => (
        <li key={i}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--accent)] underline underline-offset-2 hover:opacity-80"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Renders a page's verbatim #copyright footer HTML (credits vary per page). */
export function PageFooter({ html }: { html: string }) {
  if (!html) return null;
  return (
    <footer
      className="prose-sueno mt-10 border-t border-[var(--border)] pt-4 text-xs text-[var(--foreground-muted)]"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
