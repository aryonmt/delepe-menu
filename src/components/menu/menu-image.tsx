"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaDto } from "@/application/dtos";
import { mediaUrl } from "@/lib/media-url";

type Props = {
  media: MediaDto | null;
  alt: string;
  priority?: boolean;
  muted?: boolean;
  /** Fill an explicitly-sized parent (1:1 crops via object-fit). */
  fill?: boolean;
  sizes?: string;
  objectPosition?: string;
};

function loaderFor(width: number): number {
  if (width <= 320) return 320;
  if (width <= 640) return 640;
  return 960;
}

function imageLoader({ src, width }: { src: string; width: number }): string {
  const w = loaderFor(width);
  const id = src.includes("/media/")
    ? (src.split("/media/")[1]?.split("?")[0] ?? src)
    : src;
  return mediaUrl(id, w);
}

export function MenuImage({
  media,
  alt,
  priority = false,
  muted = false,
  fill = false,
  sizes = "(max-width: 768px) 160px, 200px",
  objectPosition = "center",
}: Props) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!media || hasError) {
    return (
      <div
        className="flex h-full w-full items-center justify-center rounded-image border border-line bg-card-2"
        aria-hidden="true"
      >
        <span className="font-display text-xl text-ornament opacity-60">✦</span>
      </div>
    );
  }

  const imageClassName = `object-cover transition-opacity duration-base ease-brand ${
    isLoaded ? "opacity-100" : "opacity-0"
  } ${muted ? "grayscale opacity-55" : ""}`;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-image"
      style={{ backgroundColor: media.dominantColor }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-y-0 start-0 w-2/3"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
              animation: "shimmer 1.4s ease-in-out infinite",
            }}
          />
        </div>
      )}
      {fill ? (
        <Image
          loader={imageLoader}
          src={mediaUrl(media.id, 640)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={imageClassName}
          style={{ objectPosition }}
        />
      ) : (
        <Image
          loader={imageLoader}
          src={mediaUrl(media.id, 640)}
          alt={alt}
          width={640}
          height={640}
          sizes={sizes}
          priority={priority}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`h-full w-full ${imageClassName}`}
        />
      )}
      {/* Warm unifying grade: melts any photo into the brand's warm world */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(13,10,7,0.45) 0%, rgba(13,10,7,0.08) 45%, transparent 70%)",
        }}
      />
    </div>
  );
}