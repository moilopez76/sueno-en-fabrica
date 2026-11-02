"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowsOut,
  CaretDown,
  DotsThree,
  List,
  Pause,
  Play,
  Repeat,
  RepeatOnce,
  Shuffle,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerLow,
  SpeakerX,
} from "@phosphor-icons/react";
import { Icon } from "@/components/Icon";
import { useAudio } from "./AudioProvider";
import { useCoverColor } from "./useCoverColor";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { formatTime } from "./format";
import { QueueSheet } from "./QueueSheet";

const SWIPE_DISTANCE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 500;

function triggerHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(10);
}

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) return <Icon icon={SpeakerX} context="inline" />;
  if (volume < 0.5) return <Icon icon={SpeakerLow} context="inline" />;
  return <Icon icon={SpeakerHigh} context="inline" />;
}

function RepeatIcon({ repeat }: { repeat: "off" | "all" | "one" }) {
  return repeat === "one" ? <Icon icon={RepeatOnce} context="player" /> : <Icon icon={Repeat} context="player" />;
}

/** Small dot shown under shuffle/repeat when active, Spotify-style. */
function ActiveDot() {
  return (
    <span aria-hidden className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
  );
}

/** Desktop bottom player bar + mobile mini-player/full-screen "Now playing" sheet. */
export function PlayerBar() {
  const t = useTranslations("player");
  const reducedMotion = usePrefersReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [volumePopoverOpen, setVolumePopoverOpen] = useState(false);
  const {
    queue,
    currentIndex,
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

  const coverSrc = currentTrack ? currentTrack.cover.localSrc || currentTrack.cover.src : undefined;
  const coverColor = useCoverColor(coverSrc);
  const previousTrack = currentIndex > 0 ? queue[currentIndex - 1] : null;
  const nextTrack = currentIndex + 1 < queue.length ? queue[currentIndex + 1] : null;

  // Space toggles play/pause, arrow keys seek (left/right) and change track
  // (up/down), whenever focus isn't inside a form field.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!currentTrack) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(Math.min(duration || currentTime + 5, currentTime + 5));
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;
        case "ArrowUp":
          e.preventDefault();
          next();
          break;
        case "ArrowDown":
          e.preventDefault();
          previous();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentTrack, currentTime, duration, togglePlay, seek, next, previous]);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const glowStyle = coverColor ? ({ "--cover-color": coverColor } as CSSProperties) : undefined;

  const transportControls = (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={toggleShuffle}
        aria-pressed={shuffle}
        aria-label={t("shuffle")}
        className={`tap-scale relative ${shuffle ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}`}
      >
        <Icon icon={Shuffle} context="player" />
        {shuffle && <ActiveDot />}
      </button>
      <button type="button" onClick={previous} aria-label={t("previous")} className="tap-scale text-[var(--foreground)]">
        <Icon icon={SkipBack} context="player" weight="fill" />
      </button>
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? t("pause") : t("play")}
        className="tap-scale flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-black shadow-[var(--shadow-card)]"
      >
        {isPlaying ? (
          <Icon icon={Pause} context="player" weight="fill" />
        ) : (
          <Icon icon={Play} context="player" weight="fill" className="translate-x-[1px]" />
        )}
      </button>
      <button type="button" onClick={next} aria-label={t("next")} className="tap-scale text-[var(--foreground)]">
        <Icon icon={SkipForward} context="player" weight="fill" />
      </button>
      <button
        type="button"
        onClick={cycleRepeat}
        aria-pressed={repeat !== "off"}
        aria-label={t("repeat")}
        className={`tap-scale relative ${repeat !== "off" ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}`}
      >
        <RepeatIcon repeat={repeat} />
        {repeat !== "off" && <ActiveDot />}
      </button>
    </div>
  );

  const seekBar = (
    <div className="flex w-full items-center gap-2 text-xs tabular-nums text-[var(--foreground-muted)]">
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
      {/* Mobile full-screen "Now playing" sheet */}
      <div
        className={`fixed inset-0 z-50 flex flex-col overflow-hidden md:hidden ${expanded ? "" : "pointer-events-none"}`}
        role="dialog"
        aria-modal={expanded}
        aria-hidden={!expanded}
        aria-label={t("nowPlaying")}
      >
        <motion.div
          className="cover-gradient absolute inset-0"
          style={glowStyle}
          initial={false}
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
        />
        <motion.div
          className="pt-safe pb-safe relative flex h-full flex-col px-6 pb-8"
          drag={reducedMotion ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.4 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 600) setExpanded(false);
          }}
          initial={false}
          animate={expanded ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 300 }}
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label={t("collapse")}
              tabIndex={expanded ? 0 : -1}
              className="tap-scale flex h-11 w-11 items-center justify-center rounded-full text-[var(--foreground)] active:bg-white/10"
            >
              <Icon icon={CaretDown} context="player" />
            </button>
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              {t("playingFrom", { album: currentTrack.albumTitle })}
            </p>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({ title: currentTrack.title, url: window.location.href }).catch(() => {});
                }
              }}
              aria-label={t("moreOptions")}
              tabIndex={expanded ? 0 : -1}
              className="tap-scale flex h-11 w-11 items-center justify-center rounded-full text-[var(--foreground)] active:bg-white/10"
            >
              <Icon icon={DotsThree} context="player" />
            </button>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center gap-8">
            <div className="relative flex w-full items-center justify-center">
              {previousTrack && (
                <Image
                  aria-hidden
                  src={previousTrack.cover.localSrc || previousTrack.cover.src}
                  alt=""
                  width={240}
                  height={240}
                  className="absolute left-0 h-[70%] w-[70%] max-w-[260px] flex-shrink-0 rounded-xl object-cover opacity-40"
                />
              )}
              {nextTrack && (
                <Image
                  aria-hidden
                  src={nextTrack.cover.localSrc || nextTrack.cover.src}
                  alt=""
                  width={240}
                  height={240}
                  className="absolute right-0 h-[70%] w-[70%] max-w-[260px] flex-shrink-0 rounded-xl object-cover opacity-40"
                />
              )}
              <motion.div
                key={currentTrack.file}
                drag={reducedMotion ? false : "x"}
                dragSnapToOrigin
                dragElastic={0.5}
                onDragEnd={(_, info) => {
                  const exceeded =
                    Math.abs(info.offset.x) > SWIPE_DISTANCE_THRESHOLD ||
                    Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;
                  if (!exceeded) return;
                  if (info.offset.x < 0 && nextTrack) {
                    triggerHaptic();
                    next();
                  } else if (info.offset.x > 0 && previousTrack) {
                    triggerHaptic();
                    previous();
                  }
                }}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 24, stiffness: 260 }}
                className="z-10 aspect-square w-[88%] max-w-[420px] cursor-grab touch-pan-y active:cursor-grabbing"
              >
                <Image
                  src={currentTrack.cover.localSrc || currentTrack.cover.src}
                  alt={currentTrack.cover.alt || currentTrack.albumTitle}
                  width={420}
                  height={420}
                  className="h-full w-full flex-shrink-0 rounded-xl object-cover shadow-[var(--shadow-elevated)]"
                  priority={expanded}
                  draggable={false}
                />
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTrack.file}
                initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -16 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
                className="w-full max-w-sm text-left"
              >
                <p className="truncate text-[22px] font-bold tracking-tight text-[var(--foreground)]">
                  {currentTrack.title}
                </p>
                <p className="truncate text-sm text-[var(--foreground-muted)]">{currentTrack.albumTitle}</p>
              </motion.div>
            </AnimatePresence>

            {error && (
              <p className="text-center text-xs text-red-400" role="alert">
                {error}
              </p>
            )}

            <div className="w-full max-w-sm">{seekBar}</div>
            <div className="scale-125">{transportControls}</div>

            <div className="flex w-full max-w-sm items-center justify-between">
              <button
                type="button"
                onClick={() => setQueueOpen(true)}
                aria-label={t("upNext")}
                className="tap-scale flex h-11 w-11 items-center justify-center rounded-full text-[var(--foreground-muted)] active:bg-white/10"
              >
                <Icon icon={List} context="player" />
              </button>
              <button
                type="button"
                onClick={() => setVolumePopoverOpen((o) => !o)}
                aria-label={t("volume")}
                aria-expanded={volumePopoverOpen}
                className="tap-scale flex h-11 w-11 items-center justify-center rounded-full text-[var(--foreground-muted)] active:bg-white/10"
              >
                <VolumeIcon volume={volume} />
              </button>
            </div>
            {volumePopoverOpen && (
              <div className="w-full max-w-sm">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label={t("volume")}
                  className="h-1 w-full accent-[var(--accent)]"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mobile mini-player */}
      <motion.div
        drag={reducedMotion ? false : "x"}
        dragSnapToOrigin
        dragElastic={0.6}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          const exceeded =
            Math.abs(info.offset.x) > SWIPE_DISTANCE_THRESHOLD || Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;
          if (!exceeded) return;
          if (info.offset.x < 0) {
            triggerHaptic();
            next();
          } else {
            triggerHaptic();
            previous();
          }
        }}
        onClick={() => setExpanded(true)}
        className="pb-safe fixed inset-x-2 bottom-[72px] z-40 touch-pan-y overflow-hidden rounded-lg shadow-[var(--shadow-elevated)] md:hidden"
        style={glowStyle}
        role="button"
        tabIndex={0}
        aria-label={t("expand")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded(true);
        }}
      >
        <div className="cover-gradient relative flex items-center gap-3 px-2.5 py-2">
          <Image
            src={currentTrack.cover.localSrc || currentTrack.cover.src}
            alt={currentTrack.cover.alt || currentTrack.albumTitle}
            width={40}
            height={40}
            className="h-10 w-10 flex-shrink-0 rounded object-cover shadow-[var(--shadow-card)]"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[var(--foreground)]">{currentTrack.title}</span>
            <span className="block truncate text-xs text-[var(--foreground-muted)]">{currentTrack.albumTitle}</span>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label={isPlaying ? t("pause") : t("play")}
            className="tap-scale flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[var(--foreground)]"
          >
            {isPlaying ? (
              <Icon icon={Pause} context="player" weight="fill" />
            ) : (
              <Icon icon={Play} context="player" weight="fill" className="translate-x-[1px]" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label={t("next")}
            className="tap-scale flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[var(--foreground)]"
          >
            <Icon icon={SkipForward} context="player" weight="fill" />
          </button>
        </div>
        <div className="h-0.5 w-full bg-black/20">
          <div className="h-full bg-[var(--accent)]" style={{ width: `${progressPercent}%` }} />
        </div>
      </motion.div>

      {/* Desktop player bar */}
      <div
        className="pb-safe fixed inset-x-0 bottom-[64px] z-40 border-t border-[var(--border)] bg-[var(--surface-strong)]/85 backdrop-blur-xl md:bottom-0"
        role="region"
        aria-label={t("nowPlaying")}
      >
        {error && (
          <p className="hidden truncate bg-red-600/90 px-4 py-1 text-center text-xs text-white md:block" role="alert">
            {error}
          </p>
        )}
        <div className="hidden items-center gap-4 px-4 py-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)]">
          <div className="flex min-w-0 items-center gap-3">
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

          <div className="flex w-full max-w-xl flex-col items-center gap-1 justify-self-center">
            {transportControls}
            {seekBar}
          </div>

          <div className="relative flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setQueueOpen((o) => !o)}
              aria-label={t("upNext")}
              aria-expanded={queueOpen}
              className={`tap-scale ${queueOpen ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"}`}
            >
              <Icon icon={List} context="inline" />
            </button>
            <VolumeIcon volume={volume} />
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
            <button
              type="button"
              onClick={() => {
                if (typeof document === "undefined") return;
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {});
                } else {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              aria-label={t("fullscreen")}
              className="tap-scale text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            >
              <Icon icon={ArrowsOut} context="inline" />
            </button>
          </div>
        </div>
      </div>

      <QueueSheet open={queueOpen} onClose={() => setQueueOpen(false)} />
    </>
  );
}
