"use client";

import { useTranslations } from "next-intl";
import type { Album } from "@/lib/content-types";
import { useAudio } from "@/components/audio/AudioProvider";

function NowPlayingBars() {
  return (
    <span aria-hidden className="flex h-3 w-4 items-end gap-[2px]">
      <span className="h-full w-[3px] animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-[var(--accent)]" />
      <span className="h-2/3 w-[3px] animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-[var(--accent)]" />
      <span className="h-full w-[3px] animate-[pulse_0.8s_ease-in-out_infinite] rounded-full bg-[var(--accent)]" />
    </span>
  );
}

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
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-3.5 text-left text-sm transition-colors hover:bg-[var(--surface-strong)] active:bg-[var(--surface-strong)] ${
                active ? "text-[var(--accent)]" : "text-[var(--foreground)]"
              }`}
            >
              <span className="flex w-6 flex-shrink-0 items-center justify-end text-[var(--foreground-muted)]">
                {active && isPlaying ? <NowPlayingBars /> : i + 1}
              </span>
              <span className="truncate font-medium">{track.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
