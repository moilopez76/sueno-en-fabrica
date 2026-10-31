"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Album } from "@/lib/content-types";
import { useAudio } from "@/components/audio/AudioProvider";
import { IconPlay } from "@/components/icons/Icons";

/** Spotify-style album card: cover, title/subtitle, and a floating play button. */
export function AlbumCard({ album }: { album: Album }) {
  const t = useTranslations("player");
  const { playAlbum } = useAudio();

  return (
    <div className="group relative w-36 flex-shrink-0 snap-start sm:w-44">
      <Link href={`/radio/${album.slug}`} className="tap-scale block">
        <div className="relative overflow-hidden rounded-xl bg-[var(--surface-strong)] shadow-[var(--shadow-card)] transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-elevated)]">
          <Image
            src={album.cover.localSrc || album.cover.src}
            alt={album.cover.alt || album.title}
            width={320}
            height={320}
            className="aspect-square w-full object-cover"
          />
        </div>
        <p className="mt-2.5 truncate text-sm font-semibold text-[var(--foreground)]">{album.title}</p>
        {album.subtitle && <p className="truncate text-xs text-[var(--foreground-muted)]">{album.subtitle}</p>}
      </Link>
      <button
        type="button"
        onClick={() => playAlbum(album)}
        aria-label={`${t("playAlbum")} ${album.title}`}
        className="tap-scale absolute bottom-16 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-black opacity-100 shadow-[var(--shadow-elevated)] transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <IconPlay className="h-4 w-4 translate-x-[1px]" />
      </button>
    </div>
  );
}
