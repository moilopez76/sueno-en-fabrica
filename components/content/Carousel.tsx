import type { ReactNode } from "react";

/** Horizontally scrolling row of cards, Spotify-style, with snap scrolling. */
export function Carousel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="my-8">
      <h2 className="mb-3 text-xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-2xl">{title}</h2>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-0.5">{children}</div>
    </section>
  );
}
