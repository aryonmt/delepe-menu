import { MEDIA_DEFAULT_WIDTH, type MediaWidth, MEDIA_WIDTHS } from "./constants";

/**
 * Builds a public media URL for the pre-generated WebP variants.
 * Unknown widths are coerced to the nearest valid variant.
 */
export function mediaUrl(mediaId: string, width: number): string {
  const w = toMediaWidth(width);
  return `/media/${mediaId}?w=${String(w)}`;
}

function toMediaWidth(width: number): MediaWidth {
  if ((MEDIA_WIDTHS as readonly number[]).includes(width)) {
    return width as MediaWidth;
  }
  if (width <= 320) {
    return 320;
  }
  if (width <= 640) {
    return 640;
  }
  return 960;
}

/** Valid widths for the /media route. */
export function isValidMediaWidth(value: number): value is MediaWidth {
  return (MEDIA_WIDTHS as readonly number[]).includes(value);
}

export function parseMediaWidth(param: string | null): MediaWidth {
  if (!param) {
    return MEDIA_DEFAULT_WIDTH;
  }
  const parsed = Number.parseInt(param, 10);
  if (Number.isNaN(parsed) || !isValidMediaWidth(parsed)) {
    return MEDIA_DEFAULT_WIDTH;
  }
  return parsed;
}
