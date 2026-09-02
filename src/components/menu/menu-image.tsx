"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaDto } from "@/application/dtos";
import { mediaUrl } from "@/lib/media-url";

type Props = {
  media: MediaDto | null;
  alt: string;
  priority?: boolean;
  isMuted?: boolean;
};

function loaderFor(width: number): number {
  if (width <= 320) {
    return 320;
  }
  if (width <= 640) {
    return 640;
  }
  return 960;
}

function imageLoader({ src, width }: { src: string; width: number }): string {
  const w = loaderFor(width);
  const id = src.includes("/media/")
    ? (src.split("/media/")[1]?.split("?")[0] ?? src)
    : src;
  return mediaUrl(id, w);
}

export function MenuImage({ media, alt, priority = false, isMuted = false }: Props) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!media || hasError) {
    return (
      <div
        className="flex h-full w-full items-center justify-center rounded-image bg-muted text-ornament"
        aria-hidden="true"
      >
        <span className="font-display text-2xl">✦</span>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-image"
      style={{ backgroundColor: media.dominantColor }}
    >
      {/* shimmer overlay while loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent"
          aria-hidden="true"
        />
      )}
      <Image
        loader={imageLoader}
        src={mediaUrl(media.id, 640)}
        alt={alt}
        width={640}
        height={480}
        sizes="(max-width: 768px) 104px, 140px"
        priority={priority}
        unoptimized
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${isMuted ? "grayscale opacity-[0.55]" : ""}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
