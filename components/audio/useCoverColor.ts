"use client";

import { useEffect, useState } from "react";

const cache = new Map<string, string | null>();

/**
 * Samples a dominant colour from an album cover using a small offscreen
 * canvas (averaging a 16x16 downscaled copy). Used as a soft gradient tint
 * behind album pages and the full-screen player. Falls back to `null`
 * (letting callers fall back to the default surface gradient) whenever the
 * image hasn't loaded yet or reading its pixels fails, e.g. because the
 * image is served cross-origin without CORS headers.
 */
export function useCoverColor(src: string | undefined | null): string | null {
  const [color, setColor] = useState<string | null>(() => (src ? (cache.get(src) ?? null) : null));

  useEffect(() => {
    if (!src) {
      setColor(null);
      return;
    }
    if (cache.has(src)) {
      setColor(cache.get(src) ?? null);
      return;
    }
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 16;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2d context unavailable");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 200) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n += 1;
        }
        if (n === 0) throw new Error("no opaque pixels sampled");
        const hex = `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`;
        cache.set(src, hex);
        if (!cancelled) setColor(hex);
      } catch {
        // Cross-origin covers taint the canvas and throw on getImageData —
        // gracefully fall back to the default gradient instead.
        cache.set(src, null);
        if (!cancelled) setColor(null);
      }
    };
    img.onerror = () => {
      cache.set(src, null);
      if (!cancelled) setColor(null);
    };
    return () => {
      cancelled = true;
    };
  }, [src]);

  return color;
}
