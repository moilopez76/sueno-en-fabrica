"use client";

import { useEffect, useState } from "react";

const cache = new Map<string, number>();

/**
 * Reads the real duration of each track's audio file by loading its
 * metadata only (no fabricated numbers — `Track` has no duration field in
 * the imported content, so this derives it client-side from the file
 * itself, the same way the browser does when it loads an <audio> element).
 * Results are cached by URL so revisiting an album is instant.
 */
export function useTrackDurations(urls: (string | undefined)[]): Record<string, number> {
  const key = urls.filter(Boolean).join("|");
  const [durations, setDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    const targets = urls.filter((u): u is string => typeof u === "string" && !cache.has(u));
    if (targets.length === 0) {
      // Still surface anything already cached from a previous visit.
      const cached: Record<string, number> = {};
      urls.forEach((u) => {
        if (u && cache.has(u)) cached[u] = cache.get(u)!;
      });
      setDurations(cached);
      return;
    }

    const elements = targets.map((url) => {
      const audio = new Audio();
      audio.preload = "metadata";
      const onLoaded = () => {
        if (Number.isFinite(audio.duration)) {
          cache.set(url, audio.duration);
          setDurations((prev) => ({ ...prev, [url]: audio.duration }));
        }
      };
      audio.addEventListener("loadedmetadata", onLoaded);
      audio.src = url;
      return { audio, onLoaded };
    });

    return () => {
      elements.forEach(({ audio, onLoaded }) => {
        audio.removeEventListener("loadedmetadata", onLoaded);
        audio.src = "";
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return durations;
}
