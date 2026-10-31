"use client";

import { useTranslations } from "next-intl";
import type { Album } from "@/lib/content-types";
import { useAudio } from "@/components/audio/AudioProvider";

export function PlayAllButton({ albums }: { albums: Album[] }) {
  const t = useTranslations("player");
  const { playAll } = useAudio();
  return (
    <button
      type="button"
      onClick={() => playAll(albums)}
      className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
    >
      ▶ {t("playAll")}
    </button>
  );
}

export function PlayAlbumButton({ album }: { album: Album }) {
  const t = useTranslations("player");
  const { playAlbum } = useAudio();
  return (
    <button
      type="button"
      onClick={() => playAlbum(album)}
      className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
    >
      ▶ {t("playAlbum")}
    </button>
  );
}
