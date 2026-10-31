"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAudio } from "./AudioProvider";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Desktop bottom player bar + mobile mini-player, shared across all pages. */
export function PlayerBar() {
  const t = useTranslations("player");
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    error,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
  } = useAudio();

  if (!currentTrack) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[56px] z-40 border-t border-[var(--border)] bg-[var(--surface-strong)]/95 backdrop-blur md:bottom-0"
      role="region"
      aria-label={t("nowPlaying")}
    >
      {error && (
        <p className="truncate bg-red-600/90 px-4 py-1 text-center text-xs text-white" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3 px-3 py-2 md:px-4">
        <Image
          src={currentTrack.cover.localSrc || currentTrack.cover.src}
          alt={currentTrack.cover.alt || currentTrack.albumTitle}
          width={56}
          height={56}
          className="h-12 w-12 flex-shrink-0 rounded object-cover md:h-14 md:w-14"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">{currentTrack.title}</p>
          <p className="truncate text-xs text-[var(--foreground-muted)]">{currentTrack.albumTitle}</p>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? t("pause") : t("play")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-black"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
        </div>

        <div className="hidden flex-1 flex-col items-center gap-1 md:flex md:max-w-xl">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleShuffle}
              aria-pressed={shuffle}
              aria-label={t("shuffle")}
              className={`text-lg ${shuffle ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}`}
            >
              ⤨
            </button>
            <button type="button" onClick={previous} aria-label={t("previous")} className="text-xl text-[var(--foreground)]">
              ⏮
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? t("pause") : t("play")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-black"
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
            <button type="button" onClick={next} aria-label={t("next")} className="text-xl text-[var(--foreground)]">
              ⏭
            </button>
            <button
              type="button"
              onClick={cycleRepeat}
              aria-pressed={repeat !== "off"}
              aria-label={t("repeat")}
              className={`text-lg ${repeat !== "off" ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}`}
            >
              {repeat === "one" ? "🔂" : "🔁"}
            </button>
          </div>
          <div className="flex w-full items-center gap-2 text-xs text-[var(--foreground-muted)]">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label={t("nowPlaying")}
              className="h-1 flex-1 accent-[var(--accent)]"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <span aria-hidden className="text-[var(--foreground-muted)]">
            🔊
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label={t("volume")}
            className="h-1 w-24 accent-[var(--accent)]"
          />
        </div>
      </div>
    </div>
  );
}
