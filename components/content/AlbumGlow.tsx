"use client";

import { useCoverColor } from "@/components/audio/useCoverColor";

/** Full-bleed soft gradient tinted with the album cover's dominant colour,
 * positioned behind the page content. Falls back to the default surface
 * gradient when the cover can't be sampled (e.g. cross-origin). */
export function AlbumGlow({ src }: { src: string }) {
  const color = useCoverColor(src);
  return (
    <div
      aria-hidden
      className="cover-gradient pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]"
      style={color ? ({ "--cover-color": color } as React.CSSProperties) : undefined}
    />
  );
}
