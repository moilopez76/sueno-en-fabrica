"use client";

import { useTranslations } from "next-intl";
import type { Album } from "@/lib/content-types";
import { useAudio } from "@/components/audio/AudioProvider";

export function TrackList({ album }: { album: Album }) {
  const t = useTranslations("common");
  const { playAlbum, currentTrack, isPlaying } = useAudio();

  return (
    <ol className="divide-y divide-[var(--border)]" aria-label={t("tracklist")}>
      {album.tracks.map((track, i) => {
        const active = currentTrack?.file === track.file && currentTrack.albumSlug === album.slug;
        return (
          <li key={track.file}>
            <button
              type="button"
              onClick={() => playAlbum(album, i)}
              className={`flex w-full items-center gap-3 px-2 py-3 text-left text-sm transition-colors hover:bg-[var(--surface-strong)] ${
                active ? "text-[var(--accent)]" : "text-[var(--foreground)]"
              }`}
            >
              <span className="w-6 flex-shrink-0 text-right text-[var(--foreground-muted)]">
                {active && isPlaying ? "♫" : i + 1}
              </span>
              <span className="truncate">{track.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
