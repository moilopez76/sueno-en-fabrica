import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { ImageAsset } from "@/lib/content-types";

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
    <Link href={href} className="group w-44 flex-shrink-0 sm:w-52">
      <div className="overflow-hidden rounded-lg bg-[var(--surface-strong)] shadow-sm transition-transform group-hover:-translate-y-1">
        {image ? (
          <Image
            src={image.localSrc || image.src}
            alt={image.alt || title}
            width={320}
            height={200}
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center text-3xl">🎵</div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold text-[var(--foreground)]">{title}</p>
    </Link>
  );
}
