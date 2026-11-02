"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Play } from "@phosphor-icons/react";
import { Icon } from "@/components/Icon";
import { Link } from "@/i18n/navigation";
import type { Album } from "@/lib/content-types";
import { useAudio } from "@/components/audio/AudioProvider";

/** Spotify-style album card: cover, title/subtitle, and a floating play button. */
export function AlbumCard({ album }: { album: Album }) {
  const t = useTranslations("player");
  const { playAlbum } = useAudio();

  return (
    <div className="group relative w-36 flex-shrink-0 snap-start sm:w-44">
      <Link href={`/radio/${album.slug}`} className="tap-scale block">
        <div className="relative overflow-hidden rounded-lg bg-[var(--surface-strong)] shadow-[var(--shadow-card)] transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-elevated)]">
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
        onClick={(e) => {
          e.preventDefault();
          playAlbum(album);
        }}
        aria-label={`${t("playAlbum")} ${album.title}`}
        className="tap-scale absolute bottom-16 right-2 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-[var(--accent)] text-black opacity-0 shadow-[var(--shadow-elevated)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        <Icon icon={Play} context="card" weight="fill" className="translate-x-[1px]" />
      </button>
    </div>
  );
}
