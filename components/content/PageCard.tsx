import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { ImageAsset } from "@/lib/content-types";
import { IconFilm } from "@/components/icons/Icons";

/** Spotify-style card for a show or film, linking to its detail page. */
export function PageCard({
  href,
  title,
  image,
}: {
  href: string;
  title: string;
  image?: ImageAsset;
}) {
  return (
    <Link href={href} className="tap-scale group w-40 flex-shrink-0 snap-start sm:w-52">
      <div className="overflow-hidden rounded-xl bg-[var(--surface-strong)] shadow-[var(--shadow-card)] transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-elevated)]">
        {image ? (
          <Image
            src={image.localSrc || image.src}
            alt={image.alt || title}
            width={320}
            height={200}
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center text-[var(--foreground-muted)]">
            <IconFilm className="h-8 w-8" />
          </div>
        )}
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm font-semibold text-[var(--foreground)]">{title}</p>
    </Link>
  );
}
