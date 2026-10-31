"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Album } from "@/lib/content-types";
import { useAudio } from "@/components/audio/AudioProvider";

/** Spotify-style album card: cover, title/subtitle, and a floating play button. */
export function AlbumCard({ album }: { album: Album }) {
  const t = useTranslations("player");
  const { playAlbum } = useAudio();

  return (
    <div className="group relative w-40 flex-shrink-0 sm:w-44">
      <Link href={`/radio/${album.slug}`} className="block">
        <div className="relative overflow-hidden rounded-lg bg-[var(--surface-strong)] shadow-sm transition-transform group-hover:-translate-y-1">
          <Image
            src={album.cover.localSrc || album.cover.src}
            alt={album.cover.alt || album.title}
            width={320}
            height={320}
            className="aspect-square w-full object-cover"
          />
        </div>
        <p className="mt-2 truncate text-sm font-semibold text-[var(--foreground)]">{album.title}</p>
        {album.subtitle && <p className="truncate text-xs text-[var(--foreground-muted)]">{album.subtitle}</p>}
      </Link>
      <button
        type="button"
        onClick={() => playAlbum(album)}
        aria-label={`${t("playAlbum")} ${album.title}`}
        className="absolute bottom-16 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-black opacity-0 shadow-lg transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        ▶
      </button>
    </div>
  );
}
