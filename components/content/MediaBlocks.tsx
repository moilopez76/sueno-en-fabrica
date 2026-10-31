import Image from "next/image";
import type { VideoEmbed } from "@/lib/content-types";

function embedUrl(video: VideoEmbed): string | null {
  switch (video.provider) {
    case "youtube": {
      const match = video.url.match(/(?:embed\/|v=|youtu\.be\/)([\w-]{6,})/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : video.url;
    }
    case "vimeo": {
      const match = video.url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : video.url;
    }
    case "spotify":
      return video.url;
    default:
      return video.url;
  }
}

/** Renders YouTube/Vimeo/Spotify embeds extracted from the old pages. */
export function VideoEmbeds({ videos }: { videos: VideoEmbed[] }) {
  if (videos.length === 0) return null;
  return (
    <div className="my-6 grid gap-4 sm:grid-cols-2">
      {videos.map((video, i) => {
        const src = embedUrl(video);
        if (!src) return null;
        return (
          <div
            key={`${video.provider}-${i}`}
            className={video.provider === "spotify" ? "h-[352px] w-full" : "aspect-video w-full"}
          >
            <iframe
              src={src}
              title={video.title ?? `${video.provider} video ${i + 1}`}
              className="h-full w-full rounded-lg border-0"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        );
      })}
    </div>
  );
}

export function Gallery({ images, label }: { images: { src: string; localSrc: string; alt: string; caption?: string }[]; label: string }) {
  if (images.length === 0) return null;
  return (
    <section className="my-6" aria-label={label}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <figure key={i} className="overflow-hidden rounded-lg bg-[var(--surface-strong)]">
            <Image
              src={img.localSrc || img.src}
              alt={img.alt || label}
              width={320}
              height={240}
              className="h-full w-full object-cover"
            />
            {img.caption && (
              <figcaption className="px-2 py-1 text-xs text-[var(--foreground-muted)]">{img.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
