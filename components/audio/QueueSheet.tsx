"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "@phosphor-icons/react";
import { Icon } from "@/components/Icon";
import { useAudio } from "./AudioProvider";

/**
 * "Up next" bottom sheet listing the current queue. Shared by the desktop
 * player bar's queue button and the mobile full-screen player's queue
 * button — tapping a row jumps straight to that track.
 */
export function QueueSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("player");
  const { queue, currentIndex, playTrackFromQueue } = useAudio();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-200 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("upNext")}
        className={`pb-safe fixed inset-x-0 bottom-0 z-[60] flex max-h-[70vh] flex-col rounded-t-2xl border-t border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-elevated)] transition-transform duration-300 ease-out sm:inset-x-auto sm:right-4 sm:bottom-24 sm:w-96 sm:rounded-2xl sm:border ${
          open ? "translate-y-0" : "translate-y-full sm:translate-y-8 sm:opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-lg font-bold text-[var(--foreground)]">{t("upNext")}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("collapse")}
            className="tap-scale flex h-11 w-11 items-center justify-center rounded-full text-[var(--foreground-muted)] active:bg-[var(--surface-strong)]"
          >
            <Icon icon={X} context="player" />
          </button>
        </div>
        <ul className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-4">
          {queue.map((track, i) => {
            const active = i === currentIndex;
            return (
              <li key={`${track.albumSlug}-${track.file}-${i}`}>
                <button
                  type="button"
                  onClick={() => {
                    playTrackFromQueue(i);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--surface-strong)] ${
                    active ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                  }`}
                >
                  <Image
                    src={track.cover.localSrc || track.cover.src}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 flex-shrink-0 rounded object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{track.title}</span>
                    <span className="block truncate text-xs text-[var(--foreground-muted)]">{track.albumTitle}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
