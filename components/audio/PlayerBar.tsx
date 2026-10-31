"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAudio } from "./AudioProvider";
import {
  IconChevronDown,
  IconPause,
  IconPlay,
  IconRepeat,
  IconRepeatOne,
  IconShuffle,
  IconSkipBack,
  IconSkipForward,
  IconVolume,
} from "@/components/icons/Icons";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Desktop bottom player bar + mobile mini-player, shared across all pages. */
export function PlayerBar() {
  const t = useTranslations("player");
  const [expanded, setExpanded] = useState(false);
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

  const transportControls = (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={toggleShuffle}
        aria-pressed={shuffle}
        aria-label={t("shuffle")}
        className={`tap-scale ${shuffle ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}`}
      >
        <IconShuffle className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={previous}
        aria-label={t("previous")}
        className="tap-scale text-[var(--foreground)]"
      >
        <IconSkipBack className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? t("pause") : t("play")}
        className="tap-scale flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-black shadow-[var(--shadow-card)]"
      >
        {isPlaying ? <IconPause className="h-5 w-5" /> : <IconPlay className="h-5 w-5 translate-x-[1px]" />}
      </button>
      <button type="button" onClick={next} aria-label={t("next")} className="tap-scale text-[var(--foreground)]">
        <IconSkipForward className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={cycleRepeat}
        aria-pressed={repeat !== "off"}
        aria-label={t("repeat")}
        className={`tap-scale ${repeat !== "off" ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}`}
      >
        {repeat === "one" ? <IconRepeatOne className="h-5 w-5" /> : <IconRepeat className="h-5 w-5" />}
      </button>
    </div>
  );

  const seekBar = (
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
  );

  return (
    <>
      <div
        className={`pt-safe fixed inset-0 z-50 flex flex-col bg-[var(--background)] px-6 pb-8 transition-all duration-300 ease-out md:hidden ${
          expanded ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
        role="dialog"
        aria-modal={expanded}
        aria-hidden={!expanded}
        aria-label={t("nowPlaying")}
      >
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label={t("collapse")}
          tabIndex={expanded ? 0 : -1}
          className="tap-scale mb-4 flex h-11 w-11 items-center justify-center self-start rounded-full text-[var(--foreground-muted)] active:bg-[var(--surface-strong)]"
        >
          <IconChevronDown className="h-7 w-7" />
        </button>
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <Image
            src={currentTrack.cover.localSrc || currentTrack.cover.src}
            alt={currentTrack.cover.alt || currentTrack.albumTitle}
            width={320}
            height={320}
            className="h-72 w-72 max-w-full flex-shrink-0 rounded-2xl object-cover shadow-[var(--shadow-elevated)]"
            priority={expanded}
          />
          <div className="w-full max-w-sm text-center">
            <p className="truncate text-xl font-bold tracking-tight text-[var(--foreground)]">{currentTrack.title}</p>
            <p className="truncate text-sm text-[var(--foreground-muted)]">{currentTrack.albumTitle}</p>
          </div>
          {error && (
            <p className="text-center text-xs text-red-500" role="alert">
              {error}
            </p>
          )}
          <div className="w-full max-w-sm">{seekBar}</div>
          <div className="scale-125">{transportControls}</div>
        </div>
      </div>
      <div
        className="pb-safe fixed inset-x-0 bottom-[64px] z-40 border-t border-[var(--border)] bg-[var(--surface-strong)]/85 backdrop-blur-xl md:bottom-0"
        role="region"
        aria-label={t("nowPlaying")}
      >
        {error && !expanded && (
          <p className="truncate bg-red-600/90 px-4 py-1 text-center text-xs text-white" role="alert">
            {error}
          </p>
        )}
        <div className="flex items-center gap-3 px-3 py-2 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] md:items-center md:gap-4 md:px-4">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={t("expand")}
            className="tap-scale flex min-w-0 flex-1 items-center gap-3 text-left md:hidden"
          >
            <Image
              src={currentTrack.cover.localSrc || currentTrack.cover.src}
              alt={currentTrack.cover.alt || currentTrack.albumTitle}
              width={56}
              height={56}
              className="h-12 w-12 flex-shrink-0 rounded-lg object-cover shadow-[var(--shadow-card)]"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[var(--foreground)]">{currentTrack.title}</span>
              <span className="block truncate text-xs text-[var(--foreground-muted)]">{currentTrack.albumTitle}</span>
            </span>
          </button>

          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? t("pause") : t("play")}
              className="tap-scale flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-black shadow-[var(--shadow-card)]"
            >
              {isPlaying ? <IconPause className="h-5 w-5" /> : <IconPlay className="h-5 w-5 translate-x-[1px]" />}
            </button>
          </div>

          {/* Desktop left: track info */}
          <div className="hidden min-w-0 items-center gap-3 md:flex">
            <Image
              src={currentTrack.cover.localSrc || currentTrack.cover.src}
              alt={currentTrack.cover.alt || currentTrack.albumTitle}
              width={56}
              height={56}
              className="h-14 w-14 flex-shrink-0 rounded-lg object-cover shadow-[var(--shadow-card)]"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">{currentTrack.title}</p>
              <p className="truncate text-xs text-[var(--foreground-muted)]">{currentTrack.albumTitle}</p>
            </div>
          </div>

          {/* Desktop center: transport controls + seek bar */}
          <div className="hidden w-full max-w-xl flex-col items-center gap-1 md:flex md:justify-self-center">
            {transportControls}
            {seekBar}
          </div>

          {/* Desktop right: volume */}
          <div className="hidden items-center gap-2 md:flex md:justify-self-end">
            <IconVolume aria-hidden className="h-4 w-4 text-[var(--foreground-muted)]" />
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
    </>
  );
}

