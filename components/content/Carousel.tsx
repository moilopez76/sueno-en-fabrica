import type { ReactNode } from "react";

/** Horizontally scrolling row of cards, Spotify-style. */
export function Carousel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="my-8">
      <h2 className="mb-3 text-lg font-bold text-[var(--foreground)] sm:text-xl">{title}</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">{children}</div>
    </section>
  );
}
