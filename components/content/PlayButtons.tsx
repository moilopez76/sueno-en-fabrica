"use client";

import { useTranslations } from "next-intl";
import { Play } from "@phosphor-icons/react";
import { Icon } from "@/components/Icon";
import type { Album } from "@/lib/content-types";
import { useAudio } from "@/components/audio/AudioProvider";

export function PlayAllButton({ albums }: { albums: Album[] }) {
  const t = useTranslations("player");
  const { playAll } = useAudio();
  return (
    <button
      type="button"
      onClick={() => playAll(albums)}
      className="tap-scale mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-black shadow-[var(--shadow-card)] transition-opacity hover:opacity-90"
    >
      <Icon icon={Play} context="card" weight="fill" className="translate-x-[1px]" />
      {t("playAll")}
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
      className="tap-scale mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-black shadow-[var(--shadow-card)] transition-opacity hover:opacity-90"
    >
      <Icon icon={Play} context="card" weight="fill" className="translate-x-[1px]" />
      {t("playAlbum")}
    </button>
  );
}
